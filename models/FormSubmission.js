import mongoose from "mongoose";

const FormSubmissionSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    domainName: {
      type: String,
      required: true,
      trim: true,
    },
    domainPrice: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "converted", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
FormSubmissionSchema.index({ email: 1 });
FormSubmissionSchema.index({ createdAt: -1 });
FormSubmissionSchema.index({ status: 1 });

export default mongoose.model("FormSubmission", FormSubmissionSchema);
