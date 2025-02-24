import controller from "../controllers/user.js";
import { Router } from "express";

const router = Router();

router.post("/", controller.add);

export default router;
