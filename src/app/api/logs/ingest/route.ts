import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Transmit directly to your production Axiom dataset wrapper ingestion pipeline
    if (process.env.AXIOM_INGEST_URL) {
      await fetch(process.env.AXIOM_INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([payload]), // Axiom natively expects array structures
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal log allocation failure." }, { status: 500 });
  }
}
