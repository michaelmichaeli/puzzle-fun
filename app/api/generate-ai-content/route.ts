import { NextRequest } from "next/server";
import { AiGeneratedContent } from "@/types/puzzle";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response("Image URL is required", { status: 400 });
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image and provide a descriptive title, a brief description of what you see, and any interesting historical or cultural context. Format the response as a JSON object with 'title', 'description', and 'context' fields. Keep the title under 50 characters, the description under 150 characters, and the context under 200 characters.",
                },
                {
                  type: "image_url",
                  image_url: imageUrl,
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error("OpenAI API error");
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);

      const aiContent: AiGeneratedContent = {
        title: content.title,
        description: content.description,
        context: content.context,
      };

      return new Response(JSON.stringify(aiContent), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return new Response("Error generating content", { status: 500 });
    }
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }
}
