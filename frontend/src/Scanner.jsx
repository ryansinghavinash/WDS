import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5275";

export default function Scanner() {
  const [barcode, setBarcode] = useState("");
  const [picker, setPicker] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/picklists/employees`);
      setEmployees(res.data);
    } catch (err) {
      setError("Failed to load employees");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!barcode) {
      setError("Please enter or scan a BarcodeID");
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/picklists/scan`, {
        BarcodeID: barcode,
        PickerName: picker,
      });
      setSuccess("Scan submitted successfully!");
      setBarcode("");
      setPicker("");
    } catch (err) {
      setError("Failed to submit scan");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">Scanner View</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Scan or enter BarcodeID"
          className="w-full border p-2 rounded mb-4"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
        />
        <select
          className="w-full border p-2 rounded mb-4"
          value={picker}
          onChange={e => setPicker(e.target.value)}
        >
          <option value="">Select Picker</option>
          {employees.map((emp, i) => (
            <option key={i} value={emp.FullName}>{emp.FullName}</option>
          ))}
        </select>
        <button className="w-full bg-blue-700 text-white py-2 rounded font-bold" type="submit">
          Submit
        </button>
      </form>
      {loading && <div className="mt-2 text-gray-500">Loading employees...</div>}
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {success && <div className="mt-2 text-green-600">{success}</div>}
    </div>
  );
} 