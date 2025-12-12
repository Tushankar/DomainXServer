import mongoose from "mongoose";

const domainWishlistSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DomainListing",
      required: true,
    },
    domain: {
      type: String,
      required: true,
      lowercase: true,
    },
    sld: String,
    tld: String,
    appraised_value: Number,
    appraised_wholesale_value: Number,
    appraisalData: {
      type: mongoose.Schema.Types.Mixed,
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure no duplicate domains per buyer
domainWishlistSchema.index({ buyerId: 1, domain: 1 }, { unique: true });
domainWishlistSchema.index({ buyerId: 1, domainId: 1 }, { unique: true });
domainWishlistSchema.index({ buyerId: 1, createdAt: -1 });

export default mongoose.model("DomainWishlist", domainWishlistSchema);
