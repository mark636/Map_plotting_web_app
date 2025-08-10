// In-memory temporary store
let lastUploadedCoords: { lat: number; lon: number }[] = [];

export function saveCoords(coords: { lat: number; lon: number }[]) {
  lastUploadedCoords = coords;
}

export default function handler(req, res) {
  res.status(200).json({ coordinates: lastUploadedCoords });
}
