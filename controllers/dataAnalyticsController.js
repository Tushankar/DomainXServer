import DataAnalytics from "../models/DataAnalytics.js";

// @desc    Create new analytics form submission
// @route   POST /api/analytics
// @access  Public
export const createAnalyticsSubmission = async (req, res) => {
  try {
    const {
      formData, // NEW: Dynamic form data object
      firstName,
      lastName,
      email,
      selectedOption,
      domainName,
      domainPrice,
      domainCategory,
      businessType,
      monthlyVolume,
      targetRevenue,
      yearsExperience,
      primaryGoal,
      currentChallenges,
      currentStep,
      isCompleted,
    } = req.body;

    console.log("📥 Received submission data:", {
      hasFormData: !!formData,
      formDataKeys: formData ? Object.keys(formData) : [],
      currentStep,
      isCompleted
    });

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get("User-Agent");

    // Extract email from formData or legacy field
    const submissionEmail = formData?.email || email;

    // Check if submission with this email already exists
    if (submissionEmail) {
      const existingSubmission = await DataAnalytics.findOne({ 
        $or: [
          { email: submissionEmail },
          { 'formData.email': submissionEmail }
        ]
      });
      
      if (existingSubmission) {
        console.log("⚠️ Email already exists, returning existing submission ID");
        return res.status(200).json({
          success: true,
          message: "Submission with this email already exists",
          data: { id: existingSubmission._id },
          existing: true
        });
      }
    }

    // Prepare submission data - prioritize formData (dynamic) over legacy fields
    const submissionData = {
      formData: formData || {}, // Store all dynamic field data
      currentStep: currentStep || 1,
      isCompleted: isCompleted || false,
      ipAddress,
      userAgent,
      submissionSource: "web_form",
    };

    // Add legacy fields for backward compatibility (if provided)
    if (firstName) submissionData.firstName = firstName;
    if (lastName) submissionData.lastName = lastName;
    if (email) submissionData.email = email;
    if (selectedOption) submissionData.selectedOption = selectedOption;
    if (domainName) submissionData.domainName = domainName;
    if (domainPrice) submissionData.domainPrice = domainPrice;
    if (domainCategory) submissionData.domainCategory = domainCategory;
    if (monthlyVolume) submissionData.monthlyVolume = monthlyVolume;
    if (targetRevenue) submissionData.targetRevenue = targetRevenue;
    if (yearsExperience) submissionData.yearsExperience = yearsExperience;
    if (currentChallenges) submissionData.currentChallenges = currentChallenges;
    
    // Only add enum fields if they have valid values
    if (businessType && ['buyer', 'seller'].includes(businessType)) {
      submissionData.businessType = businessType;
    }
    if (primaryGoal && ['profit', 'growth'].includes(primaryGoal)) {
      submissionData.primaryGoal = primaryGoal;
    }

    console.log("💾 Creating submission with data:", {
      hasFormData: !!submissionData.formData,
      formDataSize: Object.keys(submissionData.formData || {}).length,
      currentStep: submissionData.currentStep,
      isCompleted: submissionData.isCompleted
    });

    // Create new submission
    const analyticsData = await DataAnalytics.create(submissionData);

    console.log("✅ Submission created successfully:", analyticsData._id);

    res.status(201).json({
      success: true,
      message: "Analytics submission created successfully",
      data: analyticsData,
    });
  } catch (error) {
    console.error("❌ Error creating analytics submission:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error("Validation errors:", validationErrors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating analytics submission",
      error: error.message,
    });
  }
};

// @desc    Update existing analytics form submission
// @route   PUT /api/analytics/:id
// @access  Public
export const updateAnalyticsSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    console.log("📝 Updating submission:", id, {
      hasFormData: !!updates.formData,
      currentStep: updates.currentStep,
      isCompleted: updates.isCompleted
    });

    // Clean up enum fields - remove if empty string
    if (updates.businessType === '') {
      delete updates.businessType;
    }
    if (updates.primaryGoal === '') {
      delete updates.primaryGoal;
    }

    // Get current submission
    const currentSubmission = await DataAnalytics.findById(id);
    if (!currentSubmission) {
      return res.status(404).json({
        success: false,
        message: "Analytics submission not found",
      });
    }

    // If formData is provided, merge it with existing formData
    if (updates.formData) {
      updates.formData = {
        ...(currentSubmission.formData || {}),
        ...updates.formData
      };
      console.log("🔄 Merged formData:", Object.keys(updates.formData));
    }

    // Update completion status if provided
    if (updates.isCompleted !== undefined) {
      console.log("✓ Setting isCompleted:", updates.isCompleted);
    }

    // Find and update the submission
    const analyticsData = await DataAnalytics.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: false, // Disable validators for updates to allow partial data
      }
    );

    console.log("✅ Submission updated successfully");

    res.status(200).json({
      success: true,
      message: "Analytics submission updated successfully",
      data: analyticsData,
    });
  } catch (error) {
    console.error("❌ Error updating analytics submission:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating analytics submission",
      error: error.message,
    });
  }
};

// @desc    Get all analytics submissions
// @route   GET /api/analytics
// @access  Private (Admin)
export const getAllAnalyticsSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || "-createdAt";
    const filter = req.query.filter || {};

    // Build filter object
    const filterObj = {};
    if (filter.businessType) filterObj.businessType = filter.businessType;
    if (filter.primaryGoal) filterObj.primaryGoal = filter.primaryGoal;
    if (filter.selectedOption) filterObj.selectedOption = filter.selectedOption;
    if (filter.isCompleted !== undefined) filterObj.isCompleted = filter.isCompleted === "true";

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Get submissions with pagination
    const submissions = await DataAnalytics.find(filterObj)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-ipAddress -userAgent"); // Hide sensitive data

    // Get total count for pagination
    const totalSubmissions = await DataAnalytics.countDocuments(filterObj);
    const totalPages = Math.ceil(totalSubmissions / limit);

    res.status(200).json({
      success: true,
      message: "Analytics submissions retrieved successfully",
      data: {
        submissions,
        pagination: {
          currentPage: page,
          totalPages,
          totalSubmissions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics submissions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics submissions",
      error: error.message,
    });
  }
};

// @desc    Get single analytics submission by ID
// @route   GET /api/analytics/:id
// @access  Private (Admin)
export const getAnalyticsSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await DataAnalytics.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Analytics submission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Analytics submission retrieved successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching analytics submission:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics submission",
      error: error.message,
    });
  }
};

// @desc    Get analytics submission by email
// @route   GET /api/analytics/email/:email
// @access  Public (for form autofill)
export const getAnalyticsSubmissionByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const submission = await DataAnalytics.findOne({ email })
      .select("-ipAddress -userAgent"); // Hide sensitive data

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Analytics submission retrieved successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching analytics submission by email:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics submission",
      error: error.message,
    });
  }
};

// @desc    Delete analytics submission
// @route   DELETE /api/analytics/:id
// @access  Private (Admin)
export const deleteAnalyticsSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await DataAnalytics.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Analytics submission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Analytics submission deleted successfully",
      data: { id: submission._id },
    });
  } catch (error) {
    console.error("Error deleting analytics submission:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting analytics submission",
      error: error.message,
    });
  }
};

// @desc    Get analytics dashboard summary
// @route   GET /api/analytics/dashboard/summary
// @access  Private (Admin)
export const getAnalyticsSummary = async (req, res) => {
  try {
    const summary = await DataAnalytics.getAnalyticsSummary();
    
    // Get recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSubmissions = await DataAnalytics.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get completion rate
    const completionRate = summary.totalSubmissions > 0 
      ? ((summary.completedSubmissions / summary.totalSubmissions) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      message: "Analytics summary retrieved successfully",
      data: {
        ...summary,
        recentSubmissions,
        completionRate: parseFloat(completionRate),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics summary",
      error: error.message,
    });
  }
};

// @desc    Export analytics data to CSV
// @route   GET /api/analytics/export/csv
// @access  Private (Admin)
export const exportAnalyticsToCSV = async (req, res) => {
  try {
    const submissions = await DataAnalytics.find({})
      .select("-ipAddress -userAgent -__v")
      .sort("-createdAt");

    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data to export",
      });
    }

    // Convert to CSV format
    const csvHeaders = [
      "ID",
      "First Name",
      "Last Name", 
      "Email",
      "User Type",
      "Domain Name",
      "Domain Price",
      "Domain Category",
      "Business Type",
      "Monthly Volume",
      "Target Revenue",
      "Years Experience",
      "Primary Goal",
      "Current Step",
      "Is Completed",
      "Created At",
      "Updated At"
    ];

    const csvRows = submissions.map(submission => [
      submission._id,
      submission.firstName,
      submission.lastName,
      submission.email,
      submission.selectedOption,
      submission.domainName || "",
      submission.domainPrice || "",
      submission.domainCategory || "",
      submission.businessType || "",
      submission.monthlyVolume || "",
      submission.targetRevenue || "",
      submission.yearsExperience || "",
      submission.primaryGoal || "",
      submission.currentStep,
      submission.isCompleted,
      submission.createdAt.toISOString(),
      submission.updatedAt.toISOString()
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=analytics-submissions.csv");
    res.status(200).send(csvContent);

  } catch (error) {
    console.error("Error exporting analytics data:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting analytics data",
      error: error.message,
    });
  }
};

// @desc    Recalculate completion status for all submissions
// @route   POST /api/analytics/recalculate-completion
// @access  Private (Admin)
export const recalculateCompletion = async (req, res) => {
  try {
    const submissions = await DataAnalytics.find({});
    let updatedCount = 0;

    for (const submission of submissions) {
      const shouldBeCompleted = submission.currentStep === 3 && 
                               submission.primaryGoal && 
                               submission.monthlyVolume && 
                               submission.targetRevenue && 
                               submission.yearsExperience;

      if (submission.isCompleted !== shouldBeCompleted) {
        await DataAnalytics.findByIdAndUpdate(submission._id, {
          isCompleted: shouldBeCompleted
        });
        updatedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Recalculated completion status for ${updatedCount} submissions`,
      data: {
        totalSubmissions: submissions.length,
        updatedSubmissions: updatedCount
      }
    });
  } catch (error) {
    console.error("Error recalculating completion status:", error);
    res.status(500).json({
      success: false,
      message: "Error recalculating completion status",
      error: error.message,
    });
  }
};