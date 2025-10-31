import Tesseract from "tesseract.js";

export async function extractTextFromImage(dataUrl: string): Promise<string> {
  const result = await Tesseract.recognize(dataUrl, "fra+eng", {
    logger: (m) => console.log(m),
  });
  return result.data.text.trim();
}
