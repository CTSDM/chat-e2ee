import jwt from "jsonwebtoken";
import db from "../db/queries.js";
import { env } from "../../config/config.js";

function validate(validated, userId) {
    // we check that the validated object exists matches the current userId and check the expiration
    if (!validated[userId]) return false;
    if (validated[userId].id !== userId || validated[userId].expiration < new Date()) {
        return false;
    }
    return true;
}

async function createValidation(cookieHeader, promiseHandler, memoryValidation) {
    // We verify the refresh token and we check it against the database
    const refreshToken = getRefreshToken(cookieHeader);
    let id;
    try {
        // If the browser has no refresh token we do not validate the connection
        if (!refreshToken) return null;
        const payload = jwt.verify(refreshToken, env.secretRefreshToken);
        id = payload.id;
        promiseHandler[id] = db.getRefreshToken(refreshToken);
        const tokenDB = await promiseHandler[id];
        if (!tokenDB) return null;
        memoryValidation[id] = getValidityStatus(id, payload.exp);
        return setUserInformation(payload);
    } catch (err) {
        console.log(err);
        return null;
    } finally {
        if (id);
        promiseHandler[id] = null;
        delete promiseHandler[id];
    }
}

function getRefreshToken(cookieHeader) {
    const cookies = {};
    cookieHeader.split(";").forEach((cookie) => {
        const parts = cookie.split("=");
        const name = parts[0].trim();
        const value = parts[1].trim();
        cookies[name] = value;
    });
    const refreshToken = cookies["refresh-token"];
    return refreshToken;
}

function getValidityStatus(id, expiration) {
    return { id, expiration: new Date(expiration * 1000) };
}

function setUserInformation(payload) {
    return {
        id: payload.id,
        publicUsername: payload.publicUsername,
        privateUsername: payload.privateUsername,
    };
}

export default { createValidation, validate };
