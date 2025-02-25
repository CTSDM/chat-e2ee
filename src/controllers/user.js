import bcrypt from "bcryptjs";
import db from "../db/queries.js";
import validation from "../middleware/validations.js";
import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";

const add = [
    validation.signup,
    validation.checkErrors,
    async function (req, res) {
        const userData = {
            publicUsername: req.body.publicUsername,
            privateUsername: req.body.privateUsername,
            publicKey: req.body.publicKey,
            privateKeyEncrypted: dataManipulation.stringToBuffer(req.body.privateKeyEncrypted),
            salt: dataManipulation.stringToBuffer(req.body.salt),
            iv: dataManipulation.stringToBuffer(req.body.iv),
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

export default { add };
