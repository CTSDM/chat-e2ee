import { env } from "../../config/config.js";
import { WebSocketServer } from "ws";
import socketUtils from "./socketUtils.js";
import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";
import jwt from "jsonwebtoken";
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
            const token = cookies["refresh-token"];
            if (token) {
                try {
                    const tokenDB = await db.getToken(cookies["refresh-token"]);
                    if (!tokenDB) throw new Error("token not found");
                    const payload = jwt.verify(token, env.secretRefreshToken);
                    const user = {
                        id: payload.id,
                        publicUsername: payload.publicUsername,
                        privateUsername: payload.privateUsername,
                    };
                    console.log(`Connection upgraded to ws for the user: ${user.privateUsername}`);
                    wss.handleUpgrade(request, socket, head, (ws) => {
                        request.user = user;
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
    }

    async function socketOnMessage(data, socket, promiseHandler) {
        // the first byte of data is the flag to indicate what kind of message it is
        // 0 -> setup message, 1 -> regular direct message, 2 -> acknowledge read message
        const flagByte = socketUtils.getMessageType(data);
        const publicUsername = socket.user.publicUsername;
        const usernameLC = publicUsername.toLowerCase();
        const userId = socket.user.id;
        const dataUse = data.slice(1);
        if (flagByte === 0) {
            socketUtils.setup(sockets, socket, dataUse);
            // we send the groups to the user as if the group was recently created
            socketUtils.sendGroupOnStartup(socket, usernameLC);
            // we send all the relevant messages to the user on the first login!
            socketUtils.sendMessageHistory(sockets, userId, publicUsername);
            socketUtils.sendGroupMessageHistory(sockets, userId, publicUsername, promiseHandler);
        }
        if (flagByte === 1 || flagByte === 2) {
            // sockets, senderInfoStr, socket, target, data, flagByte, groupID = null
            socketUtils.sendMessage(sockets, socket, dataUse, usernameLC, flagByte, promiseHandler);
        }
        if (flagByte === 3) {
            // with this message we add the different users to the socket obj
            socketUtils.createGroup(sockets, socket, userId, dataUse, promiseHandler);
        }
        if (flagByte === 4) {
            // encrypted keys are saved to the database
            // a message is also sent to the user with the group information
            const groupIdBuff = dataUse.slice(0, 48);
            const groupId = dataManipulation.arrBufferToString(groupIdBuff);
            const username = dataManipulation.arrBufferToString(dataUse.slice(48, 64));
            const iv = new Uint8Array(dataUse.slice(64, 76));
            const key = new Uint8Array(dataUse.slice(76, 124));
            const isKeyFinal = !!dataManipulation.getNumFromBuffer(dataUse.slice(124));
            sockets[groupId].members.push(username);
            socket.groups[groupId].members.push({ groupId });
            socket.groups[groupId].keys.push({ groupId, key, iv, finalKey: isKeyFinal });
            socket.groups[groupId].ws.push({ username, isKeyFinal, groupIdBuff });
        }
        if (flagByte === 5) {
            // the group members are added as a batch to the database
            const groupIdBuff = data.slice(1, 49);
            const groupId = dataManipulation.arrBufferToString(groupIdBuff);
            const usernameArr = [];
            const groupInfo = socket.groups[groupId];
            groupInfo.ws.forEach((entry) => usernameArr.push(entry.username));
            const users = await db.getUserIdsByPublicUsername(usernameArr);
            groupInfo.ws.forEach((entry, index) => {
                groupInfo.members[index].userId = users[entry.username];
                groupInfo.keys[index].userId = users[entry.username];
            });
            // once the group is created we delete the entry for groupInfo to free memory
            await socketUtils.addGroupMember(sockets, groupInfo, promiseHandler, groupId);
            delete socket.groups[groupId];
        }
    }

    function onConnection(socket, request) {
        const promiseHandler = {};
        socket.binaryType = "arraybuffer";
        socket.user = request.user;
        socket.groups = {};
        socket.on("message", (data) => socketOnMessage(data, socket, promiseHandler));
        socket.on("close", () => {
            console.log(`Closing the connection for user: ${socket.user.publicUsername}`);
            socketUtils.close(sockets, socket);
        });
    }
}
