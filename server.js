import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/database.js";
import contentRoutes from "./routes/contentRoutes.js";
import dataAnalyticsRoutes from "./routes/dataAnalyticsRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/content", contentRoutes);
app.use("/api/analytics", dataAnalyticsRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/auth", passwordResetRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "DomainX CMS Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      content: "/api/content",
      sections: "/api/content/:section",
      analytics: "/api/analytics",
      analyticsSubmission: "/api/analytics/:id",
      analyticsByEmail: "/api/analytics/email/:email",
      analyticsSummary: "/api/analytics/dashboard/summary",
      analyticsExport: "/api/analytics/export/csv",
      adminAuth: "/api/admin/auth",
      adminLogin: "/api/admin/auth/login",
      adminRegister: "/api/admin/auth/register",
      adminProfile: "/api/admin/auth/profile",
      blogs: "/api/blogs",
      blogById: "/api/blogs/:id",
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});
