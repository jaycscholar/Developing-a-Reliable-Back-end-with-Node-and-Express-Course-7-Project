const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const employeeRoutes = require("./routes/employees");

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Admin credentials
const ADMIN_USER = "adminRB";
const ADMIN_PASS = "house123";
const COOKIE_SECRET = "ems-signed-cookie-secret";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));

function requireAdmin(req, res, next) {
  if (req.signedCookies.admin === "true") return next();
  res.redirect("/admin/login");
}

function requireApiAuth(req, res, next) {
  if (req.signedCookies.admin === "true") return next();
  res.status(401).json({ error: "Unauthorized" });
}

function requireEmployee(req, res, next) {
  if (req.signedCookies.employeeId) return next();
  res.status(401).json({ error: "Unauthorized" });
}

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve employee images as static files
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/employees", requireApiAuth, employeeRoutes);

app.post("/api/uploads", requireApiAuth, imageUpload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    imageUrl,
    originalName: req.file.originalname,
  });
});

// Admin login page
app.get("/admin/login", (req, res) => {
  res.render("login", { title: "Admin Login", error: null });
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.cookie("admin", "true", { signed: true, httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    return res.redirect("/admin");
  }
  res.status(401).render("login", { title: "Admin Login", error: "Invalid username or password" });
});

app.get("/admin/logout", (req, res) => {
  res.clearCookie("admin");
  res.redirect("/admin/login");
});

// Server-rendered dashboard demo (Pug + cookie-parser)
app.get("/web", requireAdmin, (req, res) => {
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

app.post("/web/upload", requireAdmin, upload.single("uploadFile"), (req, res) => {
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

// Employee self-service registration
app.post("/api/employee/register", (req, res) => {
  const { firstName, lastName, email, username, password, phone, address } = req.body;

  if (!firstName || !lastName || !email || !username || !password) {
    return res.status(400).json({ error: "firstName, lastName, email, username, and password are required" });
  }

  try {
    const dataFile = path.join(__dirname, "data", "employees.json");
    const raw = fs.readFileSync(dataFile, "utf-8");
    const employees = JSON.parse(raw);

    if (employees.some((e) => e.username === username)) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const { v4: uuidv4 } = require("uuid");
    const newEmployee = {
      id: uuidv4(),
      firstName,
      lastName,
      username,
      password,
      email,
      phone: phone || "",
      address: address || "",
      onboardingDate: new Date().toISOString().split("T")[0],
      department: "",
      salary: 0,
      imageUrl: "",
    };

    employees.push(newEmployee);
    fs.writeFileSync(dataFile, JSON.stringify(employees, null, 2));

    res.cookie("employeeId", newEmployee.id, { signed: true, httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    const { password: _, ...safe } = newEmployee;
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Employee self-service login
app.post("/api/employee/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const raw = fs.readFileSync(path.join(__dirname, "data", "employees.json"), "utf-8");
    const employees = JSON.parse(raw);
    const employee = employees.find(
      (e) => e.username === username && e.password === password
    );
    if (!employee) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.cookie("employeeId", employee.id, { signed: true, httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    const { password: _, ...safe } = employee;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/employee/logout", (req, res) => {
  res.clearCookie("employeeId");
  res.json({ message: "Logged out" });
});

// GET own profile
app.get("/api/employee/me", requireEmployee, (req, res) => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "data", "employees.json"), "utf-8");
    const employees = JSON.parse(raw);
    const employee = employees.find((e) => e.id === req.signedCookies.employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    const { password, ...safe } = employee;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: "Failed to read employee data" });
  }
});

// PUT own profile (employees can edit their own info, but not salary/department/onboardingDate)
app.put("/api/employee/me", requireEmployee, (req, res) => {
  const { firstName, lastName, email, imageUrl, phone, address } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "firstName, lastName, and email are required" });
  }

  try {
    const dataFile = path.join(__dirname, "data", "employees.json");
    const raw = fs.readFileSync(dataFile, "utf-8");
    const employees = JSON.parse(raw);
    const index = employees.findIndex((e) => e.id === req.signedCookies.employeeId);
    if (index === -1) return res.status(404).json({ error: "Employee not found" });

    employees[index] = {
      ...employees[index],
      firstName,
      lastName,
      email,
      phone: phone !== undefined ? phone : (employees[index].phone || ""),
      address: address !== undefined ? address : (employees[index].address || ""),
      imageUrl: imageUrl || employees[index].imageUrl || "",
    };
    fs.writeFileSync(dataFile, JSON.stringify(employees, null, 2));
    const { password, ...safe } = employees[index];
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Employee image upload (self-service)
app.post("/api/employee/upload", requireEmployee, imageUpload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ imageUrl, originalName: req.file.originalname });
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "EMS API is running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
