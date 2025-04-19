import sharp from "sharp";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // Disable body parser for handling raw multipart data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let fileBuffer, fileName;

    // For Express-based requests (like multer)
    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
    } else {
      // For Vercel-based requests (multipart form data)
      const formData = await req.formData();
      const file = formData.get("file");
      fileBuffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
    }

    if (!fileBuffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Prepare YOLO form data for detection
    const yoloFormData = new FormData();
    yoloFormData.append("file", fileBuffer, fileName);
    yoloFormData.append(
      "model",
      "https://hub.ultralytics.com/models/SMt917G5PhT5W142f1Iq"
    );
    yoloFormData.append("imgsz", "640");
    yoloFormData.append("conf", "0.25");
    yoloFormData.append("iou", "0.45");

    // Make the YOLO request to Ultralytics for image analysis
    const yoloResponse = await fetch("https://predict.ultralytics.com", {
      method: "POST",
      headers: {
        "x-api-key": "3b5056ac3a9ea918ac838037d777446ba97e9ad3fc",
      },
      body: yoloFormData,
    });

    const data = await yoloResponse.json();
    const detections = data.images[0]?.results || [];

    // Use sharp to process the image and draw bounding boxes
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;

    const imageWithBoxes = await image
      .clone()
      .ensureAlpha() // Ensure transparency is handled
      .composite(
        detections.map((obj) => {
          const { x1, y1, x2, y2 } = obj.box;
          const label = `${obj.name} (${(obj.confidence * 100).toFixed(1)}%)`;

          // Return an SVG for each detection, and overlay it on the image
          return [
            {
              input: Buffer.from(
                `<svg width="${width}" height="${height}">
                  <rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${
                  y2 - y1
                }" fill="none" stroke="red" stroke-width="2" />
                  <text x="${x1}" y="${
                  y1 > 20 ? y1 - 5 : y1 + 20
                }" font-size="12" fill="red">${label}</text>
                </svg>`
              ),
              blend: "over", // This blend mode will overlay the SVG on the image
            },
          ];
        })
      )
      .toBuffer(); // Get the processed image buffer with bounding boxes

    // Set the response header and send the processed image
    res.setHeader("Content-Type", "image/png");
    res.send(imageWithBoxes);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
}
