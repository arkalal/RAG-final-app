import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

export async function POST(req) {
  try {
    const { namespace } = await req.json();

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      // environment: process.env.PINECONE_ENVIRONMENT,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX);

    if (namespace) {
      await index.deleteAll({ namespace });
    } else {
      await index.deleteAll();
    }

    return NextResponse.json({ message: "Data cleared successfully" });
  } catch (error) {
    console.error("Error clearing data:", error);
    return NextResponse.json({ error: "Error clearing data" }, { status: 500 });
  }
}
