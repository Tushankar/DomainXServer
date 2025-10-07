import mongoose from "mongoose";

const dataAnalyticsSchema = new mongoose.Schema(
  {
    // Step 1: Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    selectedOption: {
      type: String,
      required: [true, "User type selection is required"],
      enum: ["solo", "team"],
    },

    // Step 2: Domain Business Details
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
        values: ["buyer", "seller"],
        message: "businessType must be either 'buyer' or 'seller'"
      },
      validate: {
        validator: function(v) {
          // Allow undefined/null but not empty strings
          return v === undefined || v === null || ["buyer", "seller"].includes(v);
        },
        message: "businessType must be either 'buyer' or 'seller' or not provided"
      }
    },

    // Step 3: Business Goals & Challenges
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
        values: ["profit", "growth"],
        message: "primaryGoal must be either 'profit' or 'growth'"
      },
      validate: {
        validator: function(v) {
          // Allow undefined/null but not empty strings
          return v === undefined || v === null || ["profit", "growth"].includes(v);
        },
        message: "primaryGoal must be either 'profit' or 'growth' or not provided"
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
      max: 3,
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
  }
);

// Index for faster queries
dataAnalyticsSchema.index({ email: 1 });
dataAnalyticsSchema.index({ createdAt: -1 });
dataAnalyticsSchema.index({ businessType: 1 });
dataAnalyticsSchema.index({ primaryGoal: 1 });

// Virtual for full name
dataAnalyticsSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to set completion status and clean up empty enum values
dataAnalyticsSchema.pre("save", function (next) {
  // Clean up empty enum values by setting them to undefined
  if (this.businessType === '') {
    this.businessType = undefined;
  }
  if (this.primaryGoal === '') {
    this.primaryGoal = undefined;
  }
  
  // Set completion status
  if (this.currentStep === 3 && this.primaryGoal && this.monthlyVolume && this.targetRevenue && this.yearsExperience) {
    this.isCompleted = true;
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