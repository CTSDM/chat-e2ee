import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";
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
        sockets[socket.user.publicUsername] = socket;
    } else {
        console.log("invalid message");
    }
}

async function saveGroupSymmKey(publicUsername, data) {
    // we save the key in the database
    const targetLength = 48;
    const ivLength = 12;
    const groupID = dataManipulation.arrBufferToString(data.slice(1, 1 + targetLength));
    const iv = new Uint8Array(data.slice(1 + targetLength, 1 + targetLength + ivLength));
    const key = new Uint8Array(data.slice(1 + targetLength + ivLength));
    await db.createKeyGroup(publicUsername, groupID, iv, key);
}

function addGroupParticipants(sockets, data) {
    const targetLength = 48;
    const [groupID, name] = getInfoPairsFromBuffer(data.slice(1), targetLength);
    sockets[groupID].participants.push(name);
}

function sendKey(sockets, socket, data) {
    // this is for group messages
    const targetLength = 48;
    const receiverLength = 16;
    const flagByte = new Uint8Array(data.slice(0))[0];
    const [groupID] = getInfoPairsFromBuffer(data.slice(1), targetLength);
    const [receiver] = getInfoPairsFromBuffer(data.slice(1 + targetLength), receiverLength);
    const groupIDArr = dataManipulation.stringToUint8Array(groupID, 48); // must be 48 bytes being the last 16 bytes the user info
    const groupName = dataManipulation.stringToUint8Array(sockets[groupID].name, 50); // must be 48 bytes being the last 16 bytes the user info
    const sender = dataManipulation.stringToUint8Array(socket.user.publicUsername, 16); // username at most can be 16 bytes
    const ivKey = data.slice(1 + targetLength + receiverLength);
    const infoGroupArr = new Uint8Array([...groupIDArr, ...groupName, ...sender]);
    sendGroupMessage(sockets, infoGroupArr, socket, receiver, ivKey, flagByte);
}

function setupGroupMessage(sockets, data) {
    const targetLength = 48;
    const [groupID, name] = getInfoPairsFromBuffer(data.slice(1), targetLength);
    sockets[groupID] = { name: name, id: groupID, participants: [] };
}

function getInfoPairsFromBuffer(data, len) {
    const str1 = dataManipulation.arrBufferToString(data.slice(0, len));
    const str2 = dataManipulation.arrBufferToString(data.slice(len));
    return [str1, str2];
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
    const messageID = dataManipulation.arrBufferToString(data.slice(offsetBytes, offsetBytes + 36));
    offsetBytes += 36;
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
                    messageID,
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
        }
    })();
}

async function sendMessageHistory(sockets, userId, publicUsername) {
    const messages = await db.getDirectMessages(userId);
    const flagByte = 1;
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
            dataManipulation.stringToUint8Array(dateTime, 16),
            messages[i].iv,
            messages[i].contentEncrypted,
        ]);
        const messageToSent = groupMessageInformation(flagByte, contextArr, new Uint8Array(data));
        sockets[publicUsername].send(messageToSent.buffer);
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
    setupGroupMessage,
    saveGroupSymmKey,
    addGroupParticipants,
    close,
    sendDirectMessage,
    sendKey,
    sendGroupMessage,
    sendMessageHistory,
};
