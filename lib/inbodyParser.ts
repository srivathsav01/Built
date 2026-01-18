export function extractValue(text: string, label: string) {
  const regex = new RegExp(`${label}\\s*(\\d+\\.\\d+)`, "i");
  const match = regex.exec(text);
  return match ? parseFloat(match[1]) : null;
}