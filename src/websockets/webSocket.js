import { WebSocketServer } from "ws";
import socketUtils from "./socketUtils.js";
import webSocketHandlers from "./webSocketHandlers.js";
import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";

export default function startWebsockets(server) {
    const sockets = {};
    const ws = new WebSocketServer({ server });
    ws.on("connection", (socket, req) => {
        webSocketHandlers.connection(socket, req);
        socket.on("message", async (data) => {
            // the first byte of data is the flag to indicate what kind of message it is
            // 0 -> setup message, 1 -> regular direct message, 2 -> acknowledge read message
            const messageType = socketUtils.getMessageType(data);
            if (messageType === 0) {
                socketUtils.setup(sockets, socket, data.slice(1));
            } else if (messageType >= 1) {
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
        });
        socket.on("close", async () => {
            socketUtils.close(sockets, socket);
        });
    });

    ws.on("close", () => {
        webSocketHandlers.close(sockets);
    });
}
