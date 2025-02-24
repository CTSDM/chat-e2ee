function objToUint8(obj) {
    const arr = Object.values(obj);
    try {
        return new Uint8Array(arr);
    } catch {
        return false;
    }
}

export default { objToUint8 };
