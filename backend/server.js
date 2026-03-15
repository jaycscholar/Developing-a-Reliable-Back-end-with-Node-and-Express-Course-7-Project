const express = require("express");
const cors = require("cors");
const path = require("path");
const employeeRoutes = require("./routes/employees");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve employee images as static files
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
app.use("/api/employees", employeeRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "EMS API is running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
