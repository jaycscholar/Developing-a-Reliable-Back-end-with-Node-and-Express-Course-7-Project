import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import "./App.css";

function App() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const formRef = useRef(null);

  async function fetchEmployees() {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
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
      await fetch(`/api/employees/${id}`, { method: "DELETE" });
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
    <div className="app">
      <Navbar onAddClick={handleAddClick} />
      <main className="container">
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
      </main>
    </div>
  );
}

export default App;
