import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Buyer } from "../models/buyer.js";
import { Seller } from "../models/seller.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateRefreshTokenAndRefreshToken = async (userId, userType) => {
  try {
    const userModels = {
      Buyer: Buyer,
      Seller: Seller,
    };

    const UserModel = userModels[userType];
    if (!UserModel) {
      throw new ApiError(400, "Invalid user type");
    }

    const user = await UserModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, userType, phone } = req.body;

  if (
    [fullName, email, password, userType, phone].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const userModels = {
    Buyer: Buyer,
    Seller: Seller,
  };

  const UserModel = userModels[userType];

  if (!UserModel) {
    throw new ApiError(400, "Invalid user type");
  }

  const existedUSer = await UserModel.findOne({ email });

  if (existedUSer) {
    throw new ApiError(409, "User with email already exists");
  }

  const profileUrlLocalPath = req.files?.profileUrl[0]?.path;

  if (!profileUrlLocalPath) {
    throw new ApiError(400, "Profile files is required");
  }

  const profile = await uploadOnCloudinary(profileUrlLocalPath);

  if (!profile) {
    throw new ApiError(400, "Profile files is required");
  }

  const user = await UserModel.create({
    fullName,
    password,
    email,
    profileUrl: {
      public_id: profile?.public_id,
      url: profile?.url,
    },
    userType,
    phone,
  });

  const createdUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registerd Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, userType } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const userModels = {
    Buyer: Buyer,
    Seller: Seller,
  };

  const UserModel = userModels[userType];

  if (!UserModel) {
    throw new ApiError(400, "Invalid user type");
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user does not exist...");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateRefreshTokenAndRefreshToken(user._id, userType);

  const loggedInUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );

  // server is only able to modify the cookie
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
        { loggedInUser, accessToken, refreshToken },
        "User LoggedIn Successfully"
      )
    );

});

const logoutUser = asyncHandler(async (req, res) => {
  const { userType } = req.body;

  const userModels = {
    Buyer: Buyer,
    Seller: Seller,
  };

  const UserModel = userModels[userType];

  if (!UserModel) {
    throw new ApiError(400, "Invalid user type");
  }

  const data = await UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { refreshToken: null },
    },
    { new: true }
  );

  if (!data) {
    throw new ApiError(400, "Failed to update refresh token");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});


const updatesAccocuntDetails = asyncHandler(async (req, res) => {
  const { fullName, email, phone, userType } = req.body;

  if (!fullName || !email || !phone) {
    throw new ApiError(400, "All fields are required");
  }

  const userModels = {
    Buyer: Buyer,
    Seller: Seller,
  };

  const UserModel = userModels[userType];

  if (!UserModel) {
    throw new ApiError(400, "Invalid user type");
  }

    const user = await UserModel.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName,
          email,
          phone,
        },
      },
      { new: true }
    )
      .select("-password")
      .exec(); // Execute the query to get the actual user document

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
        "Account details updated successfully"
      )
    );
});

const updateUserProfileImage = asyncHandler(async (req, res) => {
  const profileImageLocalPath = req.file?.path;
  const { userType } = req.body;

  if (!profileImageLocalPath) {
    throw new ApiError(400, "Profile file is missing");
  }

  const profile = await uploadOnCloudinary(profileImageLocalPath);

  if (!profile.url) {
    throw new ApiError(400, "Error while uploading on profile");
  }

  const userModels = {
    Buyer: Buyer,
    Seller: Seller,
  };

  const UserModel = userModels[userType];

  if (!UserModel) {
    throw new ApiError(400, "Invalid user type");
  }

    const user = await UserModel.findById(req.user?._id).select("profileUrl");

    const ProfileToDelete = user.profileUrl.public_id;

    const updateduser = await UserModel.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          profileUrl: {
            public_id: profile?.public_id,
            url: profile?.url,
          },
        },
      },
      { new: true }
    )
      .select("-password")
      .exec(); // Execute the query to get the actual user document

    if (ProfileToDelete && updateduser.profileUrl.public_id) {
      await deleteOnCloudinary(ProfileToDelete);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, updateduser, "Profile Image Updated successfully")
      );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword, userType } = req.body;

  if (!(newPassword === confirmPassword)) {
    throw new ApiError(401, "Newpassword and Confirmpassword not match");
  }

  const userModels = {
    Buyer: Buyer,
    Seller: Seller,
  };

  const UserModel = userModels[userType];

  if (!UserModel) {
    throw new ApiError(400, "Invalid user type");
  }
  
    const user = await UserModel.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password Save Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  updatesAccocuntDetails,
  updateUserProfileImage,
  changeCurrentPassword,
};
