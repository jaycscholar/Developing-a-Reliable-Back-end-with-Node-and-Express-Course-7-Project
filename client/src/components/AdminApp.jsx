import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";

async function parseApiResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "string"
        ? body
        : body?.error || fallbackMessage;
    throw new Error(message || fallbackMessage);
  }

  return body;
}

function AdminApp() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const formRef = useRef(null);

  async function fetchEmployees() {
    try {
      const res = await fetch("/api/employees");
      if (res.status === 401) {
        setUnauthorized(true);
        setEmployees([]);
        return;
      }
      setUnauthorized(false);
      const data = await parseApiResponse(res, "Failed to fetch employees");
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setEmployees([]);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  function handleAddClick() {
    setEmployeeToEdit(null);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function handleEdit(employee) {
    setEmployeeToEdit(employee);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      await parseApiResponse(res, "Failed to delete employee");
      fetchEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
    }
  }

  function handleSave() {
    setShowForm(false);
    setEmployeeToEdit(null);
    fetchEmployees();
  }

  function handleCancel() {
    setShowForm(false);
    setEmployeeToEdit(null);
  }

  return (
    <>
      <Navbar onAddClick={handleAddClick} />
      <main className="container">
        {unauthorized ? (
          <div className="auth-message">
            <p>Please <a href="/admin/login">log in as admin</a> to manage employees.</p>
            <p style={{ marginTop: "0.5rem" }}><a href="/">Back to Employee Portal</a></p>
          </div>
        ) : (
          <>
            {showForm && (
              <div ref={formRef}>
                <EmployeeForm
                  employeeToEdit={employeeToEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </div>
            )}
            <EmployeeList
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>
    </>
  );
}

export default AdminApp;
