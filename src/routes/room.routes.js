import { Router } from "express";

import { createRoomPost } from "../controllers/room.controller.js";

import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Authentication Routes

router.route("/create-ad").post(
    verifyJWT,
    upload.fields([
        {
            name: "roomImage",
            maxCount: 1,
        },
        {
            name: "roomVideo",
            maxCount: 1,
        },
    ]),
    createRoomPost
);

export default router;
