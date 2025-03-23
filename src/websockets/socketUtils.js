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
        const publicUsername = messageClient.publicUsername;
        sockets[publicUsername] = socket;
        socket.publicUsername = publicUsername;
        // we check if the user has messages pending from the DB.
        // for now we loop through all the remaining messages
        const messagesDB = await db.getMessages(publicUsername);
        if (messagesDB) {
            messagesDB.forEach((messageDB) => {
                const message = groupMessageInformation(
                    messageDB.flagByte,
                    messageDB.senderPublicUsername,
                    messageDB.content,
                );
                socket.send(message.buffer);
            });
        }
        await db.deleteMessages(publicUsername);
    } else {
        console.log("invalid message");
        console.log(messageObj);
    }
}

async function send(sockets, senderInfoStr, socket, target, data, flagByte, groupID = null) {
    // the information to send depends if it is a direct message or a group message
    // the sender information will take 48 bytes
    // check the user is online
    // we need to check if receiver is online
    if (sockets[target]) {
        const message = groupMessageInformation(flagByte, senderInfoStr, new Uint8Array(data));
        sockets[target].send(message.buffer);
    } else {
        // user is offline
        // we store the message in the db
        await db.createMessage({
            flagByte: flagByte,
            groupID: groupID,
            receiver: target,
            sender: socket.publicUsername,
            content: new Uint8Array(data),
        });
    }
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
    console.log(`${new Date()} closing connection`);
    delete sockets[socket.publicUsername];
}

export default { getMessageType, setup, close, send };
