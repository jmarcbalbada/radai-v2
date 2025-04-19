import express from "express";
import multer from "multer";
import sharp from "sharp";
import FormData from "form-data";
import fetch from "node-fetch";
import fs from "fs";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());

// Set up multer for handling file uploads
const upload = multer();

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  console.log("HIT ANALYZE ENDPOINT");
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    // Verify the file buffer is present
    if (!fileBuffer) {
      return res.status(400).json({ error: "Invalid file buffer" });
    }

    const yoloFormData = new FormData();
    yoloFormData.append("file", fileBuffer, fileName);
    yoloFormData.append(
      "model",
      "https://hub.ultralytics.com/models/SMt917G5PhT5W142f1Iq"
    );
    yoloFormData.append("imgsz", "640");
    yoloFormData.append("conf", "0.25");
    yoloFormData.append("iou", "0.45");

    const yoloResponse = await fetch("https://predict.ultralytics.com", {
      method: "POST",
      headers: {
        "x-api-key": "3b5056ac3a9ea918ac838037d777446ba97e9ad3fc",
      },
      body: yoloFormData,
    });

    const data = await yoloResponse.json();
    console.log("YOLO Response Data:", data);
    const detections = data.images[0]?.results || [];
    console.log("Detected Objects:", detections);

    if (detections.length === 0) {
      console.log("No detections found.");
      return res.status(400).json({ error: "No objects detected" });
    }

    const image = sharp(fileBuffer);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;

    const imageWithBoxes = await image
      .clone()
      .ensureAlpha()
      .composite(
        detections
          .map((obj) => {
            const { x1, y1, x2, y2 } = obj.box;
            console.log("Bounding Box Coordinates:", x1, y1, x2, y2);

            // Skip invalid bounding boxes
            if (
              x1 === undefined ||
              y1 === undefined ||
              x2 === undefined ||
              y2 === undefined
            ) {
              console.log("Skipping invalid bounding box:", obj);
              return [];
            }

            const label = `${obj.name} (${(obj.confidence * 100).toFixed(1)}%)`;

            const svgData = `<svg width="${width}" height="${height}">
          <rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${
              y2 - y1
            }" fill="none" stroke="red" stroke-width="2" />
          <text x="${x1}" y="${
              y1 > 20 ? y1 - 5 : y1 + 20
            }" font-size="16" fill="red">${label}</text>
        </svg>`;

            console.log("SVG Data:", svgData);

            return [
              {
                input: Buffer.from(svgData),
                blend: "over",
              },
            ];
          })
          .flat()
      )
      .resize(width, height)
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.send(imageWithBoxes);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
