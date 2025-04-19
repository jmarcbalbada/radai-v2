import formidable from "formidable";
import { createCanvas, loadImage } from "canvas";
import FormData from "form-data";
import fetch from "node-fetch";

export const runtime = "edge";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Prepare form data for YOLO API
    const yoloFormData = new FormData();
    yoloFormData.append("file", buffer, file.name);
    yoloFormData.append(
      "model",
      "https://hub.ultralytics.com/models/SMt917G5PhT5W142f1Iq"
    );
    yoloFormData.append("imgsz", "640");
    yoloFormData.append("conf", "0.25");
    yoloFormData.append("iou", "0.45");

    // Call YOLO API
    const response = await fetch("https://predict.ultralytics.com", {
      method: "POST",
      headers: {
        "x-api-key": "3b5056ac3a9ea918ac838037d777446ba97e9ad3fc",
      },
      body: yoloFormData,
    });

    const data = await response.json();
    const detections = data.images[0]?.results || [];

    // Process image with detections
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Draw detections
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

      // Draw label
      ctx.fillText(label, x1, y1 > 20 ? y1 - 5 : y1 + 20);
    }

    // Convert canvas to buffer and send response
    const outputBuffer = canvas.toBuffer("image/png");

    return new Response(outputBuffer, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to analyze image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
