import { WebSocketServer } from "ws";
import socketUtils from "./socketUtils.js";
import webSocketHandlers from "./webSocketHandlers.js";

export default function startWebsockets(server) {
    const sockets = {};
    const ws = new WebSocketServer({ server });
    ws.on("connection", (socket, req) => {
        webSocketHandlers.connection(socket, req);
        socket.on("message", async (data) => {
            // the first byte of data is the flag to indicate what kind of message it is
            // 0 -> setup message, 1 -> 2 regular message, 3 -> acknowledge read message
            const messageType = socketUtils.getMessageType(data);
            if (messageType === 0) {
                socketUtils.setup(sockets, socket, data.slice(1));
            } else if (messageType === 1) {
                socketUtils.send(sockets, socket, data.slice(1), 1);
            } else if (messageType === 2) {
                socketUtils.send(sockets, socket, data.slice(1), 2);
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
