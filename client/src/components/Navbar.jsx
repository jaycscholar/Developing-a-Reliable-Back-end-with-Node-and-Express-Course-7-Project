import "./Navbar.css";

function Navbar({ onAddClick }) {
  return (
    <nav className="navbar">
      <h1>Employee Management System</h1>
      <button onClick={onAddClick}>Add Employee</button>
    </nav>
  );
}

export default Navbar;
