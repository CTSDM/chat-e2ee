import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";
import db from "../db/queries.js";

function isMessage(data) {
    // depending on the size of the ArrBuffer sent by the client we know what type of information
    // if it's greater than 512 bytes, we know it contains a message
    // Everything that is not a message, it is JSON encoded
    if (data.byteLength < 512) {
        return false;
    } else {
        return true;
    }
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
            // code 300 means we have some updates
            messagesDB.forEach((messageDB) => {
                const message = groupMessageInformation(
                    200,
                    messageDB.sender,
                    messageDB.content,
                    messageDB.date,
                );
                socket.send(message.buffer);
            });
        }
        await db.deleteMessages(publicUsername);
    } else if (messageClient.type === "register") {
        socket.target = messageClient.publicUsername;
    } else {
        console.log("invalid message");
        console.log(messageObj);
    }
}

async function send(sockets, socket, data) {
    // a couple of assertions in here...
    if (sockets[socket.target]) {
        const message = groupMessageInformation(200, socket.publicUsername, new Uint8Array(data));
        sockets[socket.target].send(message.buffer);
    } else {
        // user is offline
        // we store the message in the db
        await db.createMessage({
            receiver: socket.target,
            sender: socket.publicUsername,
            content: new Uint8Array(data),
        });
    }
}

function groupMessageInformation(code, origin, dataArray) {
    // code is integer
    // origin is string
    // dataArray is Uint8Array
    const codeArray = dataManipulation.intToUint8Array(code);
    const originArray = dataManipulation.stringToUint8Array(origin);
    const message = dataManipulation.concatUint8Arr([codeArray, originArray, dataArray]);
    return message;
}

async function close(sockets, socket) {
    console.log("closing connection");
    delete sockets[socket.publicUsername];
}

export default { isMessage, setup, close, send };
