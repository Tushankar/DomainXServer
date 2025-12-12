import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    author: {
      type: String,
      required: true,
      default: " Domainsxchange Team",
    },
    authorBio: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    category: {
      type: String,
      default: "General",
    },
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: String,
      default: "",
    },
    publishedDate: {
      type: Date,
      default: null,
    },
    metaTitle: {
      type: String,
      default: "",
    },
    metaDescription: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from title before saving
blogSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

// Auto-generate excerpt from content if not provided
blogSchema.pre("save", function (next) {
  if (!this.excerpt && this.content) {
    // Strip HTML tags and get first 200 characters
    const plainText = this.content.replace(/<[^>]*>/g, "");
    this.excerpt = plainText.substring(0, 200) + "...";
  }
  next();
});

// Auto-calculate reading time if not provided
blogSchema.pre("save", function (next) {
  if (!this.readTime && this.content) {
    // Strip HTML tags
    const plainText = this.content.replace(/<[^>]*>/g, "");
    // Average reading speed: 200 words per minute
    const wordCount = plainText.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    this.readTime = `${minutes} min read`;
  }
  next();
});

// Set published date when status changes to published
blogSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedDate) {
    this.publishedDate = new Date();
  }
  next();
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
