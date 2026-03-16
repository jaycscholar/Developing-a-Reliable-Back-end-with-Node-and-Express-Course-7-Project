import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminApp from "./components/AdminApp";
import EmployeePortal from "./components/EmployeePortal";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<EmployeePortal />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
