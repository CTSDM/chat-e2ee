import validation from "../middleware/validations.js";
import db from "../db/queries.js";

const getKey = [
    validation.groupKey,
    validation.checkErrors,
    // i should do some validation of the username...
    // We make sure the user requesting the connection is not the same as the target user
    async (req, res, next) => {
        const groupId = req.params.groupId;
        const userId = req.user.id;
        try {
            const [group, groupKey, members] = await Promise.all([
                db.getGroup(groupId),
                db.getGroupKey(groupId, userId),
                db.getGroupMembers(groupId),
            ]);
            const creator = await db.getUser("id", group.createdByUserId);
            if (group && groupKey) {
                req.group = {};
                req.group.key = groupKey.key;
                req.group.iv = groupKey.iv;
                req.group.finalKey = groupKey.finalKey;
                req.group.creator = creator.publicUsername.toLowerCase();
                req.group.name = group.name;
                req.group.members = members.map((entry) => entry.User.publicUsername);
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
