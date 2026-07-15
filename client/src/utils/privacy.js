export function maskValue(value, type = "generic") {
  if (!value) return "Not detected";
  if (type === "email") {
    const [name, domain] = value.split("@");
    return domain ? `${name.slice(0, 1)}***@${domain}` : "******";
  }
  if (type === "phone") return value.replace(/\d(?=\d{4})/g, "*");
  if (type === "upi") {
    const [name, handle] = value.split("@");
    return handle ? `${name.slice(0, 1)}***@${handle}` : "******";
  }
  return value.length > 4 ? `${"*".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}` : "****";
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}
