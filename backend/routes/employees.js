const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const dataPath = path.join(__dirname, "..", "data", "employees.json");

function readEmployees() {
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

function writeEmployees(employees) {
  fs.writeFileSync(dataPath, JSON.stringify(employees, null, 2));
}

// Strip sensitive fields before sending to client
function sanitize(emp) {
  const { password, ...safe } = emp;
  return safe;
}

// GET /api/employees — retrieve all employees
router.get("/", (req, res) => {
  try {
    const employees = readEmployees();
    res.json(employees.map(sanitize));
  } catch (err) {
    res.status(500).json({ error: "Failed to read employee data" });
  }
});

// GET /api/employees/:id — retrieve a single employee
router.get("/:id", (req, res) => {
  try {
    const employees = readEmployees();
    const employee = employees.find((e) => e.id === req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(sanitize(employee));
  } catch (err) {
    res.status(500).json({ error: "Failed to read employee data" });
  }
});

// POST /api/employees — create a new employee
router.post("/", (req, res) => {
  const { firstName, lastName, email, department, salary, imageUrl, username, password, phone, address, onboardingDate } = req.body;

  if (!firstName || !lastName || !email) {
    return res
      .status(400)
      .json({ error: "firstName, lastName, and email are required" });
  }

  try {
    const employees = readEmployees();
    const newEmployee = {
      id: uuidv4(),
      firstName,
      lastName,
      username: username || "",
      password: password || "",
      email,
      phone: phone || "",
      address: address || "",
      onboardingDate: onboardingDate || "",
      department: department || "",
      salary: Number(salary) || 0,
      imageUrl: imageUrl || "",
    };
    employees.push(newEmployee);
    writeEmployees(employees);
    res.status(201).json(sanitize(newEmployee));
  } catch (err) {
    res.status(500).json({ error: "Failed to save employee" });
  }
});

// PUT /api/employees/:id — update an existing employee
router.put("/:id", (req, res) => {
  const { firstName, lastName, email, department, salary, imageUrl, username, password, phone, address, onboardingDate } = req.body;

  if (!firstName || !lastName || !email) {
    return res
      .status(400)
      .json({ error: "firstName, lastName, and email are required" });
  }

  try {
    const employees = readEmployees();
    const index = employees.findIndex((e) => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Employee not found" });

    employees[index] = {
      ...employees[index],
      firstName,
      lastName,
      email,
      phone: phone !== undefined ? phone : (employees[index].phone || ""),
      address: address !== undefined ? address : (employees[index].address || ""),
      onboardingDate: onboardingDate !== undefined ? onboardingDate : (employees[index].onboardingDate || ""),
      department: department || "",
      salary: Number(salary) || 0,
      imageUrl: imageUrl || "",
    };
    if (username !== undefined) employees[index].username = username;
    if (password !== undefined) employees[index].password = password;

    writeEmployees(employees);
    res.json(sanitize(employees[index]));
  } catch (err) {
    res.status(500).json({ error: "Failed to update employee" });
  }
});

// DELETE /api/employees/:id — delete an employee
router.delete("/:id", (req, res) => {
  try {
    const employees = readEmployees();
    const index = employees.findIndex((e) => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Employee not found" });

    const [deleted] = employees.splice(index, 1);
    writeEmployees(employees);
    res.json(sanitize(deleted));
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

module.exports = router;
