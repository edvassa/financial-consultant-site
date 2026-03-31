import { Router, Request, Response } from "express";
import multer from "multer";
import { storagePut } from "../storage";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post("/upload-content-file", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = req.file;
    const fileKey = `content-files/${Date.now()}-${file.originalname}`;

    // Upload to S3
    const { url } = await storagePut(fileKey, file.buffer, file.mimetype);

    return res.json({
      success: true,
      url,
      fileName: file.originalname,
      fileType: file.mimetype,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;
