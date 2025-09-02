// /api/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { aggregateResponse } from "@/lib/aggregator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' in request body." },
        { status: 400 }
      );
    }

    const result = await aggregateResponse(query, context || "");
    console.log(result)
    // const content=result.finalAnswer

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Query Route Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Optional: handle other HTTP methods if needed
export async function GET() {
  return NextResponse.json({ error: "GET not supported. Use POST." }, { status: 405 });
}
