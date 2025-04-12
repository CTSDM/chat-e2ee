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
    groupIds.forEach((entry) => {
        sendGroupInformation(socket, entry.groupId);
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

async function createGroup(sockets, socket, userId, data, promiseHandler) {
    const groupId = dataManipulation.arrBufferToString(data.slice(0, 48));
    const groupName = dataManipulation.arrBufferToString(data.slice(48, 98));
    const date = dataManipulation.getDateFromBuffer(data.slice(98, 114));
    sockets[groupId] = { name: groupName, id: groupId, participants: [] };
    // ws will store the information needed that needs to be sent to the user through ws once all members keys are saved
    socket.groups[groupId] = { members: [], keys: [], ws: [] };
    try {
        promiseHandler[groupId] = db.createGroup(groupId, groupName, userId, date);
        await promiseHandler[groupId];
        promiseHandler[groupId] = null;
    } catch (err) {
        console.log(err);
    }
}

async function sendDirectMessage(sockets, senderInfoStr, socket, target, data, flagByte) {
    // the information to send depends if it is a direct message or a group message
    // the sender information will take 48 bytes
    // check the user is online
    // we need to check if receiver is online
    if (sockets[target]) {
        const message = groupMessageInformation(flagByte, senderInfoStr, new Uint8Array(data));
        sockets[target].send(message.buffer);
    }
    let offsetBytes = 16;
    const messageId = dataManipulation.arrBufferToString(data.slice(offsetBytes, offsetBytes + 36));
    offsetBytes += 36 + 1; // this extra one is due to the padding use for the read status
    const date = dataManipulation.getDateFromBuffer(data.slice(offsetBytes, offsetBytes + 16));
    offsetBytes += 16;
    const iv = data.slice(offsetBytes, offsetBytes + 12);
    offsetBytes += 12;
    const content = data.slice(offsetBytes);
    (async () => {
        const userIdSender = (await db.getUserByPublicUsername(socket.user.publicUsername)).id;
        const userIdReceiver = (await db.getUserByPublicUsername(target)).id;
        if (flagByte === 1) {
            try {
                await db.createDirectMessage(
                    messageId,
                    userIdSender,
                    userIdReceiver,
                    date,
                    new Uint8Array(iv),
                    new Uint8Array(content),
                );
            } catch (err) {
                console.log(err);
                throw new Error("error");
            }
        } else if (flagByte === 2) {
            // for direct we set the message read status to true
            try {
                const status = await db.updateDirectMessageReadStatus(messageId);
                if (status) return true;
            } catch (err) {
                console.log(err);
            }
        }
    })();
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

function sendGroupMessage(sockets, groupID, data, flagByte, sender) {
    sockets[groupID].participants.forEach((username) => {
        if (sender !== username) {
            const groupIDArr = dataManipulation.stringToUint8Array(groupID, 48);
            const message = groupMessageInformation(flagByte, groupIDArr, new Uint8Array(data));
            sockets[username].send(message);
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
    delete sockets[socket.user.publicUsername];
}

export default {
    getMessageType,
    setup,
    createGroup,
    addGroupMember,
    close,
    sendDirectMessage,
    sendGroupMessage,
    sendMessageHistory,
    sendGroupOnStartup,
};
