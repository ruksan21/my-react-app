import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Home/Nav/Navbar";
import Login from "./Home/Auth/Login";
import Register from "./Home/Auth/Register";
import Forget from "./Home/Auth/Forget";
import About from "./Home/Pages/About";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navbar showHomeContent={true} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forget />} />
      </Routes>
    </Router>
  );
}

export default App;
