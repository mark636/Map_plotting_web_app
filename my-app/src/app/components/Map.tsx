import { memo, useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { Icon, LatLngLiteral } from "leaflet";
//import "leaflet/dist/leaflet.css";
///import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
//import "leaflet-defaulticon-compatibility";

type MapType = "Roadmap" | "Satellite" | "Hybrid" | "Terrain";
type MapLocation = LatLngLiteral & { id: string };
export type MapProps = { center: LatLngLiteral; locations: MapLocation[] };

// Memoize icons outside component
const mapMarkIcon = new Icon({
  iconUrl: "/map-marker-removebg-preview.png",
  iconSize: [36, 42],
});
const mapMarkActiveIcon = new Icon({
  iconUrl: "/map-marker-removebg-preview.png",
  iconSize: [42, 48],
});

// Only pan when center changes
const PanTo = memo(function PanTo({ center }: { center: LatLngLiteral }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(center, { animate: true });
  }, [center, map]);
  return null;
});

export const Map = memo(function Map({ center, locations }: MapProps) {
  const [mapType, setMapType] = useState<MapType>("Roadmap");
  const [selectedId, setSelectedId] = useState<string | null>(null);

const tileUrl = useMemo(() => {
  const urls: Record<MapType, string> = {
    Roadmap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    Satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    Hybrid: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    Terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  };
  return urls[mapType];
}, [mapType]);

  // Memoize markers and eventHandlers
  const markers = useMemo(
    () =>
      locations.map((loc) => (
        <Marker
          key={loc.id}
          icon={loc.id === selectedId ? mapMarkActiveIcon : mapMarkIcon}
          position={loc}
          eventHandlers={{
            click: () => setSelectedId(loc.id),
          }}
        />
      )),
    [locations, selectedId]
  );

  // Find selected location or fallback to center
  const panTarget = useMemo(
    () =>
      selectedId
        ? locations.find((l) => l.id === selectedId) || center
        : center,
    [selectedId, locations, center]
  );

  return (
    <>
      <div
      style={{
        width: "100%",
        height: "80vh", // Adjusted height
        borderRadius: "12px",
        overflow: "hidden",
        background: "#e0f7fa", // Adjusted background color
      }}
      >
      <MapContainer
        center={center}
        zoom={8}
        minZoom={3}
        zoomControl={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url={tileUrl} />
        <PanTo center={panTarget} />
        {markers}
        <ZoomControl position="topright" />
      </MapContainer>
      </div>
      <div
      style={{
        display: "flex",
        marginTop: 10,
        gap: 10,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
      >
      <button
        style={{
        backgroundColor: "#007bff",
        color: "#fff",
        fontSize: "16px", // Increased font size
        padding: "8px 12px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        }}
        onClick={() => setMapType("Roadmap")}
      >
        Roadmap
      </button>
      <button
        style={{
        backgroundColor: "#28a745",
        color: "#fff",
        fontSize: "16px", // Increased font size
        padding: "8px 12px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        }}
        onClick={() => setMapType("Satellite")}
      >
        Satellite
      </button>
      <button
        style={{
        backgroundColor: "#17a2b8",
        color: "#fff",
        fontSize: "16px", // Increased font size
        padding: "8px 12px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        }}
        onClick={() => setMapType("Terrain")}
      >
        Terrain
      </button>
      </div>
    </>
  );
});