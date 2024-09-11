import { PropertyAdd } from "../models/properyAdd.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllPropertyAdd = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortType, type, rent, price } = req.body;

  const pipeline = [];

  pipeline.push({
    $match: {
      isDeleted: false,
    },
  });

  if (sortType) {
    pipeline.push({
      $sort: {
        createdAt: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
  }

  if (type) {
    if (type === "Sell") {
      pipeline.push({
        $match: {
          type: "Sell",
        },
      });
    } else {
      pipeline.push({
        $match: {
          type: "Rent",
        },
      });
    }
  }

  if (rent) {
    pipeline.push({
      $match: {
        rent: {
          $lte: Number(rent),
        },
      },
    });
  }

  if (price) {
    pipeline.push({
      $match: {
        price: {
          $lte: Number(price),
        },
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "sellers",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              fullName: 1,
              "profileUrl.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails",
    }
  );

  const propertyAddAggregate = PropertyAdd.aggregate(pipeline);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const propertyAdd = await PropertyAdd.aggregatePaginate(
    propertyAddAggregate,
    options
  );

  res
    .status(200)
    .json(new ApiResponse(200, propertyAdd, "Properties Fetched Successfully"));
});

export { getAllPropertyAdd };
