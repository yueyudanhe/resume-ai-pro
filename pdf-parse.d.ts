declare module "pdf-parse" {
  interface PDFParseResult {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
    version: string;
  }

  function pdfParse(data: Buffer): Promise<PDFParseResult>;

  export default pdfParse;
}
