import { useEffect, useState } from "react";
import "./EmployeeList.css";

function EmployeeList({ employees, onEdit, onDelete }) {
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === "Escape") {
        setExpandedImage(null);
      }
    }

    if (expandedImage) {
      window.addEventListener("keydown", handleEscKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [expandedImage]);

  if (employees.length === 0) {
    return <p className="empty-message">No employees found.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td data-label="Photo">
                <button
                  type="button"
                  className="avatar-button"
                  onClick={() =>
                    setExpandedImage({
                      src: emp.imageUrl || "/images/default.svg",
                      alt: `${emp.firstName} ${emp.lastName}`,
                    })
                  }
                  aria-label={`Expand photo for ${emp.firstName} ${emp.lastName}`}
                >
                  <img
                    className="emp-avatar"
                    src={emp.imageUrl || "/images/default.svg"}
                    alt={emp.firstName + " " + emp.lastName}
                  />
                </button>
              </td>
              <td data-label="Name">{emp.firstName} {emp.lastName}</td>
              <td data-label="Email">{emp.email}</td>
              <td data-label="Department">{emp.department}</td>
              <td data-label="Salary">${Number(emp.salary).toLocaleString()}</td>
              <td className="actions">
                <button className="btn-edit" onClick={() => onEdit(emp)}>Edit</button>
                <button className="btn-delete" onClick={() => onDelete(emp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {expandedImage && (
        <div className="image-modal-backdrop" onClick={() => setExpandedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="image-modal-close"
              onClick={() => setExpandedImage(null)}
              aria-label="Close expanded image"
            >
              x
            </button>
            <img className="image-modal-preview" src={expandedImage.src} alt={expandedImage.alt} />
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;
