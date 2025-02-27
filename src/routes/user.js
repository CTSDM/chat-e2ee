import { Router } from "express";
import controller from "../controllers/user.js";
import jwt from "../../config/jwt.js";

const router = Router();

router.post("/keys", jwt.auth, controller.addUserContact, (req, res) => {
    return res.json(req.user.publicKey).end();
});

export default router;
