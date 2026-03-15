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
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
      setSelectedImage(null);
    } else {
      setFormData({ firstName: "", lastName: "", email: "", department: "", salary: "", imageUrl: "" });
      setSelectedImage(null);
    }
  }, [employeeToEdit]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
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

    try {
      let imageUrl = formData.imageUrl;

      if (selectedImage) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("image", selectedImage);

        const uploadRes = await fetch("/api/uploads", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error || "Image upload failed");
        }

        const uploaded = await uploadRes.json();
        imageUrl = uploaded.imageUrl;
      }

      const payload = {
        ...formData,
        imageUrl,
        salary: Number(formData.salary) || 0,
      };

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
    } finally {
      setIsUploading(false);
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
          Image URL (optional)
          <input name="imageUrl" placeholder="/uploads/photo.jpg or https://..." value={formData.imageUrl} onChange={handleChange} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Upload Image (optional)
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : employeeToEdit ? "Update" : "Create"}
        </button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default EmployeeForm;
