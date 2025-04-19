import express from "express";
import cors from "cors";
import multer from "multer";
import { POST } from "./route.js";

const app = express();
const port = 3000;

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const response = await POST(req);

    // Convert Edge Response to Express response
    const contentType = response.headers.get("Content-Type");
    res.set("Content-Type", contentType);

    if (contentType === "image/png") {
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } else {
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/test", (req, res) => {
  res.send("API is running. Use POST /analyze to analyze images.");
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
