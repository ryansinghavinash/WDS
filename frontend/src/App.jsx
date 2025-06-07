import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import KDSDisplay from "./KDSDisplay";
import Scanner from "./Scanner";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-900 text-white p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">Warehouse Picklist Display</h1>
          <nav>
            <Link to="/" className="mr-16 text-lg hover:underline">Display</Link>
            <Link to="/scanner" className="text-lg hover:underline">Scanner</Link>
          </nav>
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<KDSDisplay />} />
            <Route path="/scanner" element={<Scanner />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
