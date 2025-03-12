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
            if (socketUtils.isMessage(data) === false) {
                socketUtils.setup(sockets, socket, data.slice(1));
            } else {
                socketUtils.send(sockets, socket, data.slice(1));
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
