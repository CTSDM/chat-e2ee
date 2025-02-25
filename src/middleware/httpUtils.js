import db from "../db/queries.js";
import bcrypt from "bcryptjs";

async function reqAttachUserInformation(req, res, next) {
    const userCredentials = {
        privateUsername: req.body.privateUsername,
        password: req.body.password,
    };
    const user = await checkUsernamePassword(userCredentials, res);
    if (user) {
        req.user = { ...user, password: "_", publicKey: "_" };
        next();
    } else {
        res.status(401)
            .json({ errMsg: ["The username or password are not correct"] })
            .end();
    }
}

async function resSendClientJSON(req, res) {
    req.userDataToClient = {
        privateUsername: req.user.privateUsername,
        publicUsername: req.user.publicUsername,
        privateKeyEncrypted: req.user.privateKeyEncrypted,
        salt: req.user.salt,
        iv: req.user.iv,
    };
    return res.status(200).json({ ...req.userDataToClient });
}

async function checkUsernamePassword(userCredentials, res) {
    // if true returns the user fetched from the database
    // if there is no user or the password is not valid returns false
    try {
        const user = await db.getUser("privateUsername", userCredentials.privateUsername);
        if (!user) {
            return false;
        }
        const match = await bcrypt.compare(userCredentials.password, user.password);
        if (!match) {
            return false;
        }
        return user;
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
        return false;
    }
}

export default { reqAttachUserInformation, resSendClientJSON };
