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
    <div className="employee-grid-wrapper">
      <div className="employee-grid">
        {employees.map((emp) => (
          <div className="employee-card" key={emp.id}>
            <div className="card-header">
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
              <h3 className="card-name">{emp.firstName} {emp.lastName}</h3>
            </div>
            <div className="card-body">
              <p><span className="card-label">Email:</span> {emp.email}</p>
              <p><span className="card-label">Phone:</span> {emp.phone || "—"}</p>
              <p><span className="card-label">Department:</span> {emp.department}</p>
              <p><span className="card-label">Salary:</span> ${Number(emp.salary).toLocaleString()}</p>
              <p><span className="card-label">Onboarding:</span> {emp.onboardingDate || "—"}</p>
            </div>
            <div className="card-actions">
              <button className="btn-edit" onClick={() => onEdit(emp)}>Edit</button>
              <button className="btn-delete" onClick={() => onDelete(emp.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

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
