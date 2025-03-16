import crypto from "node:crypto";

async function importKey(keyJSON) {
    const publicKeyToBeImportedJWK = JSON.parse(keyJSON);
    let key;
    try {
        key = await crypto.webcrypto.subtle.importKey(
            "jwk",
            publicKeyToBeImportedJWK,
            {
                name: "ECDH",
                namedCurve: "P-256",
            },
            true,
            [],
        );
    } catch (err) {
        return false;
    } finally {
        return key;
    }
}

function getRandomValues(length) {
    return crypto.getRandomValues(new Uint8Array(length));
}

async function isPublicKey(key) {
    if (key.type !== "public") return false;
    if (key.usages.length !== 1) return false;
    if (key.usages[0] !== "encrypt") return false;
    if (key.algorithm.namedCurve !== "P-256") return false;
    if (key.algorithm.name !== "ECDH") return false;
    return true;
}

export default { isPublicKey, importKey, getRandomValues };
