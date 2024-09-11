import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { getAllPropertyAdd } from "../controllers/buyer.js";

const router = Router();

router.route("/getAllPropertyAdd").get(verifyJWT, getAllPropertyAdd);

export default router;
