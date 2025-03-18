import { Router } from "express";
import controller from "../controllers/user.js";
import jwt from "../../config/jwt.js";

const router = Router();

router.get("/:username/keys", jwt.auth, controller.addUserContact, (req, res) => {
    return res
        .json({
            publicKey: req.userRequested.publicKey,
            salt: req.userRequested.salt,
            // the original case is only on the front end to display information
            // the logic is done with the lowercase one
            publicUsername: req.userRequested.publicUsername,
            publicUsernameOriginalCase: req.userRequested.publicUsernameOriginalCase,
        })
        .end();
});

export default router;
