import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import PDFParser from "pdf2json";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert PDF to text using pdf2json
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

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      // environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

    // Create embeddings and store in Pinecone
    const embeddings = new OpenAIEmbeddings();
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      namespace: file.name, // Using filename as namespace
    });

    return NextResponse.json({
      message: "PDF processed successfully",
      namespace: file.name,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Error processing PDF" },
      { status: 500 }
    );
  }
}
