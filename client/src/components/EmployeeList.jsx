import "./EmployeeList.css";

function EmployeeList({ employees, onEdit, onDelete }) {
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
                <img
                  className="emp-avatar"
                  src={emp.imageUrl || "/images/default.svg"}
                  alt={emp.firstName + " " + emp.lastName}
                />
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
    </div>
  );
}

export default EmployeeList;
