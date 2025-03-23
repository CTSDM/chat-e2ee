import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";

// 2 byte for message status -> Will be encoded as Uint16Array so it doesn't overflow
// the rest of the data will be the message!
function connection(socket, req) {
    socket.binaryType = "arraybuffer";
    if (req.headers.origin.includes("localhost:5173") === false) {
        socket.send(dataManipulation.intToBuffer(100));
        socket.terminate();
        console.log("Connection not allowed, origin not in the whitelist.");
    } else {
        socket.send(dataManipulation.intToBuffer(50));
    }
}

function close(sockets) {
    sockets = null;
}

export default { connection, close };
