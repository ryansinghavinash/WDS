import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5275"; // Change if needed

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
    if (!groups[p.BarcodeID]) groups[p.BarcodeID] = [];
    groups[p.BarcodeID].push(p);
  });
  return Object.values(groups);
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
    } catch (err) {
      setError("Failed to load picklists");
    }
    setLoading(false);
  }

  // Group picklists by BarcodeID
  const grouped = groupByBarcode(picklists);

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
            return (
              <div
                key={p.BarcodeID + idx}
                style={{
                  background: "#fff",
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
                  Barcode: {p.BarcodeID}
                </div>
                <div>Route: {p.RouteName || "-"}</div>
                <div>Location: {p.ItemLocation || "-"}</div>
                <div>SalesPerson: {p.SalesPerson || "-"}</div>
                <div>Delivery: {formatDate(p.DeliveryDate)}</div>
                <div>Picker: {p.PickerName || <span style={{ color: "#888" }}>Unassigned</span>}</div>
                <div>Start: {formatTime(p.StartTime)} | Elapsed: {formatElapsed(p.StartTime, p.CompletionTime)}</div>
                <div>Expected: {p.ExpectedTimeInMinutes} min</div>
                <div style={{ fontWeight: "bold" }}>Status: {p.Status}</div>
                <div style={{ marginTop: "10px", fontWeight: "bold", fontSize: "0.95rem" }}>Lines/Items:</div>
                <ul style={{ paddingLeft: "18px", fontSize: "0.95rem" }}>
                  {group.map((line, i) => (
                    <li key={i}>
                      Location: {line.ItemLocation} | SalesPerson: {line.SalesPerson} | Status: {line.Status}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}