import validation from "../middleware/validations.js";
import db from "../db/queries.js";

const getKey = [
    validation.groupKey,
    validation.checkErrors,
    // i should do some validation of the username...
    // We make sure the user requesting the connection is not the same as the target user
    async (req, res, next) => {
        const targetPublicUsername = req.params.groupId;
        try {
            const group = await db.getGroup();
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

export default { getKey };
