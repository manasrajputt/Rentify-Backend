import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    // Address => House No., Street/Colony, Area/Locality
    address: {
      type: Object,
      required: true,
    },
    photos: {
      type: [Object],
    },
    buildUpArea: {
      type: String,
      required: true,
      trim: true,
    },
    // type => Rent or Sell
    type: {
      type: String,
      required: true,
      trim: true,
    },
    // rent => Rent Price
    rent: {
      type: Number,
      trim: true,
    },
    // Price => Selling Price
    price: {
      type: Number,
      trim: true,
    },
    no_of_bathrooms: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // nearBy => school, hospital, railwaystation, colleges etc.
    nearBy: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.plugin(mongooseAggregatePaginate);

export const PropertyAdd = mongoose.model("PropertyAdd", propertySchema);
