import { fileTypeFromBuffer } from "file-type";
import { ApiError } from "./ApiError.js";

export const allowedImageMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const fileTypeMessage = "Only PNG, JPG and WebP screenshots are supported.";

function safeOriginalName(name) {
  if (typeof name !== "string" || name.length === 0) {
    return "uploaded-screenshot";
  }

  return name.slice(0, 255);
}

export async function validateEvidenceFiles(files = []) {
  const validatedFiles = [];

  for (const file of files) {
    const detected = await fileTypeFromBuffer(file.buffer);

    if (!detected || !allowedImageMimeTypes.has(detected.mime)) {
      throw new ApiError(fileTypeMessage, 400, "UNSUPPORTED_FILE_TYPE");
    }

    if (!allowedImageMimeTypes.has(file.mimetype) || detected.mime !== file.mimetype) {
      throw new ApiError(fileTypeMessage, 400, "UNSUPPORTED_FILE_TYPE");
    }

    validatedFiles.push({
      originalName: safeOriginalName(file.originalname),
      mimeType: file.mimetype,
      detectedType: detected.mime,
      size: file.size,
      buffer: file.buffer
    });
  }

  return validatedFiles;
}
