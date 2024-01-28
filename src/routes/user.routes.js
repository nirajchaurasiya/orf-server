import { Router } from "express";
import {
    changePassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    // updateUserCoverImage,
    verifyPhoneNumber,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Authentication Routes

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

// Secured routes

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changePassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

// Update: If there is email, update email or if there is full name update fullname else if there are both update both

router.route("/update-account").patch(
    verifyJWT,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "govermentImg",
            maxCount: 1,
        },
    ]),
    updateAccountDetails
);

router
    .route("/avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// router
//     .route("/cover-image")
// .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/send-otp").patch(verifyJWT, verifyPhoneNumber);

export default router;
