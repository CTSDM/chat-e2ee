function stringToUint8(stringArr) {
    try {
        const arr = JSON.parse(stringArr);
        return new Uint8Array(arr);
    } catch {
        return false;
    }
}

function stringToBuffer(stringArr) {
    try {
        const arr = JSON.parse(stringArr);
        const buffer = Buffer.from(arr);
        return buffer;
    } catch {
        return false;
    }
}

export default { stringToUint8, stringToBuffer };
