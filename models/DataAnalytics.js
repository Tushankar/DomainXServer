import mongoose from "mongoose";

const dataAnalyticsSchema = new mongoose.Schema(
  {
    // DYNAMIC FORM DATA - Stores all field values dynamically
    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Form data is required"],
      default: {}
    },

    // LEGACY FIELDS - Kept for backward compatibility (optional)
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    selectedOption: {
      type: String,
      enum: ["solo", "team", ""],
    },
    domainName: {
      type: String,
      trim: true,
      maxlength: [100, "Domain name cannot exceed 100 characters"],
    },
    domainPrice: {
      type: String,
      trim: true,
      maxlength: [50, "Price range cannot exceed 50 characters"],
    },
    domainCategory: {
      type: String,
      trim: true,
      maxlength: [100, "Domain category cannot exceed 100 characters"],
    },
    businessType: {
      type: String,
      enum: {
        values: ["buyer", "seller", ""],
        message: "businessType must be either 'buyer' or 'seller'"
      }
    },
    monthlyVolume: {
      type: String,
      trim: true,
      maxlength: [50, "Monthly volume cannot exceed 50 characters"],
    },
    targetRevenue: {
      type: String,
      trim: true,
      maxlength: [50, "Target revenue cannot exceed 50 characters"],
    },
    yearsExperience: {
      type: String,
      trim: true,
      maxlength: [50, "Years of experience cannot exceed 50 characters"],
    },
    primaryGoal: {
      type: String,
      enum: {
        values: ["profit", "growth", ""],
        message: "primaryGoal must be either 'profit' or 'growth'"
      }
    },
    currentChallenges: {
      type: [String],
      validate: [
        (challenges) => challenges.length <= 10,
        "Cannot have more than 10 challenges",
      ],
    },

    // Form completion status
    currentStep: {
      type: Number,
      default: 1,
      min: 1,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // Additional metadata
    submissionSource: {
      type: String,
      default: "web_form",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: false, // Allow dynamic fields
  }
);

// Index for faster queries
dataAnalyticsSchema.index({ email: 1 });
dataAnalyticsSchema.index({ createdAt: -1 });
dataAnalyticsSchema.index({ businessType: 1 });
dataAnalyticsSchema.index({ primaryGoal: 1 });

// Virtual for full name
dataAnalyticsSchema.virtual("fullName").get(function () {
  // Try to get from formData first, then fallback to legacy fields
  const firstName = this.formData?.firstName || this.firstName;
  const lastName = this.formData?.lastName || this.lastName;
  return firstName && lastName ? `${firstName} ${lastName}` : "";
});

// Pre-save middleware to set completion status
dataAnalyticsSchema.pre("save", function (next) {
  // Clean up empty enum values by setting them to undefined
  if (this.businessType === '') {
    this.businessType = undefined;
  }
  if (this.primaryGoal === '') {
    this.primaryGoal = undefined;
  }
  
  // Auto-set completion status based on current step
  // In dynamic forms, completion is determined by reaching the last step
  if (this.isCompleted !== true && this.currentStep > 1) {
    // If currentStep is provided and greater than 1, form is in progress
    // If all steps are completed, isCompleted should be set by the frontend
  }
  
  next();
});

// Static method to get analytics summary
dataAnalyticsSchema.statics.getAnalyticsSummary = async function () {
  const summary = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        completedSubmissions: {
          $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
        },
        soloCreators: {
          $sum: { $cond: [{ $eq: ["$selectedOption", "solo"] }, 1, 0] },
        },
        teamMembers: {
          $sum: { $cond: [{ $eq: ["$selectedOption", "team"] }, 1, 0] },
        },
        domainBuyers: {
          $sum: { $cond: [{ $eq: ["$businessType", "buyer"] }, 1, 0] },
        },
        domainSellers: {
          $sum: { $cond: [{ $eq: ["$businessType", "seller"] }, 1, 0] },
        },
        profitFocused: {
          $sum: { $cond: [{ $eq: ["$primaryGoal", "profit"] }, 1, 0] },
        },
        growthFocused: {
          $sum: { $cond: [{ $eq: ["$primaryGoal", "growth"] }, 1, 0] },
        },
      },
    },
  ]);

  return summary[0] || {
    totalSubmissions: 0,
    completedSubmissions: 0,
    soloCreators: 0,
    teamMembers: 0,
    domainBuyers: 0,
    domainSellers: 0,
    profitFocused: 0,
    growthFocused: 0,
  };
};

const DataAnalytics = mongoose.model("DataAnalytics", dataAnalyticsSchema);

export default DataAnalytics;