import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import { allowedImageMimeTypes } from "../utils/evidenceValidation.js";

const maxFileSizeBytes = 5 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 4,
    fileSize: maxFileSizeBytes,
    fields: 32,
    fieldNameSize: 100,
    fieldSize: 10000,
    parts: 60
  },
  fileFilter: (req, file, callback) => {
    if (file.fieldname !== "evidenceFiles") {
      callback(new ApiError("Use the evidenceFiles field for screenshot uploads.", 400, "UNEXPECTED_FILE_FIELD"));
      return;
    }

    if (!allowedImageMimeTypes.has(file.mimetype)) {
      callback(new ApiError("Only PNG, JPG and WebP screenshots are supported.", 400, "UNSUPPORTED_FILE_TYPE"));
      return;
    }

    callback(null, true);
  }
});

export function requireMultipartFormData(req, res, next) {
  if (!req.is("multipart/form-data")) {
    next(new ApiError("Submit the incident as multipart/form-data.", 415, "INVALID_CONTENT_TYPE"));
    return;
  }

  next();
}

export const parseIncidentMultipart = upload.array("evidenceFiles", 4);
