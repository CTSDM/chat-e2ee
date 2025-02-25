import { Router } from "express";
import controller from "../controllers/user.js";
import httpUtils from "../middleware/httpUtils.js";

const router = Router();

router.get("/", (_, res) => res.sendStatus(401));
router.post("/", controller.login, httpUtils.resSendClientJSON);

export default router;
