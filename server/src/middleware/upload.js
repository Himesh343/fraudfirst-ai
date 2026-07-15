import multer from "multer";
import { AppError } from "../utils/errors.js";

export const MAX_FILES = 4;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const SIGNATURES = {
  "image/png": ["89504e47"],
  "image/jpeg": ["ffd8ff"],
  "image/webp": ["52494646"]
};

function hasExpectedSignature(file) {
  const header = file.buffer.subarray(0, 12).toString("hex");
  return SIGNATURES[file.mimetype]?.some((signature) => header.startsWith(signature));
}

export const evidenceUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_FILES,
    fileSize: MAX_FILE_SIZE,
    fieldSize: 120_000,
    fields: 20
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return cb(new AppError("Only PNG, JPEG and WebP screenshots are supported.", 400, "UNSUPPORTED_FILE_TYPE"));
    }
    cb(null, true);
  }
}).array("evidenceFiles", MAX_FILES);

export function validateUploadedFiles(req, res, next) {
  const files = req.files || [];
  if (files.length > MAX_FILES) {
    return next(new AppError("You can upload up to 4 screenshots.", 400, "TOO_MANY_FILES"));
  }
  const invalidFile = files.find((file) => !ALLOWED_IMAGE_TYPES.has(file.mimetype) || !hasExpectedSignature(file));
  if (invalidFile) {
    return next(new AppError("One screenshot did not match its supported image type.", 400, "UNSUPPORTED_FILE_TYPE"));
  }
  next();
}
