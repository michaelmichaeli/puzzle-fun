import { NextRequest } from "next/server";
import { AiGeneratedContent } from "@/types/puzzle";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response("Image URL is required", { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response("Server configuration error", { status: 500 });
    }

    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are an AI image analysis expert. Analyze the image and provide:
          1. A concise title (1-3 words) that captures the main subject
          2. A brief description (1 sentence) highlighting the key elements
          3. A contextual explanation that describes the image's contents and significance
          Format your response as:
          <title> | <description> | <context>
          Use the '|' separator without line breaks.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and return its Title, Description, and Context in a structured format."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 700
      });

      const analysis = response.choices[0].message?.content || "";
      const [title, description, context] = analysis
        .split("|")
        .map((str: string) => str.trim());

      const aiContent: AiGeneratedContent = {
        title: title || "Puzzle",
        description: description || "An intriguing puzzle image",
        context: context || "A fascinating puzzle waiting to be solved"
      };

      return new Response(JSON.stringify(aiContent), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return new Response(`Error analyzing image: ${errorMessage}`, {
        status: 500
      });
    }
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }
}
