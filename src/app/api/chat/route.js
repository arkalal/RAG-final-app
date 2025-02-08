import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(req) {
  try {
    const { message, namespace } = await req.json();

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      // environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

    // Create vector store
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex, namespace }
    );

    // Setup retriever
    const retriever = vectorStore.asRetriever();

    // Create chat model
    const model = new ChatOpenAI({
      modelName: "gpt-4o-2024-08-06",
      temperature: 0.9,
    });

    // Create prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
      Answer the question based only on the following context:
      {context}
      
      Question: {question}
      
      Answer in a helpful and detailed way. If you cannot answer based on the context, say so. Always answer in brief and to the point.
    `);

    // Create chain
    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt,
      outputParser: new StringOutputParser(),
    });

    // Get relevant documents
    const docs = await retriever.getRelevantDocuments(message);

    // Generate response
    const response = await chain.invoke({
      question: message,
      context: docs,
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Error processing chat" },
      { status: 500 }
    );
  }
}
