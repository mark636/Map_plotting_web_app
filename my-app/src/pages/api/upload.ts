// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { saveCoords } from './coordinates';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser'; // ✅ make sure you're using `csv-parser` not `csv`

// Disable Next.js body parsing
export const config = {
    api: {
        bodyParser: false,
    },
};

// Set up multer to store files in /tmp
const upload = multer({ dest: '/tmp' });

// Promisify the middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: unknown) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

// Convert DMM to Decimal Degrees
function dmmToDecimal(coord: string): number {
    const dir = coord.slice(-1); // Last character (N, S, E, W)
    const value = coord.slice(0, -1); // All but the last

    let degrees: number;
    let minutes: number;

    if (['N', 'S'].includes(dir)) {
        degrees = parseInt(value.slice(0, 2));
        minutes = parseFloat(value.slice(2));
    } else {
        degrees = parseInt(value.slice(0, 3));
        minutes = parseFloat(value.slice(3));
    }

    let decimal = degrees + minutes / 60;
    if (['S', 'W'].includes(dir)) {
        decimal *= -1;
    }

    return parseFloat(decimal.toFixed(8));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // Run the upload middleware
        await runMiddleware(req, res, upload.single('file'));

        const file = (req as any).file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const coordinates: { lat: number; lon: number }[] = [];

        // Process the uploaded CSV file
        fs.createReadStream(file.path)
            .pipe(csvParser({ headers: ['Latitude', 'Longitude'] }))
            .on('data', (row) => {
                saveCoords(row); // Save coordinates to the database
                res.json({ row});
                //console.log('Row:', row);
                try {
                    const lat = dmmToDecimal(row['Latitude']);
                    const lon = dmmToDecimal(row['Longitude']);
                    coordinates.push({ lat, lon });
                } catch (e) {
                    console.warn('Invalid row skipped:', row);
                }
            })
            .on('end', () => {
                fs.unlinkSync(file.path); // Optional: clean up temp file
                return res.status(200).json({ coordinates });
            })
            .on('error', (err) => {
                return res.status(500).json({ error: err.message });
            });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
