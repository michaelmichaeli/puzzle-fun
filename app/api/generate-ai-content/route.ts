import { NextRequest } from "next/server";
import { AiGeneratedContent } from "@/types/puzzle";
import { createClarifaiAPI } from "../clarifai";

const MODEL_ID = "general-image-recognition";
const MODEL_VERSION_ID = "aa7f35c01e0642fda5cf400f543e7c40";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response("Image URL is required", { status: 400 });
    }

    if (!process.env.CLARIFAI_PAT) {
      return new Response("Server configuration error", { status: 500 });
    }

    const clarifai = createClarifaiAPI({
      userId: process.env.CLARIFAI_USER_ID || "clarifai",
      appId: process.env.CLARIFAI_APP_ID || "main",
      pat: process.env.CLARIFAI_PAT,
    });

    try {
      const response = await clarifai.predictImage(
        imageUrl,
        MODEL_ID,
        MODEL_VERSION_ID,
      );

      if (!response.outputs?.[0]?.data?.concepts) {
        return new Response("Invalid response from Clarifai", { status: 500 });
      }
      const concepts = response.outputs[0].data.concepts
        .slice(0, 5)
        .map((c) => c.name);
      const aiContent: AiGeneratedContent = {
        title: concepts[0] || "Untitled",
        description: `This image appears to show ${concepts.join(", ")}.`,
        context: `The image was analyzed using Clarifai's general image recognition model, which identified these key elements with high confidence.`,
      };

      return new Response(JSON.stringify(aiContent), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return new Response(`Error calling Clarifai API: ${errorMessage}`, {
        status: 500,
      });
    }
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }
}
