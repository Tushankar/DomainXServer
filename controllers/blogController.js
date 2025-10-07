import Blog from "../models/Blog.js";

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const { status, category, limit, skip } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 100)
      .skip(parseInt(skip) || 0);

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message,
    });
  }
};

// Get single blog by ID or slug
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by MongoDB _id first, then by slug
    let blog = await Blog.findById(id).catch(() => null);
    
    if (!blog) {
      blog = await Blog.findOne({ slug: id });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

// Create new blog
export const createBlog = async (req, res) => {
  try {
    const blogData = req.body;

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const blog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};

// Get blog statistics
export const getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: "published" });
    const draftBlogs = await Blog.countDocuments({ status: "draft" });
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalBlogs,
        published: publishedBlogs,
        drafts: draftBlogs,
        totalViews: totalViews[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog statistics",
      error: error.message,
    });
  }
};
