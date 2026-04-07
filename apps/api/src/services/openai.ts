import OpenAI from "openai";
import { buildVisualPrompts, extractScriptTags } from "../data/store.js";

const openaiApiKey = process.env.OPENAI_API_KEY?.trim() ?? "";

const client = openaiApiKey
  ? new OpenAI({
      apiKey: openaiApiKey
    })
  : null;

type AnalysisResult = {
  provider: "openai" | "stub";
  nextStep?: string;
  tags: Array<{ label: "vocab" | "grammar"; value: string }>;
  visualPrompts: string[];
};

const extractTextOutput = (response: any) => {
  if (typeof response.output_text === "string" && response.output_text.length > 0) {
    return response.output_text;
  }

  return "";
};

export const analyzeScriptWithAI = async (script: string): Promise<AnalysisResult> => {
  const tags = extractScriptTags(script);

  if (!client) {
    return {
      provider: "stub",
      nextStep: "Set OPENAI_API_KEY to enable live analysis.",
      tags,
      visualPrompts: buildVisualPrompts(script, tags)
    };
  }

  try {
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You analyze educational scripts for a 3D animation studio. Return valid JSON only with keys tags and visualPrompts. tags must be an array of objects with label vocab or grammar and value. visualPrompts must be an array of short cinematic prompts."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: script
            }
          ]
        }
      ]
    });

    const outputText = extractTextOutput(response);
    const parsed = JSON.parse(outputText) as {
      tags?: Array<{ label: "vocab" | "grammar"; value: string }>;
      visualPrompts?: string[];
    };

    return {
      provider: "openai",
      tags: parsed.tags?.length ? parsed.tags : tags,
      visualPrompts:
        parsed.visualPrompts?.length ? parsed.visualPrompts : buildVisualPrompts(script, tags)
    };
  } catch (_error) {
    return {
      provider: "stub",
      nextStep: "OpenAI request failed. Using local prompt generator fallback.",
      tags,
      visualPrompts: buildVisualPrompts(script, tags)
    };
  }
};
