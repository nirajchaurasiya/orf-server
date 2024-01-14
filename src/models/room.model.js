import mongoose, { Schema } from "mongoose";
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
      image: [
         {
            urL: {
               type: String,
            },
         },
      ],
      video: [
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
   },
   {
      timestamps: true,
   }
);

export const User = mongoose.model("Room", RoomSchema);
