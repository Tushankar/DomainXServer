import express from "express";
import dotenv from "dotenv";
// Force server restart for new routes
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import contentRoutes from "./routes/contentRoutes.js";
import dataAnalyticsRoutes from "./routes/dataAnalyticsRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import buyerAuthRoutes from "./routes/buyerAuthRoutes.js";
import resellerAuthRoutes from "./routes/resellerAuthRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";
import formConfigRoutes from "./routes/formConfigRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://domainx.netlify.app",
        "http://localhost:5173",
        "http://localhost:3000", // in case they use a different port
        process.env.CLIENT_URL,
      ].filter(Boolean); // Remove any undefined values

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Serve static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/content", contentRoutes);
app.use("/api/analytics", dataAnalyticsRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/buyer/auth", buyerAuthRoutes);
app.use("/api/reseller/auth", resellerAuthRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api", formConfigRoutes);

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
