import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import PDFParser from "pdf2json";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    // Convert PDF to text
    const pdfParser = new PDFParser();
    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfText = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = pdfData.Pages.map((page) =>
          page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
        ).join("\n");
        resolve(text);
      });
      pdfParser.parseBuffer(buffer);
    });

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await splitter.createDocuments([pdfText]);

    // Initialize Pinecone and create embeddings
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      // environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

    // Create and store embeddings with metadata
    const embeddings = new OpenAIEmbeddings();
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      namespace: file.name,
      metadata: {
        fileName: file.name,
        timestamp: new Date().toISOString(),
        chunkSize: 1000,
        overlapSize: 200,
      },
    });

    return NextResponse.json({
      message: "File processed successfully",
      namespace: file.name,
    });
  } catch (error) {
    console.error("Error in upload:", error);
    return NextResponse.json(
      { error: "Error processing file" },
      { status: 500 }
    );
  }
}
