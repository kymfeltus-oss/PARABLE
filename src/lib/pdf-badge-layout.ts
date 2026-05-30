/** CR80 card size in PDF points (1/72 inch) — ISO/IEC 7810 ID-1 landscape. */
export const CR80_WIDTH_PT = 243;
export const CR80_HEIGHT_PT = 153;

export type BadgeTextMetadata = {
  documentNumber: string;
  documentDiscriminator: string;
};

export function parseDataUrlBase64(imageBase64: string): Uint8Array {
  const trimmed = imageBase64.trim();
  const match = /^data:image\/(png|jpeg|jpg);base64,(.+)$/i.exec(trimmed);
  const payload = match ? match[2] : trimmed;
  return Uint8Array.from(Buffer.from(payload, "base64"));
}
