import { cryptoUtils, dataManipulationUtils as dataManipulation } from "../utils/utils.js";
import db from "../db/queries.js";

function getMessageType(data) {
    // the first byte of the message will show whether the data is for setup or a message
    // 0 -> setup
    // 1 -> message
    const flagByte = dataManipulation.getNumFromBuffer(data.slice(0, 1));
    return flagByte;
}

async function setup(sockets, socket, data) {
    const dec = new TextDecoder();
    const messageClient = JSON.parse(dec.decode(data));
    if (messageClient.type === "start") {
        sockets[socket.user.publicUsername.toLowerCase()] = socket;
    } else {
        console.log("Invalid message in the initial setup.");
    }
}

async function sendGroupOnStartup(socket) {
    const groupIds = await db.getGroupIdsByUserId(socket.user.id);
    groupIds.forEach((id) => {
        sendGroupInformation(socket, id);
    });
}

function sendGroupInformation(socket, groupId) {
    const flagByte = 6;
    const padding = cryptoUtils.getRandomValues(12);
    const groupIdArr = dataManipulation.stringToUint8Array(groupId, 48);
    const message = groupMessageInformation(flagByte, groupIdArr, padding);
    socket.send(message.buffer);
}

async function addGroupMember(sockets, dataEntries, promiseHandler, groupId) {
    // We need to make sure that group has been already created
    // We add the users in batch
    if (promiseHandler[groupId]) {
        await promiseHandler[groupId];
    }
    try {
        await db.createGroupMemberAndGroupKeyBatch(dataEntries.members, dataEntries.keys);
    } catch (err) {
        console.log(err);
    }
    // the groupId will be sent to the each user, and the browser will request the information of the group
    // thus, we need to make sure all the groupMembers have been added before doing so
    dataEntries.ws.forEach((entry) => {
        if (entry.isKeyFinal === false && sockets[entry.username]) {
            // if the member is online and the key is not final we send their key
            // the information needed would be the groupId, iv, key and the creator username
            sendGroupInformation(sockets[entry.username], groupId);
        }
    });
}

async function initGroup(sockets, groupId) {
    // set up the corresponding sockets entry for the group
    const [membersArr, group] = await Promise.all([
        db.getGroupMembers(groupId),
        db.getGroup(groupId),
    ]);
    sockets[groupId] = { name: group.name, id: groupId, members: membersArr };
}

async function createGroup(sockets, socket, userId, data, promiseHandler) {
    const groupId = dataManipulation.arrBufferToString(data.slice(0, 48));
    const groupName = dataManipulation.arrBufferToString(data.slice(48, 98));
    const date = dataManipulation.getDateFromBuffer(data.slice(98, 114));
    sockets[groupId] = { name: groupName, id: groupId, members: [] };
    // ws will store the information needed that needs to be sent to the user through ws once all members keys are saved
    socket.groups[groupId] = { members: [], keys: [], ws: [] };
    try {
        promiseHandler[groupId] = db.createGroup(groupId, groupName, userId, date);
        await promiseHandler[groupId];
        promiseHandler[groupId] = null;
        delete promiseHandler[groupId];
    } catch (err) {
        console.log(err);
    }
}

async function saveGroupMessage(groupId, data, senderId, flagByte) {
    let offsetBytes = 16;
    const messageId = dataManipulation.arrBufferToString(data.slice(offsetBytes, offsetBytes + 36));
    offsetBytes += 36 + 1; // this extra one is due to the padding use for the read status
    const date = dataManipulation.getDateFromBuffer(data.slice(offsetBytes, offsetBytes + 16));
    offsetBytes += 16;
    if (flagByte === 1) {
        const iv = data.slice(offsetBytes, offsetBytes + 12);
        offsetBytes += 12;
        const content = data.slice(offsetBytes);
        try {
            await db.createGroupMessage(
                messageId,
                senderId,
                groupId,
                date,
                new Uint8Array(iv),
                new Uint8Array(content),
            );
        } catch (err) {
            console.log(err);
            throw new Error("error");
        }
    } else if (flagByte === 2) {
        try {
            // we first check if the state has already been saved
            const status = await db.getGroupMessageReadStatus(messageId, senderId);
            if (!status) await db.updateGroupMessageReadStatus(messageId, senderId, date);
        } catch (err) {
            console.log(err);
        }
    }
}

async function sendMessage(sockets, socket, data, username, flagByte, promiseHandlers) {
    // the information to send depends if it is a direct message or a group message
    // the sender information will take 48 bytes
    // check the user is online
    // we need to check if receiver is online
    const target = dataManipulation.arrBufferToString(data.slice(0, 48));
    const messageType = target.length === 36 ? "group" : "direct";
    const dataToSend = new Uint8Array(data.slice(48));
    let message;
    if (messageType === "group") {
        // we have to pull up all the members that belong to the group that are not the current user
        // the saveGroupMessage function can be done async
        saveGroupMessage(target, data.slice(48), socket.user.id, flagByte);
        sendGroupMessage(sockets, target, data.slice(48), flagByte, username, promiseHandlers);
    } else {
        // direct message
        if (sockets[target]) {
            // if the user is online we send the message
            const senderArr = dataManipulation.stringToUint8Array(username, 48);
            message = groupMessageInformation(flagByte, senderArr, dataToSend);
            sockets[target].send(message.buffer);
        }
        let offsetBytes = 16 + 48;
        const messageId = dataManipulation.arrBufferToString(
            data.slice(offsetBytes, offsetBytes + 36),
        );
        if (flagByte === 1) {
            offsetBytes += 36 + 1; // this extra one is due to the padding use for the read status
            const date = dataManipulation.getDateFromBuffer(
                data.slice(offsetBytes, offsetBytes + 16),
            );
            offsetBytes += 16;
            const iv = data.slice(offsetBytes, offsetBytes + 12);
            offsetBytes += 12;
            const content = data.slice(offsetBytes);
            // we save/update on different db tables
            const userIdReceiver = (await db.getUserByPublicUsername(target)).id;
            try {
                promiseHandlers[messageId] = db.createDirectMessage(
                    messageId,
                    socket.user.id,
                    userIdReceiver,
                    date,
                    new Uint8Array(iv),
                    new Uint8Array(content),
                );
                await promiseHandlers[messageId];
                delete promiseHandlers[messageId];
            } catch (err) {
                console.log(err);
                throw new Error("error");
            }
        } else if (flagByte === 2) {
            // for direct we set the message read status to true
            try {
                if (promiseHandlers[messageId]) await promiseHandlers[messageId];
                const status = await db.updateDirectMessageReadStatus(messageId);
                if (status) return true;
                else throw new Error(`Read status of message ${messageId} not properly updated`);
            } catch (err) {
                console.log(err);
            }
        }
    }
}

async function initGroups(sockets, userId, promiseHandlers) {
    const groupsId = await db.getGroupIdsByUserId(userId);
    for (let i = 0; i < groupsId.length; ++i) {
        const id = groupsId[i];
        if (!sockets[id]) {
            if (!promiseHandlers[id]) {
                promiseHandlers[id] = initGroup(sockets, id);
            }
            await promiseHandlers[id];
            promiseHandlers[id] = null;
            delete promiseHandlers[id];
        }
    }
}

async function sendGroupMessageHistory(sockets, userId, publicUsername, promiseHandlers) {
    // in here we are only sending the group message history to a given user
    // for that, we do not use sockets[groupId] to send the message but we initialize it
    // we will also send the read status of the messages
    const messages = await db.getGroupMessages(userId);
    initGroups(sockets, userId, promiseHandlers);
    const flagByte = 3;
    for (let i = 0; i < messages.length; ++i) {
        const bob = messages[i].User;
        const contextArr = dataManipulation.stringToUint8Array(messages[i].groupId, 48);
        const bobUsernameArr = dataManipulation.stringToUint8Array(bob.publicUsername, 16);
        const messageIdArr = dataManipulation.stringToUint8Array(messages[i].id);
        const dateTime = new Date(messages[i].createdAt).getTime();
        const data = dataManipulation.concatUint8Arr([
            bobUsernameArr,
            messageIdArr,
            dataManipulation.intToUint8Array(messages[i].readStatus ? 1 : 0, 1),
            dataManipulation.stringToUint8Array(dateTime, 16),
            messages[i].iv,
            messages[i].contentEncrypted,
        ]);
        const messageToSent = groupMessageInformation(flagByte, contextArr, data);
        sockets[publicUsername.toLowerCase()].send(messageToSent.buffer);
        // after sending the message we send its read status
        messages[i].GroupMessageReadStatus.forEach(async (infoStatus) => {
            const reader = (await db.getUser("id", infoStatus.userId)).publicUsername;
            const readerArr = dataManipulation.stringToUint8Array(reader, 16);
            const data = dataManipulation.concatUint8Arr([readerArr, messageIdArr]);
            const messageToSent = groupMessageInformation(2, contextArr, data);
            sockets[publicUsername.toLowerCase()].send(messageToSent.buffer);
        });
    }
}

async function sendMessageHistory(sockets, userId, publicUsername) {
    const messages = await db.getDirectMessages(userId);
    const flagByte = 3; // Used to recover direct messages
    for (let i = 0; i < messages.length; ++i) {
        const isSenderAuthor = messages[i].sentByUserId === userId ? true : false;
        const bobId = isSenderAuthor ? messages[i].receivedByUserId : messages[i].sentByUserId;
        const bob = await db.getUser("id", bobId);
        const bobUsernameLC = bob.publicUsername.toLowerCase();
        const contextArr = dataManipulation.stringToUint8Array(bobUsernameLC, 48);
        const bobUsernameArr = dataManipulation.stringToUint8Array(bob.publicUsername, 16);
        const senderArr = isSenderAuthor
            ? dataManipulation.stringToUint8Array(publicUsername, 16)
            : bobUsernameArr;
        const messageIdArr = dataManipulation.stringToUint8Array(messages[i].id);
        const dateTime = new Date(messages[i].createdAt).getTime();
        const data = dataManipulation.concatUint8Arr([
            senderArr,
            messageIdArr,
            dataManipulation.intToUint8Array(messages[i].readStatus ? 1 : 0, 1),
            dataManipulation.stringToUint8Array(dateTime, 16),
            messages[i].iv,
            messages[i].contentEncrypted,
        ]);
        const messageToSent = groupMessageInformation(flagByte, contextArr, new Uint8Array(data));
        sockets[publicUsername.toLowerCase()].send(messageToSent.buffer);
    }
}

async function sendGroupMessage(sockets, groupId, data, flagByte, sender, promiseHandlers) {
    // Before sending the message we check and if needed create the entry for sockets[groupId]
    if (!sockets[groupId]) {
        if (!promiseHandlers[groupId]) {
            promiseHandlers[groupId] = initGroup(sockets, groupId);
        }
        await promiseHandlers[groupId];
        promiseHandlers[groupId] = null;
        delete promiseHandlers[groupId];
    }

    sockets[groupId].members.forEach((username) => {
        // we only send the message if the members are online
        const usernameLC = username.toLowerCase();
        if (sockets[usernameLC]) {
            if (sender !== usernameLC) {
                const groupIDArr = dataManipulation.stringToUint8Array(groupId, 48);
                const message = groupMessageInformation(flagByte, groupIDArr, new Uint8Array(data));
                sockets[usernameLC].send(message);
            }
        }
    });
}

function groupMessageInformation(flagByte, origin, dataArray) {
    // code is integer
    // origin is uint8array
    // dataArray is Uint8Array
    const flagByteArray = dataManipulation.intToUint8Array(flagByte, 1);
    const message = dataManipulation.concatUint8Arr([flagByteArray, origin, dataArray]);
    return message;
}

async function close(sockets, socket) {
    socket.close();
    console.log(`${new Date()} closing connection`);
    if (sockets[socket.user.publicUsername]) delete sockets[socket.user.publicUsername];
}

export default {
    getMessageType,
    sendMessage,
    setup,
    createGroup,
    addGroupMember,
    close,
    sendGroupMessage,
    sendMessageHistory,
    sendGroupOnStartup,
    sendGroupMessageHistory,
};
