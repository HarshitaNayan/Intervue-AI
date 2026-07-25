import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// pdfjs-dist needs this to render PDFs that rely on the standard 14
// fonts instead of embedding their own — without it, extraction still
// mostly works but throws an UnknownErrorException warning per file
// and can mis-handle glyphs for those fonts.
const STANDARD_FONT_DATA_URL = path.join(__dirname, '../node_modules/pdfjs-dist/standard_fonts') + '/';

const MAX_CHARS = 6000; // keeps the prompt a reasonable size

// pdf-parse (the more commonly reached-for library) wraps a frozen,
// years-old internal build of pdf.js and genuinely fails ("bad XRef
// entry") on real-world PDFs, including ones jsPDF itself generates —
// confirmed by testing both libraries against the same file. pdfjs-dist
// is the actively maintained library and handled every test file
// correctly, so that's what this uses.
async function extractPdfText(buffer) {
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
  }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }
  return text;
}

export async function extractResumeText(file) {
  const { originalname, mimetype, buffer } = file;
  const isPdf = mimetype === 'application/pdf' || /\.pdf$/i.test(originalname);
  const isDocx = /\.docx?$/i.test(originalname) ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isTxt = mimetype === 'text/plain' || /\.txt$/i.test(originalname);

  let text;
  if (isPdf) {
    text = await extractPdfText(buffer);
  } else if (isDocx) {
    const parsed = await mammoth.extractRawText({ buffer });
    text = parsed.value;
  } else if (isTxt) {
    text = buffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported resume file type: ${mimetype || originalname}`);
  }

  const cleaned = text.replace(/\s+\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim();
  if (!cleaned) throw new Error('No extractable text found in the uploaded file.');

  return cleaned.length > MAX_CHARS ? cleaned.slice(0, MAX_CHARS) + '\n[truncated]' : cleaned;
}
