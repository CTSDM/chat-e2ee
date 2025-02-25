import jwt from "jsonwebtoken";
import db from "../src/db/queries.js";
import { env } from "../config/config.js";

async function createTokens(req, res, next) {
    try {
        await createRefreshToken(req, res);
        createAccessToken(req, res);
        next();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
    next();
}

async function createRefreshToken(req, res) {
    const expiration = 60 * 60 * 24; // 24 hours
    const token = signToken(req, env.secretRefreshToken, { expiresIn: expiration });
    await db.createToken(token, req.user.id);
    res.cookie("refresh-token", token, { ...env.cookie.options });
    return;
}

function createAccessToken(req, res) {
    const expiration = 60 * 3; // 3 minutes
    const token = signToken(req, env.secretAccessToken, { expiresIn: expiration });
    res.cookie("access-token", token, { ...env.cookie.options });
    return;
}

function signToken(req, secret, options) {
    const payload = {
        publicUsername: req.user.publicUsername,
    };
    return jwt.sign(payload, secret, options);
}

export default { createTokens };
