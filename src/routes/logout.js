import { Router } from "express";
import controller from "../controllers/user.js";

const router = Router();

router.post("/", controller.logout);

export default router;
