import { Room } from "../models/room.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createRoomPost = asyncHandler(async (req, res) => {
    try {
        const { title, desc, location, authorId } = req.body;
        if (
            [title, desc, location, authorId].some(
                (field) => field?.trim() === ""
            )
        ) {
            throw new ApiError(400, "All fields are required");
        }

        console.log(title, desc, location, authorId);

        const roomImage = req.files.roomImage[0];

        const roomVideo = req.files.roomVideo[0];

        console.log(roomImage);

        console.log(roomVideo);

        return res
            .status(200)
            .json(new ApiResponse(200, "", "Room posted successfully"));
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Something went wrong while creating ads for room"
        );
    }
});

export { createRoomPost };
