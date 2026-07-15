export const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_FILES = 4;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateFiles(existingCount, files, t = null) {
  const translate = t || ((key, values = {}) => {
    const fallback = {
      "upload.fileTooMany": "You can upload up to 4 screenshots.",
      "upload.unsupported": `${values.name} is not a supported image type.`,
      "upload.tooLarge": `${values.name} is larger than 5 MB.`
    };
    return fallback[key];
  });
  const errors = [];
  if (existingCount + files.length > MAX_FILES) {
    errors.push(translate("upload.fileTooMany"));
  }
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) errors.push(translate("upload.unsupported", { name: file.name }));
    if (file.size > MAX_FILE_SIZE) errors.push(translate("upload.tooLarge", { name: file.name }));
  }
  return errors;
}

export function hasMeaningfulEvidence(state) {
  return state.evidenceFiles.length > 0 || state.suspiciousText.trim().length >= 8 || state.incidentDescription.trim().length >= 20;
}
