import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

const MOCK_IMAGE_PAYLOAD =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

test.describe("High-Fidelity Document Generation Sizing Matrix Verification", () => {
  test("Verify API endpoint outputs exact CR80 layout point sizes", async ({ request }) => {
    const response = await request.post("/api/pdf/export-badge", {
      data: {
        imageBase64: MOCK_IMAGE_PAYLOAD,
        textMetadata: {
          documentNumber: "E2E-DAQ-88125",
          documentDiscriminator: "E2E-DCF-09X",
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("application/pdf");

    const pdfBufferBytes = await response.body();
    const pdfDoc = await PDFDocument.load(pdfBufferBytes);

    const pages = pdfDoc.getPages();
    expect(pages.length).toBe(1);

    const { width, height } = pages[0].getSize();

    expect(Math.round(width)).toBe(243);
    expect(Math.round(height)).toBe(153);
  });
});
