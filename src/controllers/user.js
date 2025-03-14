import bcrypt from "bcryptjs";
import db from "../db/queries.js";
import validation from "../middleware/validations.js";
import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";
import httpUtils from "../middleware/httpUtils.js";
import jwt from "../../config/jwt.js";
import { env } from "../../config/config.js";

const add = [
    validation.signup,
    validation.checkErrors,
    async function (req, res) {
        const userData = {
            publicUsername: req.body.publicUsername,
            privateUsername: req.body.privateUsername,
            publicKey: dataManipulation.stringArrToBuffer(req.body.publicKey),
            privateKeyEncrypted: dataManipulation.stringArrToBuffer(req.body.privateKeyEncrypted),
            salt: dataManipulation.stringArrToBuffer(req.body.salt),
            iv: dataManipulation.stringArrToBuffer(req.body.iv),
        };
        userData.password = await bcrypt.hash(req.body.password, 10);
        try {
            await db.createUser(userData);
            return res.sendStatus(200);
        } catch (err) {
            console.log(err);
            return res
                .status(400)
                .json({ errMsg: ["Something went wrong while creating the user"] });
        }
    },
];

const login = [
    validation.login,
    validation.checkErrors,
    httpUtils.checkUserExistsAttachInformation,
    jwt.createTokens,
];

async function getLogin(req, res, next) {
    // we make sure the user exists
    // we take the data from the JWT, the JWT stores both the public and private usernames
    const privateUsername = req.user.privateUsername;
    try {
        const user = await db.getUser("privateUsername", privateUsername);
        if (user) {
            user.password = "_";
            req.user = user;
            next();
        } else {
            res.sendStatus(404).end();
            return;
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500).end();
        return;
    }
}

const addUserContact = [
    // i should do some validation of the username...
    // We make sure the user requesting the connection is not the same as the target user
    async (req, res, next) => {
        const targetPublicUsername = req.params.username;
        if (req.user.publicUsername === targetPublicUsername) {
            return res
                .status(400)
                .json({ errMsg: ["Cannot request connection to yourself"] })
                .end();
        }
        try {
            const userData = await db.getPublicKeyAndSalt(targetPublicUsername);
            if (userData) {
                req.user.publicKey = userData.publicKey;
                req.user.salt = userData.salt;
                next();
            } else {
                res.sendStatus(404).end();
            }
        } catch (err) {
            console.log(err);
            res.sendStatus(500).end();
        }
    },
];

function logout(req, res) {
    if (req.cookies["access-token"]) {
        res.clearCookie("access-token", env.cookie.options);
    }
    if (req.cookies["refresh-token"]) {
        res.clearCookie("refresh-token", env.cookie.options);
    }
    res.sendStatus(205).end();
}

export default { add, login, logout, getLogin, addUserContact };
