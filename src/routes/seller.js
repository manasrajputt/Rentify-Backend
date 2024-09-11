import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";
import {
  createPropertyadd,
  deletePropertyAdd,
  getAllActiveAddOfSeller,
  getAllRentAddOfSeller,
  getAllSellingAddOfSeller,
  getAllUnActiveAddOfSeller,
  updatePropertyAdd,
} from "../controllers/seller.js";

const router = Router();

router.route("/createPropertyAdd").post(
  verifyJWT,
  upload.fields([
    {
      name: "photos",
      maxCount: 5,
    },
  ]),
  createPropertyadd
);

router.route("/delete-propertyAdd/:id").patch(verifyJWT, deletePropertyAdd);
router.route("/update-propertyAdd/:id").put(
  verifyJWT,
  upload.fields([
    {
      name: "photos",
      maxCount: 5,
    },
  ]),
  updatePropertyAdd
);

router
  .route("/getAllAdd-active/:sellerId")
  .get(verifyJWT, getAllActiveAddOfSeller);
router
  .route("/getAllAdd-unactive/:sellerId")
  .get(verifyJWT, getAllUnActiveAddOfSeller);
router
  .route("/getAllAdd-Sell/:sellerId")
  .get(verifyJWT, getAllSellingAddOfSeller);
router.route("/getAllAdd-Rent/:sellerId").get(verifyJWT, getAllRentAddOfSeller);

export default router;
