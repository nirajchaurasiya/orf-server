import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromSpaces, uploadToSpaces } from "../utils/objectStorage.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendMail.js";
import {
    preRegisterationValidationExtensions,
    preRegisterationValidationSize,
} from "../utils/preRegisterValidation.js";
import { sendOtpToPhone } from "../utils/sendOtpToPhone.js";

const generateAccessTokenAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User doesn't exist.");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    try {
        const { fullName, email, password } = req.body;
        console.log(fullName, email, password);
        if ([fullName, email, password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const isOwner =
            req.body.isOwner === "true" || req.body.isOwner === true;

        const existedUser = await User.findOne({
            email: email,
        });

        if (existedUser) {
            throw new ApiError(409, "Email already exists");
        }

        const user = await User.create({
            fullName,
            email,
            password,
            isOwner: isOwner,
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        if (!createdUser) {
            throw new ApiError(
                500,
                "Something went wrong while registering the user"
            );
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    createdUser,
                    "User registered Successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Something went wrong while creating the user"
        );
    }
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    try {
        const { email, username, password } = req.body;
        if (!(email || username)) {
            throw new ApiError(400, "username or password is required");
        }

        const user = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (!user) {
            throw new ApiError(404, "User doesn't exist.");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid Credentials.");
        }

        const { accessToken, refreshToken } =
            await generateAccessTokenAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    "User logged In Successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Something went wrong while logging in"
        );
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: "",
                },
            },
            {
                new: true,
            }
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out!"));
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Something went wrong while logging out the user"
        );
    }
});
const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }
        console.log("incomingRefreshToken ", incomingRefreshToken);
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        console.log("decodedToken", decodedToken);

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } =
            await generateAccessTokenAndRefreshTokens(user?._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken,
                    refreshToken: newRefreshToken,
                })
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changePassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        // console.log(oldPassword, newPassword);
        const user = await User.findById(req.user?._id);

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid password!");
        }

        user.password = newPassword;

        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully"));
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Something went wrong while reseting the password"
        );
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    req.user,
                    "Current user fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "The token is used or expired"
        );
    }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    /* 
        1) Get all the values from req.body with _id of the user in params
        TODO: Check if the user is an owner or an agent
            
        CONDITION: 1
                If the user is owner:
        CONDITION: 2
                If the user is a lodger
    */

    try {
        const userID = req?.user?._id;

        const { isOwner } = req?.user;

        if (!userID) {
            throw new ApiError(
                400,
                "The token is incorrect or already expired"
            );
        }

        const { username, city, country, phoneNumber, languages } = req.body;

        if (
            [username, city, country, phoneNumber, languages].some(
                (field) => field?.trim() === ""
            )
        ) {
            throw new ApiError(400, "All fields are required");
        }

        // Check if the username is already taken

        const isUserNameTaken = await User.findOne({ username: username });

        if (isUserNameTaken) {
            throw new ApiError(302, "Username is taken");
        }

        // TODO: Get the avatar file

        const avatarFile = req.files.avatar[0];

        const avatarLocalPath = avatarFile?.path;

        if (!avatarFile) {
            throw new ApiError(409, "Avatar file is required");
        }

        const validateAvatarSize = preRegisterationValidationSize(avatarFile);

        const validateAvatarExtensions =
            preRegisterationValidationExtensions(avatarFile);

        if (!validateAvatarSize) {
            throw new ApiError(303, "Avatar is greater than 15 MB");
        }

        if (!validateAvatarExtensions) {
            throw new ApiError(302, "Avatar file type is not valid");
        }

        // TODO: Get the govermentImg

        let govermentImgURL;

        // TODO: Check if the user is an agent or a lodger

        if (isOwner) {
            const govermentImg = req.files.govermentImg[0];

            const govermentImgPath = govermentImg?.path;

            if (!govermentImg) {
                throw new ApiError(409, "Government ID is required");
            }

            const validateGovernmentIDSize =
                preRegisterationValidationSize(govermentImg);

            const validateGovernmentIDExtensions =
                preRegisterationValidationExtensions(govermentImg);

            if (!validateGovernmentIDSize) {
                throw new ApiError(
                    303,
                    "Government ID size is greater than 15 MB"
                );
            }

            if (!validateGovernmentIDExtensions) {
                throw new ApiError(302, "Government file type is not valid");
            }

            /* TODO: We have two things to do

                1. Verify the document is valid with the ID type
                2. Extract texts from the document
            
            */

            // TODO: Left for discussion

            // government image is stored privately
            govermentImgURL = await uploadToSpaces(
                govermentImgPath,
                `users/private_docs/${govermentImg.mimetype}`,
                process.env.SPACES_ACL_PRIVATE
            );
        }

        // avatar is required and is public
        const avatarURL = await uploadToSpaces(
            avatarLocalPath,
            `users/public/${avatarFile.mimetype}`,
            process.env.SPACES_ACL_PUBLIC
        );

        // TODO: After getting the URL, check if the URL exists and no problem has arised during the upload process

        if (isOwner) {
            if (!govermentImgURL) {
                throw new ApiError(
                    500,
                    "Something went wrong while uploading the government ID"
                );
            }
        }

        if (!avatarURL) {
            throw new ApiError(
                500,
                "Something went wrong while uploading the avatar file"
            );
        }

        // TODO: After making sure the URLs exist for both files save update the user

        const user = await User.findByIdAndUpdate(
            userID,
            {
                $set: {
                    username,
                    city,
                    country,
                    phoneNumber,
                    languages,
                    avatar: avatarURL.url,
                    govermentImg: isOwner ? govermentImgURL.url : "",
                },
            },
            {
                new: true,
            }
        );

        await user.save();

        return res
            .status(200)
            .json(
                new ApiResponse(200, user, "Informations updated successfully")
            );
    } catch (error) {
        console.log(error);

        return res
            .status(500)
            .json(
                new ApiError(
                    302,
                    error.message ||
                        "Something went wrong while updating the informations"
                )
            );
    }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    try {
        const prevAvatar = req?.user.avatar;

        const avatarFile = req.file;

        const avatarLocalPath = avatarFile?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is missing");
        }

        const avatar = await uploadToSpaces(
            avatarLocalPath,
            `public/${avatarFile.mimetype}`,
            process.env.SPACES_ACL_PUBLIC
        );

        if (!avatar?.url) {
            throw new ApiError(400, "Error while uploading on avatar");
        }

        await deleteFromSpaces(prevAvatar);

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url,
                },
            },
            { new: true }
        ).select("-password");

        return res
            .status(200)
            .json(new ApiResponse(200, user, "Avatar updated successfully."));
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Something went wrong while updating the avatar"
        );
    }
});

// const updateUserCoverImage = asyncHandler(async (req, res) => {
//     try {
//         const coverLocalPath = req.file?.path;

//         if (!coverLocalPath) {
//             throw new ApiError(400, "Cover image file is missing");
//         }

//         const coverImage = await uploadOnCloudinary(coverLocalPath);

//         if (!coverImage?.url) {
//             throw new ApiError(400, "Error while uploading on coverImage");
//         }

//         const user = await User.findByIdAndUpdate(
//             req.user?._id,
//             {
//                 $set: {
//                     coverImage: coverImage.url,
//                 },
//             },
//             { new: true }
//         ).select("-password");

//         return res
//             .status(200)
//             .json(
//                 new ApiResponse(200, user, "Cover image updated successfully.")
//             );
//     } catch (error) {
//         throw new ApiError(
//             500,
//             error.message || "Something went wrong while updating the cover-image"
//         );
//     }
// });

const verifyPhoneNumber = asyncHandler(async (req, res) => {
    try {
        const phone = req.phoneNumber;
        const verifyPhone = await sendOtpToPhone(phone);
        return res
            .status(200)
            .json(new ApiResponse(200, verifyPhone, "OTP sent successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(
            500,

            error.message || "Something went wrong while sending OTP"
        );
    }
});

export {
    registerUser,
    loginUser,
    generateAccessTokenAndRefreshTokens,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    // updateUserCoverImage,
    verifyPhoneNumber,
};
