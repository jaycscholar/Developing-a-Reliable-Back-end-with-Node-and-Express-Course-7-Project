const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

// GET /api/employees — retrieve all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to read employee data" });
  }
});

// GET /api/employees/:id — retrieve a single employee
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Employee not found" });
  }
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: "Failed to read employee data" });
  }
});

// POST /api/employees — create a new employee
router.post("/", async (req, res) => {
  const { firstName, lastName, email, department, salary, imageUrl } = req.body;

  if (!firstName || !lastName || !email) {
    return res
      .status(400)
      .json({ error: "firstName, lastName, and email are required" });
  }

  try {
    const created = await Employee.create({
      firstName,
      lastName,
      email,
      department: department || "",
      salary: Number(salary) || 0,
      imageUrl: imageUrl || "",
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to save employee" });
  }
});

// PUT /api/employees/:id — update an existing employee
router.put("/:id", async (req, res) => {
  const { firstName, lastName, email, department, salary, imageUrl } = req.body;

  if (!firstName || !lastName || !email) {
    return res
      .status(400)
      .json({ error: "firstName, lastName, and email are required" });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Employee not found" });
  }

  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        department: department || "",
        salary: Number(salary) || 0,
        imageUrl: imageUrl || "",
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Employee not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update employee" });
  }
});

// DELETE /api/employees/:id — delete an employee
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Employee not found" });
  }
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Employee not found" });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

module.exports = router;
