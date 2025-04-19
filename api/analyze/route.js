import { createCanvas, loadImage } from "canvas";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    let fileBuffer, fileName;

    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
    } else {
      const formData = await req.formData();
      const file = formData.get("file");
      fileBuffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
    }

    if (!fileBuffer) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // YOLOv8 API call
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
    const detections = data.images[0]?.results || [];

    // Draw detections
    const image = await loadImage(fileBuffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.font = "12px Arial";
    ctx.fillStyle = "red";

    for (const obj of detections) {
      const { x1, y1, x2, y2 } = obj.box;
      const label = `${obj.name} (${(obj.confidence * 100).toFixed(1)}%)`;
      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.stroke();
      ctx.fillText(label, x1, y1 > 20 ? y1 - 5 : y1 + 20);
    }

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
