import { useState, useEffect } from "react";
import "./EmployeePortal.css";

async function parseApiResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "string" ? body : body?.error || fallbackMessage;
    throw new Error(message || fallbackMessage);
  }

  return body;
}

function EmployeePortal() {
  const [employee, setEmployee] = useState(null);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ firstName: "", lastName: "", email: "", username: "", password: "", phone: "", address: "" });
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", imageUrl: "", phone: "", address: "" });
  const [editing, setEditing] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    fetch("/api/employee/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setEmployee(data);
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            imageUrl: data.imageUrl || "",
            phone: data.phone || "",
            address: data.address || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/employee/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await parseApiResponse(res, "Login failed");
      setEmployee(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        imageUrl: data.imageUrl || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.username || !registerData.password) {
      setError("First name, last name, email, username, and password are required.");
      return;
    }

    try {
      const res = await fetch("/api/employee/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await parseApiResponse(res, "Registration failed");
      setEmployee(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        imageUrl: data.imageUrl || "",
        phone: data.phone || "",
        address: data.address || "",
      });
      setRegistering(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogout() {
    await fetch("/api/employee/logout", { method: "POST" });
    setEmployee(null);
    setEditing(false);
    setLoginData({ username: "", password: "" });
    setSuccess("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("First name, last name, and email are required.");
      return;
    }

    try {
      let imageUrl = formData.imageUrl;

      if (selectedImage) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("image", selectedImage);

        const uploadRes = await fetch("/api/employee/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploaded = await parseApiResponse(uploadRes, "Image upload failed");
        imageUrl = uploaded.imageUrl;
      }

      const res = await fetch("/api/employee/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, imageUrl }),
      });
      const updated = await parseApiResponse(res, "Update failed");
      setEmployee(updated);
      setFormData({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        imageUrl: updated.imageUrl || "",
        phone: updated.phone || "",
        address: updated.address || "",
      });
      setSelectedImage(null);
      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  // Login form
  if (!employee) {
    if (registering) {
      return (
        <div className="portal">
          <div className="portal-card">
            <h2>Create Account</h2>
            {error && <p className="portal-error">{error}</p>}
            <form onSubmit={handleRegister}>
              <div className="form-row">
                <label>
                  First Name *
                  <input
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    required
                    autoFocus
                  />
                </label>
                <label>
                  Last Name *
                  <input
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label>
                Email *
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </label>
              <div className="form-row">
                <label>
                  Username *
                  <input
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Password *
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label>
                Phone
                <input
                  type="text"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  placeholder="555-123-4567"
                />
              </label>
              <label>
                Home Address
                <input
                  type="text"
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                  placeholder="123 Main St, City, State ZIP"
                />
              </label>
              <button type="submit">Create Account</button>
            </form>
            <p className="portal-toggle">
              Already have an account?{" "}
              <button type="button" className="btn-link" onClick={() => { setRegistering(false); setError(""); }}>Log In</button>
            </p>
            <p className="portal-toggle">
              <a href="/admin/login" className="btn-link">Admin Login</a>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="portal">
        <div className="portal-card">
          <h2>Employee Login</h2>
          {error && <p className="portal-error">{error}</p>}
          <form onSubmit={handleLogin}>
            <label>
              Username
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
                autoFocus
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </label>
            <button type="submit">Log In</button>
          </form>
          <p className="portal-toggle">
            New employee?{" "}
            <button type="button" className="btn-link" onClick={() => { setRegistering(true); setError(""); }}>Create Account</button>
          </p>
          <p className="portal-toggle">
            <a href="/admin" className="btn-link">Admin</a>
          </p>
        </div>
      </div>
    );
  }

  // Profile view / edit
  return (
    <div className="portal">
      <div className="portal-card">
        <div className="portal-header">
          <h2>Welcome, {employee.firstName}!</h2>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>

        {success && <p className="portal-success">{success}</p>}
        {error && <p className="portal-error">{error}</p>}

        {!editing ? (
          <div className="profile-view">
            <div className="profile-avatar">
              <img src={employee.imageUrl || "/images/default.svg"} alt={employee.firstName} />
            </div>
            <div className="profile-info">
              <p><strong>Name:</strong> {employee.firstName} {employee.lastName}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Phone:</strong> {employee.phone || "—"}</p>
              <p><strong>Address:</strong> {employee.address || "—"}</p>
              <p><strong>Department:</strong> {employee.department}</p>
              <p><strong>Onboarding Date:</strong> {employee.onboardingDate || "—"}</p>
              <p><strong>Username:</strong> {employee.username}</p>
            </div>
            <button className="btn-edit-profile" onClick={() => { setEditing(true); setSuccess(""); }}>
              Edit My Info
            </button>
          </div>
        ) : (
          <form className="profile-edit" onSubmit={handleSave}>
            <div className="form-row">
              <label>
                First Name *
                <input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </label>
              <label>
                Last Name *
                <input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Email *
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Phone
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="555-123-4567"
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Home Address
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State ZIP"
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Upload Photo (optional)
                <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Save"}
              </button>
              <button type="button" onClick={() => { setEditing(false); setError(""); }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EmployeePortal;
