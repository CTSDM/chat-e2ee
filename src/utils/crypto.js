import crypto from "node:crypto";

async function importKey(keyJSON) {
    const publicKeyToBeImportedJWK = JSON.parse(keyJSON);
    let key;
    try {
        key = await crypto.webcrypto.subtle.importKey(
            "jwk",
            publicKeyToBeImportedJWK,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["encrypt"],
        );
    } catch (err) {
        console.log(err);
        return false;
    } finally {
        return key;
    }
}

async function isPublicKey(key) {
    if (key.type !== "public") return false;
    if (key.usages.length !== 1) return false;
    if (key.usages[0] !== "encrypt") return false;
    if (key.algorithm.hash.name !== "SHA-256") return false;
    if (key.algorithm.name !== "RSA-OAEP") return false;
    if (key.algorithm.modulusLength !== 4096) return false;
    return true;
}

const cryptoUtils = {
    isPublicKey: isPublicKey,
    importKey: importKey,
};

export default cryptoUtils;
