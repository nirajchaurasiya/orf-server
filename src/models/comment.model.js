import mongoose, { Schema } from "mongoose";
const CommentSchema = new Schema(
   {
      commentText: {
         type: String,
         required: true,
      },
      commentUserId: {
         type: Schema.Types.ObjectId,
         ref: "User",
      },
      roomId: {
         type: Schema.Types.ObjectId,
         ref: "Room",
      },
   },
   {
      timestamps: true,
   }
);

export const User = mongoose.model("Comment", CommentSchema);
