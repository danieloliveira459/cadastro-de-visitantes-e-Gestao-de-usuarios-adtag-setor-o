import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Pastor from "./pages/Pastor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pastor" element={<Pastor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;