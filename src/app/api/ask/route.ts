import { NextRequest } from "next/server";
import OpenAI from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionContentPart,
} from "openai/resources/chat/completions";
import { transformStream } from "@crayonai/stream";

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed",
  apiKey: process.env.THESYS_API_KEY,
});

type AttachedFilePayload = {
  base64: string;
  mimeType: string;
  fileName: string;
};

/**
 * Build the user message content, supporting multimodal (image/PDF) attachments.
 */
function buildUserContent(
  prompt: string,
  attachedFile?: AttachedFilePayload
): string | ChatCompletionContentPart[] {
  if (!attachedFile) {
    return prompt;
  }

  const parts: ChatCompletionContentPart[] = [
    { type: "text", text: prompt },
  ];

  if (attachedFile.mimeType.startsWith("image/")) {
    // Images: use image_url with base64 data URL
    parts.push({
      type: "image_url",
      image_url: {
        url: `data:${attachedFile.mimeType};base64,${attachedFile.base64}`,
      },
    });
  } else if (attachedFile.mimeType === "application/pdf") {
    // PDFs: use file content part
    parts.push({
      type: "file",
      file: {
        data: attachedFile.base64,
        filename: attachedFile.fileName,
      },
    } as ChatCompletionContentPart);
  }

  return parts;
}

export async function POST(req: NextRequest) {
  const { prompt, previousC1Response, attachedFile } = (await req.json()) as {
    prompt: string;
    previousC1Response?: string;
    attachedFile?: AttachedFilePayload;
  };

  const messages: ChatCompletionMessageParam[] = [];

  if (previousC1Response) {
    messages.push({
      role: "assistant",
      content: previousC1Response,
    });
  }

  messages.push({
    role: "user",
    content: buildUserContent(prompt, attachedFile),
  });

  const llmStream = await client.chat.completions.create({
    model: "c1/openai/gpt-5/v-20251230",
    messages: [...messages],
    stream: true,
  });

  const responseStream = transformStream(llmStream, (chunk) => {
    return chunk.choices[0]?.delta?.content || "";
  });

  return new Response(responseStream as ReadableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
