import Content from "../models/Content.js";

// @desc    Get all content
// @route   GET /api/content
// @access  Public
export const getAllContent = async (req, res) => {
  try {
    let content = await Content.findOne();

    // If no content exists, create default content
    if (!content) {
      content = await Content.create({});
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching content",
      error: error.message,
    });
  }
};

// @desc    Update content
// @route   PUT /api/content
// @access  Private (Admin only - can add auth middleware later)
export const updateContent = async (req, res) => {
  try {
    const updates = req.body;
    console.log("📝 Updating content with keys:", Object.keys(updates));

    let content = await Content.findOne();

    if (!content) {
      // Create new content if doesn't exist
      console.log("Creating new content document");
      content = await Content.create(updates);
    } else {
      // Update existing content
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          content[key] = updates[key];
        }
      });
      await content.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error updating content:", error);
    console.error("Error details:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error updating content",
      error: error.message,
    });
  }
};

// @desc    Update specific section
// @route   PUT /api/content/:section
// @access  Private (Admin only)
export const updateSection = async (req, res) => {
  try {
    const { section } = req.params;
    const updates = req.body;

    let content = await Content.findOne();

    if (!content) {
      content = await Content.create({});
    }

    // Update the specific section
    content[section] = { ...content[section], ...updates };
    await content.save();

    res.status(200).json({
      success: true,
      message: `${section} section updated successfully`,
      data: content[section],
    });
  } catch (error) {
    console.error(`Error updating ${req.params.section} section:`, error);
    res.status(500).json({
      success: false,
      message: `Error updating ${req.params.section} section`,
      error: error.message,
    });
  }
};

// @desc    Get specific section
// @route   GET /api/content/:section
// @access  Public
export const getSection = async (req, res) => {
  try {
    const { section } = req.params;
    const content = await Content.findOne();

    if (!content || !content[section]) {
      return res.status(404).json({
        success: false,
        message: `Section '${section}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: content[section],
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.section} section:`, error);
    res.status(500).json({
      success: false,
      message: `Error fetching ${req.params.section} section`,
      error: error.message,
    });
  }
};

// @desc    Reset content to defaults
// @route   POST /api/content/reset
// @access  Private (Admin only)
export const resetContent = async (req, res) => {
  try {
    // Delete existing content
    await Content.deleteMany({});

    // Create new default content
    const content = await Content.create({});

    res.status(200).json({
      success: true,
      message: "Content reset to defaults successfully",
      data: content,
    });
  } catch (error) {
    console.error("Error resetting content:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting content",
      error: error.message,
    });
  }
};
