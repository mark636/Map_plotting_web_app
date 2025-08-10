"use client";
import dynamic from "next/dynamic";
import React, { useState, useCallback, useEffect } from "react";
import Papa from "papaparse";

// Only keep the dynamic import, not the static import
const MapComponent = dynamic(
  () => import("./components/Map").then((mod) => mod.Map),
  { ssr: false }
);

// Faster DMM to decimal using regex; supports 4023.6174N
const dmmRegex = /^(\d{2,3})(\d{2}\.\d+)([NSEW])$/;
function dmmToDecimal(coord: string): number {
  const c = coord.trim().toUpperCase();
  const m = dmmRegex.exec(c);
  if (!m) return NaN;
  const degrees = parseInt(m[1], 10);
  const minutes = parseFloat(m[2]);
  let val = degrees + minutes / 60;
  if (m[3] === "S" || m[3] === "W") val *= -1;
  return +val.toFixed(8);
}

type Loc = { id: string; lat: number; lng: number };

export default function HomePage() {
  const [locations, setLocations] = useState<Loc[]>([]);
  const [visibleLocations, setVisibleLocations] = useState<Loc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);

    Papa.parse<string[]>(file, {
      worker: true,
      skipEmptyLines: true,
      fastMode: true,
      dynamicTyping: false,
      delimiter: "", // auto-detect
      complete: (results) => {
        const rows = results.data as any[];
        const parsed: Loc[] = [];
        for (const row of rows) {
            // Accept first two columns or tab/comma separated single string
          let latRaw: string | undefined;
          let lngRaw: string | undefined;

          if (Array.isArray(row) && row.length >= 2) {
            latRaw = String(row[0]).trim();
            lngRaw = String(row[1]).trim();
          } else if (typeof row === "string") {
            const parts = row.split(/\s+|,|\t/).filter(Boolean);
            if (parts.length >= 2) {
              latRaw = parts[0].trim();
              lngRaw = parts[1].trim();
            }
          }
          if (!latRaw || !lngRaw) continue;
          const lat = dmmToDecimal(latRaw);
            // Some files may use longitude with more degree digits
          const lng = dmmToDecimal(lngRaw);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
          parsed.push({ id: String(parsed.length), lat, lng });
        }
        setLocations(parsed);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (locations.length > 500) {
      setVisibleLocations(locations.slice(0, 500));
      window.requestIdleCallback?.(() => setVisibleLocations(locations));
    } else {
      setVisibleLocations(locations);
    }
  }, [locations]);

  const center = locations.length
    ? { lat: locations[0].lat, lng: locations[0].lng }
    : { lat: 51.5074, lng: -0.1278 };

  function handleAddPoint(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Invalid latitude or longitude");
      return;
    }
    setLocations((prev) => [
      ...prev,
      { id: String(prev.length), lat, lng }
    ]);
    setLatInput("");
    setLngInput("");
    setError(null);
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      alignItems: "center",
      padding: "16px"
    }}>
      <input type="file" accept=".csv,.txt" onChange={handleFileChange} />
      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <div>Parsing (worker)…</div>}
      <form onSubmit={handleAddPoint} style={{ display: "flex", gap: "20px" }}>
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={latInput}
          onChange={e => setLatInput(e.target.value)}
          required
          style={{ width: "120px" }}
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={lngInput}
          onChange={e => setLngInput(e.target.value)}
          required
          style={{ width: "120px" }}
        />
        <button
        style={{
        backgroundColor: "#a4aaa6f8",
        color: "#fff",
        fontSize: "16px", // Increased font size
        padding: "8px 12px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        }}
        type="submit"
      >
        Add Point
      </button>
      </form>
      <div style={{ width: "100%", maxWidth: "1200px" }}>
        <MapComponent center={center} locations={visibleLocations} />
      </div>
    </div>
  );
}