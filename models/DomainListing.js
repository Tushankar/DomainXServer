import mongoose from "mongoose";

const domainListingSchema = new mongoose.Schema(
  {
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reseller",
      required: [true, "Reseller ID is required"],
    },
    domainName: {
      type: String,
      required: [true, "Domain name is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["tech", "business", "ecommerce", "health", "finance", "other"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    askingPrice: {
      type: Number,
      required: [true, "Asking price is required"],
      min: [0, "Asking price cannot be negative"],
    },
    minimumOffer: {
      type: Number,
      min: [0, "Minimum offer cannot be negative"],
    },
    listingType: {
      type: String,
      enum: ["fixed", "auction", "negotiable"],
      default: "fixed",
    },
    duration: {
      type: Number, // in days
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 day"],
      max: [365, "Duration cannot exceed 365 days"],
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    registrar: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    traffic: {
      type: Number,
      min: [0, "Traffic cannot be negative"],
    },
    revenue: {
      type: Number,
      min: [0, "Revenue cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "sold", "expired", "paused"],
      default: "active",
    },
    views: {
      type: Number,
      default: 0,
    },
    offers: [
      {
        buyerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Buyer",
        },
        amount: Number,
        message: String,
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },
    soldPrice: {
      type: Number,
    },
    soldAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
domainListingSchema.index({ resellerId: 1, createdAt: -1 });
domainListingSchema.index({ domainName: 1 });
domainListingSchema.index({ category: 1 });
domainListingSchema.index({ status: 1 });
domainListingSchema.index({ askingPrice: 1 });

// Virtual for listing expiry
domainListingSchema.virtual("isExpired").get(function () {
  if (!this.createdAt || !this.duration) return false;
  const expiryDate = new Date(this.createdAt);
  expiryDate.setDate(expiryDate.getDate() + this.duration);
  return new Date() > expiryDate;
});

// Pre-save middleware to update status if expired
domainListingSchema.pre("save", function (next) {
  if (this.isExpired && this.status === "active") {
    this.status = "expired";
  }
  next();
});

const DomainListing = mongoose.model("DomainListing", domainListingSchema);

export default DomainListing;
