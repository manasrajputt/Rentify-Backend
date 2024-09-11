import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PropertyAdd",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },
  },
  {
    timestamps: true,
  }
);

likeSchema.plugin(mongooseAggregatePaginate);

export const Like = mongoose.model("Like", likeSchema);
