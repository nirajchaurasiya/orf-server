import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Tesseract from "tesseract.js";
import fs from "fs/promises";

const GovIDSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        idNumber: {
            type: String,
            unique: true,
        },
        issuingAuthority: {
            type: String,
        },
        fullName: {
            type: String,
        },
        dateOfBirth: {
            type: Date,
        },
        expiryDate: {
            type: Date,
        },
        address: {
            type: String,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
        },
        nationality: {
            type: String,
        },
        documentType: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const GovID = mongoose.model("GovID", GovIDSchema);
