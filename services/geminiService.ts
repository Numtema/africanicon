
import { GoogleGenAI, Type } from "@google/genai";
import { IconSuggestion, AfricanPalette, IconStyle } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeProjectContent = async (content: string, palette: AfricanPalette): Promise<IconSuggestion[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Fais un audit complet et exhaustif du contenu ou de la description suivante : "${content}". 
  Identifie TOUTES les icônes d'interface utilisateur nécessaires pour ce projet, sans limite de nombre (propose en 20 ou plus si le projet est complexe). 
  Pour chaque icône, propose un style africain moderne inspiré de l'esthétique ${palette}. 
  Le style doit être minimaliste, institutionnel et culturellement riche.
  Retourne le résultat sous forme d'un tableau JSON d'objets.`;

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
  'Cultural-Minimal': "Minimalist flat style with very subtle, non-figurative African geometric motifs integrated into the shape",
  'Manga Line Art': "Expressive black line art, shonen manga style, high contrast, dynamic ink strokes",
  'Anime Flat Color': "Clean flat cell-shading anime style, bold colors, simple shadows, mobile game aesthetic",
  'Chibi Icons': "Super-deformed chibi style, large expressive features, cute rounded proportions, colorful",
  'Pixel Art': "Retro 16-bit pixel art, visible grid, vibrant palette, nostalgic video game aesthetic",
  'Cyber Anime': "Futuristic Japanese neon style, thin glowing lines, dark background glow, high-tech energy",
  'Mecha Tech': "Mechanical engineering anime style, sharp metallic angles, robotic details, technical structure",
  'Noir & Blanc Cinéma': "Dramatic high-contrast black and white cinematic lighting, symbolic and noir aesthetic",
  'Comic Book': "Thick outlines, halftone screen dots, vibrant US comic book style, superhero aesthetic",
  'Illustration Vintage': "Retro 1960s-1980s flat illustration, muted nostalgic color palette, simple geometric chic",
  'Afro-Anime': "Fusion of Japanese anime line-art with intricate African geometric patterns and earthy-warm tones",
  'Symbolic Mythic': "Abstract symbolic forms inspired by ancient myths, powerful spiritual shapes, balanced mystery",
  'Clay Stop Motion': "Tactile 3D clay modeled effect, visible fingerprints, soft matte finish, playful handcrafted look",
  'Hand-Drawn Sketch': "Authentic pencil and ink sketch, human touch, visible hatch lines, warm personal aesthetic",
  'Generative Abstract': "Algorithmic generative art style, fluid mathematical curves, futuristic abstract design",
  'Wood Carved': "Deeply carved in rich mahogany wood, visible natural wood grain, rustic handcrafted texture",
  'Wood Burned': "Pyrography style, symbols burned into light wood, high-contrast scorched edges, warm and organic",
  'Slate Ardoise': "Engraved or drawn on a dark natural slate background, stone texture, scholarly institutional look",
  'Chalk Craie': "Hand-drawn with white chalk on a dark blackboard, dusty irregular texture, educational and raw",
  'Stone Engraved': "Monumental stone carving, deep chiseled letters and shapes, sense of law and ancient heritage",
  'Parchment': "Ink-drawn symbols on aged yellowish parchment paper, historical document aesthetic, antique vibe",
  'Ink & Quill': "Elegant quill-and-ink calligraphy, slight ink bleeds, manuscript style, soft authoritative touch",
  'Fabric Textile': "Symbols woven into a complex textile grid, inspired by Bogolan and Kente fabric textures",
  'Clay Terracotta': "Hand-modeled terracotta clay, warm orange-red matte texture, community and heritage focus"
};

export const generateAfricanIcon = async (
  suggestion: IconSuggestion, 
  palette: AfricanPalette, 
  style: IconStyle
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const finalPrompt = `Professional high-end app icon for "${suggestion.name}". 
  Rendering Style: ${styleDescriptions[style]}.
  Theme: Modern African Excellence.
  Colors & Cultural Context: ${paletteDescriptions[palette]}. 
  Specific Detail: ${suggestion.africanStylingPrompt}. 
  Centered on solid background (white unless style requires dark), high-resolution. 
  Strictly NO text, NO letters, NO human faces.`;

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

export const refineAfricanIcon = async (
  base64Image: string,
  refinementInstruction: string,
  palette: AfricanPalette,
  style: IconStyle
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Strip the "data:image/png;base64," prefix if present
  const base64Data = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;

  const finalPrompt = `Modify this African icon according to these instructions: "${refinementInstruction}".
  Keep the overall Rendering Style: ${styleDescriptions[style]} and Palette: ${paletteDescriptions[palette]}.
  Ensure the result remains a high-end, modern African UI icon. Centered, solid background. No text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Data
          }
        },
        { text: finalPrompt }
      ]
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
