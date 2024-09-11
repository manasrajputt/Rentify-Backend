import { Router } from "express";
import { likePropertyAdd, getLikedProperty } from "../controllers/likes.js";
import { verifyJWT } from "../middlewares/auth.js";
const router = Router();

router.route("/toggle/:propertyId").post(verifyJWT, likePropertyAdd);
router.route("/property").get(verifyJWT, getLikedProperty)

export default router;
