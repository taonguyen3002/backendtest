export function maskSecret(value, visible = 6) {
  if (!value) return "";

  const str = String(value);

  if (str.length <= visible) return str;

  const maskedLength = str.length - visible;

  return "*".repeat(maskedLength) + str.slice(-visible);
}
