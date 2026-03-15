require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const employeeRoutes = require("./routes/employees");

const app = express();
const PORT = process.env.PORT || 3000;
const runningOnServerless = Boolean(process.env.VERCEL);
const uploadsDir = runningOnServerless ? path.join("/tmp", "uploads") : path.join(__dirname, "uploads");
let mongoConnectPromise = null;
const mongoConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  maxPoolSize: 5,
};

async function ensureMongoConnection() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoConnectPromise) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not set in environment");
    }

    mongoConnectPromise = mongoose.connect(mongoUri, mongoConnectOptions).catch((err) => {
      mongoConnectPromise = null;
      throw err;
    });
  }

  await mongoConnectPromise;
}

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  // Avoid crashing function startup on read-only filesystems.
  console.error("Failed to initialize uploads directory:", err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

const imageUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(async (req, res, next) => {
  try {
    await ensureMongoConnection();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve employee images as static files
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/employees", employeeRoutes);

app.post("/api/uploads", imageUpload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  return res.status(201).json({
    imageUrl: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
  });
});

// Server-rendered page demo (Pug + cookie-parser)
app.get("/web", (req, res) => {
  const previousVisits = Number(req.cookies.visits || 0);
  const visits = previousVisits + 1;
  const previousLastVisit = req.cookies.lastVisit || "First visit";

  res.cookie("visits", String(visits), { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.cookie("lastVisit", new Date().toISOString(), { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.render("dashboard", {
    title: "EMS Server Dashboard",
    heading: "Express + Pug + Cookies",
    visits,
    lastVisit: previousLastVisit,
    uploadMessage: null,
    uploadUrl: null,
    uploadName: null,
  });
});

app.post("/web/upload", upload.single("uploadFile"), (req, res) => {
  const previousVisits = Number(req.cookies.visits || 0);
  const previousLastVisit = req.cookies.lastVisit || "First visit";

  if (!req.file) {
    return res.status(400).render("dashboard", {
      title: "EMS Server Dashboard",
      heading: "Express + Pug + Cookies",
      visits: previousVisits,
      lastVisit: previousLastVisit,
      uploadMessage: "No file selected.",
      uploadUrl: null,
      uploadName: null,
    });
  }

  const uploadUrl = `/uploads/${req.file.filename}`;

  res.render("dashboard", {
    title: "EMS Server Dashboard",
    heading: "Express + Pug + Cookies",
    visits: previousVisits,
    lastVisit: previousLastVisit,
    uploadMessage: "File uploaded successfully.",
    uploadUrl,
    uploadName: req.file.originalname,
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "EMS API is running" });
});

async function startServer() {
  try {
    await ensureMongoConnection();
    console.log("MongoDB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
