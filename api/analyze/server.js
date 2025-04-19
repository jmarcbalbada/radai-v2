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
    console.log("HIT ANALYZE");
    // Create a mock FormData object that matches what the route expects
    req.formData = () => {
      const formData = new FormData();
      formData.get = (key) => {
        if (key === "file") {
          return {
            arrayBuffer: async () => req.file.buffer,
            name: req.file.originalname,
          };
        }
        return null;
      };
      return Promise.resolve(formData);
    };

    const response = await POST(req);

    // Handle binary response
    if (response.headers.get("Content-Type") === "image/png") {
      const buffer = await response.arrayBuffer();
      res.set("Content-Type", "image/png");
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

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
