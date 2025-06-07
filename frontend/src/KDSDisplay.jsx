import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5275"; // Use localhost for backend API access

function formatTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleDateString();
}

function formatElapsed(start, end) {
  if (!start) return "-";
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const mins = Math.round((e - s) / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""}`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs} hr${hrs !== 1 ? "s" : ""}${rem ? ` ${rem} min` : ""}`;
}

function groupByBarcode(picklists) {
  const groups = {};
  picklists.forEach((p) => {
    // Use both BarcodeID and barcodeId for robustness
    const barcode = p.BarcodeID || p.barcodeId || p.barcodeID || p.barcodeid || "unknown";
    if (!groups[barcode]) groups[barcode] = [];
    groups[barcode].push(p);
  });
  return Object.values(groups);
}

// Determine card color based on status and time
function getCardColor({ status, picker, startTime, expectedTime, completionTime }) {
  if (status && status.toLowerCase() === "completed") return "#f3f3f3"; // gray
  if (!picker) return "#e6f0ff"; // blue for unassigned
  if (status && status.toLowerCase() === "active" && startTime && expectedTime) {
    const s = new Date(startTime);
    const now = completionTime ? new Date(completionTime) : new Date();
    const elapsed = (now - s) / 60000;
    if (elapsed > expectedTime) return "#ffe6e6"; // red
    if (elapsed > expectedTime * 0.9) return "#fffbe6"; // yellow
    return "#e6f9e6"; // green
  }
  return "#fff";
}

export default function KDSDisplay() {
  const [picklists, setPicklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPicklists();
    const interval = setInterval(fetchPicklists, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchPicklists() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/picklists/active`);
      setPicklists(res.data);
      console.log("Picklists from API:", res.data); // Debug log
    } catch (err) {
      setError("Failed to load picklists");
    }
    setLoading(false);
  }

  // Group picklists by BarcodeID
  let grouped = groupByBarcode(picklists);

  // Sort: assigned (picker) on top, then unassigned
  grouped = grouped.sort((a, b) => {
    const aAssigned = !!(a[0].PickerName || a[0].pickerName || a[0].pickername);
    const bAssigned = !!(b[0].PickerName || b[0].pickerName || b[0].pickername);
    if (aAssigned === bAssigned) return 0;
    return aAssigned ? -1 : 1;
  });

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#f3f3f3", padding: "40px 0" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "32px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : grouped.length === 0 ? (
          <div>No picklists found.</div>
        ) : (
          grouped.map((group, idx) => {
            const p = group[0];
            // Use robust property checks for all fields
            const barcode = p.BarcodeID || p.barcodeId || p.barcodeID || p.barcodeid || "unknown";
            const route = p.RouteName || p.routeName || p.routename || "-";
            const location = p.ItemLocation || p.itemLocation || p.itemlocation || "-";
            const salesPerson = p.SalesPerson || p.salesPerson || p.salesperson || "-";
            const delivery = p.DeliveryDate || p.deliveryDate || p.deliverydate || null;
            const picker = p.PickerName || p.pickerName || p.pickername || null;
            const startTime = p.StartTime || p.startTime || p.starttime || null;
            const completionTime = p.CompletionTime || p.completionTime || p.completiontime || null;
            const expectedTime = p.ExpectedTimeInMinutes || p.expectedTimeInMinutes || p.expectedtimeinminutes || 0;
            const status = p.Status || p.status || "-";
            const cardColor = getCardColor({ status, picker, startTime, expectedTime, completionTime });
            return (
              <div
                key={barcode + idx}
                style={{
                  background: cardColor,
                  color: "#222",
                  borderRadius: "18px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  border: "1px solid #ddd",
                  padding: "32px",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start"
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "10px" }}>
                  Barcode: {barcode}
                </div>
                <div>Route: {route}</div>
                <div>Location: {location}</div>
                <div>SalesPerson: {salesPerson}</div>
                <div>Delivery: {formatDate(delivery)}</div>
                <div>Picker: {picker ? picker : <span style={{ color: "#888" }}>Unassigned</span>}</div>
                <div>Start: {formatTime(startTime)} | Elapsed: {formatElapsed(startTime, completionTime)}</div>
                <div>Expected: {expectedTime} min</div>
                <div style={{ fontWeight: "bold" }}>Status: {status}</div>
                <div style={{ marginTop: "10px", fontWeight: "bold", fontSize: "0.95rem" }}>Lines/Items:</div>
                <ul style={{ paddingLeft: "18px", fontSize: "0.95rem" }}>
                  {group.map((line, i) => {
                    const lineLocation = line.ItemLocation || line.itemLocation || line.itemlocation || "-";
                    const lineSalesPerson = line.SalesPerson || line.salesPerson || line.salesperson || "-";
                    const lineStatus = line.Status || line.status || "-";
                    return (
                      <li key={i}>
                        Location: {lineLocation} | SalesPerson: {lineSalesPerson} | Status: {lineStatus}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}