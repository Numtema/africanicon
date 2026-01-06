
import { GoogleGenAI, Type } from "@google/genai";
import { IconSuggestion, AfricanPalette, IconStyle } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeProjectContent = async (content: string, palette: AfricanPalette): Promise<IconSuggestion[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Analyze this website content or description: "${content}". 
  Identify 5-8 essential UI icons needed for this project. 
  For each icon, propose a modern African styling inspired by the ${palette} aesthetic. 
  The styling should be minimalist, modern, yet culturally rich (e.g., using Adinkra symbols, geometric patterns like Mud Cloth, or specific color palettes).
  Return the result as a JSON array.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            originalDescription: { type: Type.STRING },
            africanStylingPrompt: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['navigation', 'action', 'utility', 'social'] }
          },
          required: ["name", "originalDescription", "africanStylingPrompt", "category"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse suggestions", e);
    return [];
  }
};

export const generateAfricanIcon = async (
  suggestion: IconSuggestion, 
  palette: AfricanPalette, 
  style: IconStyle
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const paletteDescriptions: Record<AfricanPalette, string> = {
    Kente: "vibrant colors like gold, red, and green with intricate geometric weaving patterns",
    Bogolan: "earthy tones, deep browns, blacks, and creams with traditional mud cloth symbols",
    Safari: "warm ochre, savannah greens, and sunset oranges with minimalist wildlife textures",
    ModernSahara: "sleek sand golds, deep blues, and white minimalist desert geometric shapes",
    AbidjanNight: "modern neon African vibes, deep purples, teals, and vibrant urban patterns"
  };

  const styleDescriptions: Record<IconStyle, string> = {
    'Glassmorphism': "frosted glass effect, semi-transparent, blurred background, soft highlights, ethereal look",
    'Liquid Glass': "fluid organic shapes, glossy finish, high transparency, caustic light reflections, flowing aesthetic",
    'Playful Cartoon': "soft rounded edges, bold saturated colors, thick outlines, friendly 3D puffy look",
    '3D Glossy': "premium realistic 3D render, high-shine material, studio lighting, depth and shadows",
    'Flat Minimalist': "2D vector style, clean lines, solid fills, no shadows, modern Swiss design",
    'Cyberpunk African': "neon glowing edges, dark metallic textures, futuristic African circuitry patterns",
    'Outline / Line': "Thin elegant lines, minimal strokes, no fill, clean vector aesthetic, high legibility",
    'Duotone': "Two-tone contrast colors, clear visual hierarchy, professional dual-color fill",
    'Semi-Flat': "Flat design with very subtle shadows and gradients for a warm modern depth",
    'Neo-Institutional': "Stable geometric forms, official seal style, majestic and authoritative, balanced angles",
    'Isometric Light': "Light 2.5D perspective, structural and ordered, non-playful professional architecture",
    'Monochrome Symbolic': "Single solid color, high contrast, universal symbolic strength, maximum accessibility",
    'Pictogramme e-Gov': "Functional, ISO-standardized style, ultra-clean, no superfluous details, official government look",
    'Cultural-Minimal': "Minimalist flat style with very subtle, non-figurative African geometric motifs integrated into the shape"
  };

  const finalPrompt = `Professional high-end app icon for "${suggestion.name}". 
  Style: ${styleDescriptions[style]}.
  Theme: Modern African Excellence.
  Colors & Patterns: ${paletteDescriptions[palette]}. 
  Specific Idea: ${suggestion.africanStylingPrompt}. 
  Centered on solid white background, high-resolution vector-like render. 
  Strictly NO text, NO letters, NO faces.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: finalPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return null;
};
