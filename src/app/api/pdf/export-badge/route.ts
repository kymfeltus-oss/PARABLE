import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  CR80_HEIGHT_PT,
  CR80_WIDTH_PT,
  parseDataUrlBase64,
  type BadgeTextMetadata,
} from "@/lib/pdf-badge-layout";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ExportBadgeBody = {
  imageBase64?: string;
  textMetadata?: Partial<BadgeTextMetadata>;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as ExportBadgeBody;
    const imageBase64 = body.imageBase64?.trim();

    if (!imageBase64) {
      return jsonError("Missing imageBase64 payload.");
    }

    const textMetadata: BadgeTextMetadata = {
      documentNumber: body.textMetadata?.documentNumber?.trim() || "DOC-0000",
      documentDiscriminator:
        body.textMetadata?.documentDiscriminator?.trim() || "DCF-00",
    };

    const imageBytes = parseDataUrlBase64(imageBase64);
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([CR80_WIDTH_PT, CR80_HEIGHT_PT]);

    const isPng = imageBase64.toLowerCase().includes("image/png");
    const embedded = isPng
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: CR80_WIDTH_PT,
      height: CR80_HEIGHT_PT,
    });

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const labelSize = 6;
    page.drawText(textMetadata.documentNumber, {
      x: 8,
      y: CR80_HEIGHT_PT - 14,
      size: labelSize,
      font,
      color: rgb(0.1, 0.12, 0.14),
    });
    page.drawText(textMetadata.documentDiscriminator, {
      x: 8,
      y: 6,
      size: labelSize,
      font,
      color: rgb(0, 0.75, 0.82),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="parable-badge.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "PDF export failed";
    console.error("[PDF_EXPORT_BADGE]", message);
    return jsonError(message, 500);
  }
}
