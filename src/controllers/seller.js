import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Seller } from "../models/seller.js";
import { PropertyAdd } from "../models/properyAdd.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const createPropertyadd = asyncHandler(async (req, res) => {
  const {
    country,
    state,
    city,
    address,
    photos,
    buildUpArea,
    rent,
    price,
    type,
    no_of_bathrooms,
    description,
    nearBy,
  } = req.body;

  if (
    [
      country,
      state,
      city,
      address,
      buildUpArea,
      no_of_bathrooms,
      description,
      nearBy,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (type === "Rent" && rent?.trim() === "") {
    throw new ApiError(400, "Rent must be specified if the type is 'rent'");
  }

  if (type === "Sell" && price?.trim() === "") {
    throw new ApiError(400, "Price must be specified if the type is 'sell'");
  }

  const photosUrlLocalPath = req.files?.photos;
  let photoUrls = [];

  if (photosUrlLocalPath && photosUrlLocalPath.length > 0) {
    for (const url of photosUrlLocalPath) {
      const uploadedPhoto = await uploadOnCloudinary(url.path);
      if (uploadedPhoto) {
        photoUrls.push({
          public_id: uploadedPhoto.public_id,
          url: uploadedPhoto.url,
        });
      }
    }
  }

  const data = await PropertyAdd.create({
    country,
    state,
    city,
    address: JSON.parse(address),
    photos: photoUrls,
    buildUpArea,
    type,
    no_of_bathrooms,
    description,
    nearBy,
    owner: req.user?._id,
  });

  if (type === "Rent" && rent) {
    data.rent = rent;
    await data.save({ validateBeforeSave: false });
  }

  if (type === "Sell" && price) {
    data.price = price;
    await data.save({ validateBeforeSave: false });
  }

  if (!data) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, data, "Add Created Successfully"));
});

const updatePropertyAdd = asyncHandler(async (req, res) => {
  const {
    country,
    state,
    city,
    address,
    buildUpArea,
    rent,
    price,
    type,
    no_of_bathrooms,
    description,
    nearBy,
  } = req.body;

  console.log(req.body);

  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Property ID is required");
  }

  const property = await PropertyAdd.findById(id);
  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  if (country) property.country = country;
  if (state) property.state = state;
  if (city) property.city = city;
  if (address) property.address = JSON.parse(address);
  if (buildUpArea) property.buildUpArea = buildUpArea;
  if (type) property.type = type;
  if (no_of_bathrooms) property.no_of_bathrooms = no_of_bathrooms;
  if (description) property.description = description;
  if (nearBy) property.nearBy = nearBy;

  // Rent or Price based on property type
  if (type === "Rent" && rent) {
    property.rent = rent;
    if (property.price) {
      property.price = undefined;
    }
  }

  if (type === "Sell" && price) {
    property.price = price;
    if (property.rent) {
      property.rent = undefined;
    }
  }

  // Handle photos update if provided
  const photosUrlLocalPath = req.files?.photos;
  if (photosUrlLocalPath && photosUrlLocalPath.length > 0) {
    let photoUrls = [];
    for (const url of photosUrlLocalPath) {
      const uploadedPhoto = await uploadOnCloudinary(url.path);
      if (uploadedPhoto) {
        photoUrls.push({
          public_id: uploadedPhoto.public_id,
          url: uploadedPhoto.url,
        });
      }
    }
    property.photos = photoUrls; 
  }

  await property.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, property, "Property updated successfully"));
});

const deletePropertyAdd = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Id");
  }

  const data = await PropertyAdd.findByIdAndUpdate(
    id,
    {
      $set: { isDeleted: true },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Property Delete Successfully"));
});

const getAllActiveAddOfSeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  if (!mongoose.isValidObjectId(sellerId)) {
    throw new ApiError(400, "Invalid SellerId");
  }

  const allData = await PropertyAdd.find({ owner: sellerId, isDeleted: false });

  return res
    .status(200)
    .json(new ApiResponse(200, allData, "Fetched AllData Successfully"));
});

const getAllUnActiveAddOfSeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  if (!mongoose.isValidObjectId(sellerId)) {
    throw new ApiError(400, "Invalid SellerId");
  }

  const allData = await PropertyAdd.find({ owner: sellerId, isDeleted: true });

  return res
    .status(200)
    .json(new ApiResponse(200, allData, "Fetched AllData Successfully"));
});

const getAllSellingAddOfSeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  if (!mongoose.isValidObjectId(sellerId)) {
    throw new ApiError(400, "Invalid SellerId");
  }

  const allData = await PropertyAdd.find({
    owner: sellerId,
    isDeleted: false,
    type: "Sell",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, allData, "Fetched AllData Successfully"));
});
const getAllRentAddOfSeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  if (!mongoose.isValidObjectId(sellerId)) {
    throw new ApiError(400, "Invalid SellerId");
  }

  const allData = await PropertyAdd.find({
    owner: sellerId,
    isDeleted: false,
    type: "Rent",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, allData, "Fetched AllData Successfully"));
});
export {
  createPropertyadd,
  deletePropertyAdd,
  updatePropertyAdd,
  getAllActiveAddOfSeller,
  getAllUnActiveAddOfSeller,
  getAllSellingAddOfSeller,
  getAllRentAddOfSeller,
};
