// pages/map.tsx
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';


// Dynamically import Leaflet map components (to avoid SSR issues)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
import L from 'leaflet';

export default function MapPage() {
    const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }[]>([]);

    useEffect(() => {
        // Replace with actual API endpoint or prop passed from upload page
        fetch('/api/coordinates') // or store after upload
            .then(res => res.json())
            .then(data => setCoordinates(data.coordinates || []))
            .catch(err => console.error(err));
    }, []);

    if (coordinates.length === 0) return <p>Loading coordinates...</p>;

    return (
        <MapContainer
            center={[coordinates[0].lat, coordinates[0].lon]}
            zoom={13}
            style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {coordinates.map((coord, index) => (
                <Marker key={index} position={[coord.lat, coord.lon]} />
            ))}

            <Polyline
                positions={coordinates.map(coord => [coord.lat, coord.lon])}
                pathOptions={{ color: 'blue' }}
            />
        </MapContainer>
    );
}
