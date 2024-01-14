import { Router } from "express";
import {
   changePassword,
   getCurrentUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   registerUser,
   updateUserAvatar,
   updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1,
      },
      {
         name: "coverImage",
         maxCount: 1,
      },
   ]),
   registerUser
);

router.route("/login").post(loginUser);

// Secured routes

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("change-password").post(verifyJWT, changePassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, getCurrentUser);

router
   .route("/avatar")
   .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
   .route("/cover-image")
   .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

export default router;
