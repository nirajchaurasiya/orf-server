import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const UserSchema = new Schema(
    {
        username: {
            type: String,
            // required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            default: "",
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            lowercase: true,
            index: true,
        },
        avatar: {
            type: String, // S3 bucket
            default: "",
        },
        govermentImg: {
            type: String, // S3 bucket
            default: "",
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        // new fields to update
        city: {
            type: String,
            // required: true,
            default: "",
        },
        country: {
            type: String,
            // required: true,
            default: "",
        },
        sex: {
            type: Number,
            // required: true,
            enum: [0, 1, 2], // 0 for male, 1 for female, 2 for others
        },
        phoneNumber: {
            type: String,
            // required: true,
            default: "",
        },
        languages: [
            {
                title: String,
            },
        ],
        refreshToken: {
            type: String,
        },
        isActivated: {
            type: Boolean,
            default: false,
        },
        isOwner: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            isOwner: this.isOwner,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", UserSchema);
