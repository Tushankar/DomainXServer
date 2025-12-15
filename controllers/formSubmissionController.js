import FormSubmission from "../models/FormSubmission.js";

// Submit a new form
export const submitForm = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      companyName,
      phone,
      domainName,
      domainPrice,
      message,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !domainName || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create new form submission
    const formSubmission = new FormSubmission({
      firstName,
      lastName,
      email,
      companyName,
      phone,
      domainName,
      domainPrice,
      message,
      status: "pending",
    });

    // Save to database
    await formSubmission.save();

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      data: formSubmission,
    });
  } catch (error) {
    console.error("Form submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit form",
      error: error.message,
    });
  }
};

// Get all form submissions
export const getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    let query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { domainName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const submissions = await FormSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await FormSubmission.countDocuments(query);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// Get single submission
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await FormSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      error: error.message,
    });
  }
};

// Update submission status
export const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!["pending", "contacted", "converted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const submission = await FormSubmission.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Submission updated successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update submission",
      error: error.message,
    });
  }
};

// Export submissions to CSV
export const exportSubmissionsToCSV = async (req, res) => {
  try {
    const submissions = await FormSubmission.find({}).sort({ createdAt: -1 });

    // Create CSV headers
    const csvHeaders = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Domain Name",
      "Domain Price",
      "Message",
      "Status",
      "Created At",
    ];

    // Create CSV rows
    const csvRows = submissions.map((submission) => [
      submission._id,
      submission.firstName || "",
      submission.lastName || "",
      submission.email || "",
      submission.phone || "",
      submission.companyName || "",
      submission.domainName || "",
      submission.domainPrice || "",
      submission.message || "",
      submission.status || "pending",
      submission.createdAt ? new Date(submission.createdAt).toISOString() : "",
    ]);

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=form-submissions-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );

    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export submissions",
      error: error.message,
    });
  }
};

// Delete submission
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await FormSubmission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete submission",
      error: error.message,
    });
  }
};

// Get analytics dashboard
export const getAnalytics = async (req, res) => {
  try {
    const totalSubmissions = await FormSubmission.countDocuments();
    const pendingSubmissions = await FormSubmission.countDocuments({
      status: "pending",
    });
    const contactedSubmissions = await FormSubmission.countDocuments({
      status: "contacted",
    });
    const convertedSubmissions = await FormSubmission.countDocuments({
      status: "converted",
    });

    // Get submissions by date (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSubmissions = await FormSubmission.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Top domains
    const topDomains = await FormSubmission.aggregate([
      {
        $group: {
          _id: "$domainName",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        pendingSubmissions,
        contactedSubmissions,
        convertedSubmissions,
        conversionRate:
          totalSubmissions > 0
            ? ((convertedSubmissions / totalSubmissions) * 100).toFixed(2)
            : 0,
        recentSubmissions,
        topDomains,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};
