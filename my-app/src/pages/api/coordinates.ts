import type { NextApiRequest, NextApiResponse } from "next";

// In-memory temporary store
let lastUploadedCoords: { lat: number; lng: number }[] = [];

export function saveCoords(coords: { lat: number; lng: number }[]) {
  lastUploadedCoords = coords;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ coordinates: lastUploadedCoords });
}
