import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

export async function POST(req) {
  try {
    const { namespace } = await req.json();

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX);

    try {
      if (namespace) {
        await index.namespace(namespace).deleteAll();
      } else {
        await index.deleteAll();
      }

      return NextResponse.json({ message: "Data cleared successfully" });
    } catch (error) {
      console.error("Pinecone delete error:", error);
      return NextResponse.json(
        { error: "Failed to clear data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error clearing data:", error);
    return NextResponse.json({ error: "Error clearing data" }, { status: 500 });
  }
}
