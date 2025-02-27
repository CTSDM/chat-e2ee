import { Router } from "express";
import controller from "../controllers/user.js";
import httpUtils from "../middleware/httpUtils.js";
import jwt from "../../config/jwt.js";

const router = Router();

router.get("/", jwt.auth, controller.getLogin, httpUtils.resSendClientJSON);
router.post("/", controller.login, httpUtils.resSendClientJSON);

export default router;
