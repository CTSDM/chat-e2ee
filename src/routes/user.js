import { Router } from "express";
import controller from "../controllers/user.js";
import jwt from "../../config/jwt.js";

const router = Router();

router.get("/:username/keys", jwt.auth, controller.addUserContact, (req, res) => {
    return res
        .json({
            publicKey: req.userRequested.publicKey,
            salt: req.userRequested.salt,
            publicUsername: req.userRequested.publicUsername,
        })
        .end();
});

export default router;
