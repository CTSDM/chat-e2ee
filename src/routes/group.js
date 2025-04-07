import { Router } from "express";
import controller from "../controllers/group.js";
import jwt from "../../config/jwt.js";

const router = Router();

router.get("/:groupId/keys", jwt.auth, controller.getKey, (req, res) => {
    return res
        .json({
            publicKey: req.userRequested.publicKey,
            salt: req.userRequested.salt,
            publicUsername: req.userRequested.publicUsername,
        })
        .end();
});

export default router;
