import { WebSocketServer } from "ws";
import socketUtils from "./socketUtils.js";
import webSocketHandlers from "./webSocketHandlers.js";
import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";

export default function startWebsockets(server) {
    const sockets = {};
    const ws = new WebSocketServer({ server });
    ws.on("connection", (socket, req) => {
        webSocketHandlers.connection(socket, req);
        socket.binaryType = "arraybuffer";
        if (req.headers.origin.includes("localhost:5173") === false) {
            socket.send(dataManipulation.stringToBuffer("closing connection because not allowed"));
            socket.terminate();
            console.log("not allowed");
        } else {
            socket.send(dataManipulation.stringToBuffer("success"));
        }
        socket.on("message", async (data) => {
            if (socketUtils.isMessage(data) === false) {
                socketUtils.setup(sockets, socket, data);
            } else {
                socketUtils.send(sockets, socket, data);
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
