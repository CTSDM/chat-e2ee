import { env } from "../../config/config.js";
import { WebSocketServer } from "ws";
import socketUtils from "./socketUtils.js";
import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";
import db from "../db/queries.js";

export default function startWebsockets(server) {
    const sockets = {};
    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", onUpgrade);
    wss.on("connection", onConnection);
    wss.on("close", () => (sockets = null));

    async function onUpgrade(request, socket, head) {
        // The server will upgrade to ws if the origin and user credentials are correct
        let message = "Upgrade refused. Reason: Missing or wrong credentials.";
        let allowConnection = true;
        if (request.headers.origin.includes(env.allowedOrigin) === false) {
            message = "Upgrade refused. Reason: Origin not in the whitelist.";
            allowConnection = false;
        }
        const cookieHeader = request.headers.cookie;
        if (allowConnection && cookieHeader) {
            const cookies = {};
            cookieHeader.split(";").forEach((cookie) => {
                const parts = cookie.split("=");
                const name = parts[0].trim();
                const value = parts[1].trim();
                cookies[name] = value;
            });
            // if connection is authenticated we upgrade the connection
            // we check the refresh token against the db
            if (cookies["refresh-token"]) {
                try {
                    const token = await db.getToken(cookies["refresh-token"]);
                    const user = await db.getUser("id", token.userId);
                    console.log(`Connection upgraded to ws for the user: ${user.publicUsername}`);
                    wss.handleUpgrade(request, socket, head, (ws) => {
                        wss.emit("connection", ws, request);
                    });
                    return;
                } catch (err) {
                    console.log(err);
                }
            }
        }
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        console.log(message);
    }

    async function socketOnMessage(data, socket) {
        // the first byte of data is the flag to indicate what kind of message it is
        // 0 -> setup message, 1 -> regular direct message, 2 -> acknowledge read message
        const messageType = socketUtils.getMessageType(data);
        if (messageType === 0) {
            socketUtils.setup(sockets, socket, data.slice(1));
        }
        if (messageType === 1 || messageType === 2) {
            // sockets, senderInfoStr, socket, target, data, flagByte, groupID = null
            const target = dataManipulation.arrBufferToString(data.slice(1, 49));
            const senderInfoStr = dataManipulation.stringToUint8Array(socket.publicUsername, 48); // must be 48 bytes being the last 16 bytes the user info
            socketUtils.sendDirectMessage(
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
    }

    function onConnection(socket) {
        socket.binaryType = "arraybuffer";
        socket.on("message", (data) => socketOnMessage(data, socket));
        socket.on("close", () => {
            console.log(`Closing the connection for user: ${socket.publicUsername}`);
            socketUtils.close(sockets, socket);
        });
    }
}
