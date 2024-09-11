import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.js";
import mongoose from "mongoose";

const likePropertyAdd = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  if (!mongoose.isValidObjectId(propertyId)) {
    throw new ApiError(400, "Invalid PropertyId");
  }

  const likedAlready = await Like.findOne({
    property: propertyId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }

  await Like.create({
    property: propertyId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

const getLikedProperty = asyncHandler(async (req, res) => {
  const likedPropertyAggregate = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "propertyadds",
        localField: "property",
        foreignField: "_id",
        as: "likedProperty",
        pipeline: [
          {
            $lookup: {
              from: "sellers",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
        ],
      },
    },
    {
      $unwind: "$likedProperty",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedProperty: {
          _id: 1,
          photos: 1,
          owner: 1,
          country: 1,
          state: 1,
          city: 1,
          address: 1,
          buildUpArea: 1,
          type: 1,
          rent: 1,
          price: 1,
          no_of_bathrooms: 1,
          description: 1,
          nearBy: 1,
          ownerDetails: {
            fullName: 1,
            "profileUrl.url": 1,
            userType: 1,
            email: 1,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedPropertyAggregate,
        "liked property fetched successfully"
      )
    );
});

export { likePropertyAdd, getLikedProperty };
