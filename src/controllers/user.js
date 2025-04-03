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
        try {
            // check whether the private username or public username exists
            const errMsg = [];
            const varsToCheck = [
                { var: "privateUsername", str: "private username" },
                { var: "publicUsername", str: "public username" },
            ];
            for (let i = 0; i < varsToCheck.length; ++i) {
                const value = req.body[varsToCheck[i].var].toLowerCase();
                const userDB = await db.getUser(varsToCheck[i].var, value);
                if (userDB) {
                    errMsg.push(`The ${varsToCheck[i].str} is already taken.`);
                }
            }
            if (errMsg.length) return res.status(400).json({ errMsg: errMsg });
        } catch (err) {
            return res
                .status(500)
                .json({ errMsg: ["Something went wrong while checking the database."] });
        }
        // create the user
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
    try {
        const user = await db.getUser("privateUsername", req.user.privateUsername);
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
    validation.addUserContact,
    validation.checkErrors,
    // i should do some validation of the username...
    // We make sure the user requesting the connection is not the same as the target user
    async (req, res, next) => {
        const targetPublicUsername = req.params.username.toLowerCase();
        if (req.user.publicUsername.toLowerCase() === targetPublicUsername) {
            return res
                .status(400)
                .json({ errMsg: ["Cannot request connection to yourself"] })
                .end();
        }
        try {
            const userData = await db.getPublicKey(targetPublicUsername);
            if (userData) {
                req.userRequested = {};
                req.userRequested.publicKey = userData.publicKey;
                req.userRequested.salt = userData.salt;
                req.userRequested.publicUsername = userData.publicUsername;
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
