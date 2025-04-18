import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import fetch from "node-fetch";
import FormData from "form-data";
import { createCanvas, loadImage } from "canvas";
import path from "path";

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);
    formData.append(
      "model",
      "https://hub.ultralytics.com/models/SMt917G5PhT5W142f1Iq"
    );
    formData.append("imgsz", "640");
    formData.append("conf", "0.25");
    formData.append("iou", "0.45");

    const response = await fetch("https://predict.ultralytics.com", {
      method: "POST",
      headers: {
        "x-api-key": "3b5056ac3a9ea918ac838037d777446ba97e9ad3fc",
      },
      body: formData,
    });

    const data = await response.json();

    const detections = data.images[0]?.results || [];

    console.log("Detected results:", detections);

    // Load the image into a canvas
    const image = await loadImage(req.file.buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw the image onto the canvas first
    ctx.drawImage(image, 0, 0);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.font = "12px Arial";
    ctx.fillStyle = "red";

    for (const obj of detections) {
      const { x1, y1, x2, y2 } = obj.box;
      const label = `${obj.name} (${(obj.confidence * 100).toFixed(1)}%)`;

      // Draw bounding box
      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.stroke();

      // Draw the label above the box
      ctx.fillText(label, x1, y1 > 20 ? y1 - 5 : y1 + 20);
    }

    // Convert the canvas with bounding boxes to a buffer
    const outputBuffer = canvas.toBuffer("image/png");

    res.set("Content-Type", "image/png");
    res.send(outputBuffer);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
