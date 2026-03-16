import "./Navbar.css";

function Navbar({ onAddClick }) {
  return (
    <nav className="navbar">
      <h1>Employee Management System</h1>
      <div className="navbar-actions">
        <button onClick={onAddClick}>Add Employee</button>
        <a href="/web" className="btn-admin">Add file</a>
        <a href="/admin/logout" className="btn-logout-link">Logout</a>
      </div>
    </nav>
  );
}

export default Navbar;
