import jwt from "jsonwebtoken";
import db from "../src/db/queries.js";
import { env } from "../config/config.js";
import passport from "passport";

async function createTokens(req, res, next) {
    try {
        await createRefreshToken(req, res);
        createAccessToken(req, res);
        next();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
}

async function createRefreshToken(req, res) {
    const expiration = 60 * 60 * 24; // 24 hours
    const token = signToken(req, env.secretRefreshToken, { expiresIn: expiration });
    await db.createToken(token, req.user.id);
    res.cookie("refresh-token", token, { ...env.cookie.options, maxAge: env.cookie.maxAge });
    return;
}

function createAccessToken(req, res) {
    const expiration = 60 * 3; // 3 minutes
    const token = signToken(req, env.secretAccessToken, { expiresIn: expiration });
    res.cookie("access-token", token, { ...env.cookie.options, maxAge: env.cookie.maxAge });
    return;
}

function signToken(req, secret, options) {
    const payload = {
        publicUsername: req.user.publicUsername,
        privateUsername: req.user.privateUsername,
        id: req.user.id,
    };
    return jwt.sign(payload, secret, options);
}

async function checkRefreshToken(req) {
    const token = req.cookies["refresh-token"];
    if (!token) {
        return false;
    }
    const tokenDB = token ? await db.getToken(token) : null;
    if (tokenDB === null) {
        return false;
    }
    try {
        const payload = jwt.verify(token, env.secretRefreshToken);
        req.user = {
            publicUsername: payload.publicUsername,
            privateUsername: payload.privateUsername,
            id: payload.id,
        };
        return true;
    } catch (err) {
        try {
            await db.deleteToken(token);
        } catch (err) {
            if (err.meta && err.meta.cause !== env.dbMessages.delete.notFound) {
                console.log(err);
            }
        } finally {
            return false;
        }
    }
}

// The auth function first tries to check the user using passport and the access token
// If that fails tries to regerante an access token by using the refresh token
const auth = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, async (err, user, _) => {
        if (err) {
            console.log(err);
            res.sendStatus(500).end();
            return;
        }
        if (user) {
            req.user = user;
            next();
        } else {
            try {
                if (!(await checkRefreshToken(req))) {
                    res.status(401).json({ data: "not an ape" }).end();
                    return;
                }
                createAccessToken(req, res);
                next();
                return;
            } catch (err) {
                console.log(err);
                res.status(401).json({ data: "NOT AN APE" }).end();
                return;
            }
        }
    })(req, res, next);
};

export default { auth, createTokens };
