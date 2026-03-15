import { useState, useEffect } from "react";
import "./EmployeeForm.css";

function EmployeeForm({ employeeToEdit, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    salary: "",
    imageUrl: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        firstName: employeeToEdit.firstName,
        lastName: employeeToEdit.lastName,
        email: employeeToEdit.email,
        department: employeeToEdit.department,
        salary: employeeToEdit.salary,
        imageUrl: employeeToEdit.imageUrl || "",
      });
    } else {
      setFormData({ firstName: "", lastName: "", email: "", department: "", salary: "", imageUrl: "" });
    }
  }, [employeeToEdit]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("First name, last name, and email are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const payload = {
      ...formData,
      salary: Number(formData.salary) || 0,
    };

    try {
      const isEdit = !!employeeToEdit;
      const url = isEdit
        ? `/api/employees/${employeeToEdit.id}`
        : "/api/employees";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      onSave();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <h2>{employeeToEdit ? "Edit Employee" : "Add Employee"}</h2>
      {error && <p className="form-error">{error}</p>}
      <div className="form-row">
        <label>
          First Name *
          <input name="firstName" value={formData.firstName} onChange={handleChange} />
        </label>
        <label>
          Last Name *
          <input name="lastName" value={formData.lastName} onChange={handleChange} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Email *
          <input name="email" type="email" value={formData.email} onChange={handleChange} />
        </label>
        <label>
          Department
          <input name="department" value={formData.department} onChange={handleChange} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Salary
          <input name="salary" type="number" value={formData.salary} onChange={handleChange} />
        </label>
        <label>
          Image URL
          <input name="imageUrl" placeholder="https://..." value={formData.imageUrl} onChange={handleChange} />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit">{employeeToEdit ? "Update" : "Create"}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default EmployeeForm;
