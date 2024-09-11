import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";
import {
  changeCurrentPassword,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfileImage,
  updatesAccocuntDetails,
} from "../controllers/user.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "profileUrl",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// protected routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/update-account").patch(verifyJWT, updatesAccocuntDetails);
router
  .route("/update-profileImage")
  .patch(verifyJWT, upload.single("profile"), updateUserProfileImage);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

export default router;
