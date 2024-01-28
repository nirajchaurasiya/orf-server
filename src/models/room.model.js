import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const RoomSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        roomImage: [
            {
                urL: {
                    type: String,
                },
            },
        ],
        roomVideo: [
            {
                urL: {
                    type: String,
                },
            },
        ],
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        price: {
            type: Number,
            required: true,
        },
        availability: {
            type: Boolean,
            default: true,
        },
        roomType: {
            type: String,
            required: true,
        },
        facilities: {
            type: [String],
            default: [],
        },
        contactInfo: {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
            },
        },
        ratings: {
            type: Number,
            default: 0,
        },
        reviews: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
                content: {
                    type: String,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

RoomSchema.plugin(mongooseAggregatePaginate);

export const Room = mongoose.model("Room", RoomSchema);
