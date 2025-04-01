import { WebSocketServer } from "ws";
import socketUtils from "./socketUtils.js";
import webSocketHandlers from "./webSocketHandlers.js";
import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";

export default function startWebsockets(server) {
    const sockets = {};
    const ws = new WebSocketServer({ server });
    ws.on("connection", (socket, req) => {
        webSocketHandlers.connection(socket, req);
        socket.on("upgrade", () => {
            console.log("hi");
        });
        socket.on("message", async (data) => {
            console.log(data);
            // the first byte of data is the flag to indicate what kind of message it is
            // 0 -> setup message, 1 -> regular direct message, 2 -> acknowledge read message
            const messageType = socketUtils.getMessageType(data);
            if (messageType === 0) {
                socketUtils.setup(sockets, socket, data.slice(1));
            }
            if (messageType === 1 || messageType === 2) {
                // sockets, senderInfoStr, socket, target, data, flagByte, groupID = null
                const target = dataManipulation.arrBufferToString(data.slice(1, 49));
                const senderInfoStr = dataManipulation.stringToUint8Array(
                    socket.publicUsername,
                    48,
                ); // must be 48 bytes being the last 16 bytes the user info
                socketUtils.send(
                    sockets,
                    senderInfoStr,
                    socket,
                    target,
                    data.slice(49),
                    messageType,
                );
            }
            if (messageType === 3) {
                // with this message we add the different users to the sockets obj
                socketUtils.addGroupParticipants(sockets, data);
            }
            if (messageType === 4) {
                socketUtils.sendKey(sockets, socket, data);
            }
            if (messageType === 5) {
                await socketUtils.saveGroupSymmKey(socket.publicUsername, data);
            }
            if (messageType === 6) {
                const groupID = dataManipulation.arrBufferToString(data.slice(1, 49));
                const sender = socket.publicUsername;
                const flagByte = 1;
                // the flagByte is the same as a regular message
                socketUtils.sendGroupMessage(sockets, groupID, data.slice(49), flagByte, sender);
            }
            if (messageType === 10) {
                // we register the new group
                // save its name
                // create empty array to add all the participants
                socketUtils.setupGroupMessage(sockets, data);
            }
        });
        socket.on("close", async () => {
            socketUtils.close(sockets, socket);
        });
    });

    ws.on("close", () => {
        webSocketHandlers.close(sockets);
    });
}
