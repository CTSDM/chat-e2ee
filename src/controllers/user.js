import bcrypt from "bcryptjs";
import db from "../db/queries.js";
import validation from "../middleware/validations.js";

const add = [
    validation.signup,
    validation.checkErrors,
    async function (req, res) {
        const userData = {
            publicUsername: req.body.publicUsername,
            privateUsername: req.body.privateUsername,
            publicKey: req.body.publicKey,
            privateKeyEncrypted: JSON.parse(req.body.privateKeyEncrypted),
            salt: Object.values(req.body.salt),
            iv: Object.values(req.body.iv),
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
