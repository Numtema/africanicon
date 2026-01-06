
import { GoogleGenAI, Type } from "@google/genai";
import { IconSuggestion, AfricanPalette, IconStyle, IconSettings } from "../types";

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

const styleDescriptions: Record<IconStyle, string> = {
  'Glassmorphism': "frosted glass effect, semi-transparent, blurred, ethereal",
  'Liquid Glass': "fluid organic shapes, high gloss, caustic light reflections",
  'Playful Cartoon': "rounded, bold colors, thick outlines, puffy 3D",
  '3D Glossy': "premium 3D render, high-shine, studio lighting, depth",
  'Flat Minimalist': "2D vector, clean lines, solid fills, no shadows",
  'Cyberpunk African': "neon glowing edges, dark metallic, futuristic patterns",
  'Outline / Line': "Thin elegant lines, minimal strokes, high legibility",
  'Duotone': "Two-tone contrast, clear hierarchy, dual-color fill",
  'Semi-Flat': "Flat design with subtle depth and warm shadows",
  'Neo-Institutional': "Stable geometric forms, official seal style, majestic",
  'Isometric Light': "Light 2.5D perspective, structural, professional",
  'Monochrome Symbolic': "Single solid color, high contrast, universal strength",
  'Pictogramme e-Gov': "Functional, ISO-standardized, official government look",
  'Cultural-Minimal': "Minimalist flat with subtle non-figurative African patterns",
  'Manga Line Art': "Expressive black line art, shonen manga ink strokes",
  'Anime Flat Color': "Clean flat cell-shading, bold colors, simple shadows",
  'Chibi Icons': "Cute super-deformed style, large features, rounded",
  'Pixel Art': "Retro 16-bit pixel art, visible grid, vibrant",
  'Cyber Anime': "Neon Japanese style, glowing lines, high-tech energy",
  'Mecha Tech': "Mechanical anime style, robotic details, sharp angles",
  'Noir & Blanc Cinéma': "High-contrast cinematic lighting, noir aesthetic",
  'Comic Book': "Thick outlines, halftone dots, vibrant US comic style",
  'Illustration Vintage': "Retro 60s-80s flat illustration, muted nostalgic colors",
  'Afro-Anime': "Fusion of anime line-art with African geometric patterns",
  'Symbolic Mythic': "Abstract symbolic forms from ancient myths, spiritual",
  'Clay Stop Motion': "Handcrafted clay modeled effect, visible fingerprints",
  'Hand-Drawn Sketch': "Authentic pencil/ink sketch, human touch, hatch lines",
  'Generative Abstract': "Algorithmic generative art, fluid mathematical curves",
  'Wood Carved': "Deeply carved wood, visible grain, rustic texture",
  'Wood Burned': "Pyrography, burned wood symbols, scorched edges",
  'Slate Ardoise': "Engraved on dark slate background, scholarly",
  'Chalk Craie': "Chalk on blackboard, dusty irregular texture, educational",
  'Stone Engraved': "Monumental stone carving, chiseled ancient heritage",
  'Parchment': "Ink-drawn on aged parchment paper, antique vibe",
  'Ink & Quill': "Quill calligraphy, slight ink bleeds, manuscript style",
  'Fabric Textile': "Symbols woven into textile grid, Bogolan/Kente weave",
  'Clay Terracotta': "Hand-modeled terracotta, warm orange-red matte",
  'Gradient Smooth': "Smooth fluid gradients, clean transitions, modern professional",
  'Gradient Neon': "Vibrant neon gradients, glowing edges, high-energy glow",
  'Mesh Gradient': "Organic diffuse mesh gradients, high-end premium design",
  'Bubble Icons': "Inflated round bubble shapes, puffy soft UI effect",
  'Neumorphism': "Soft relief, inner and outer shadows, tactile material feel",
  'Glass Bubble': "Translucent glass bubbles, liquid refractions, futuristic",
  'Street Art / Graffiti': "Free strokes, spray paint effect, raw street energy",
  'Marker Posca': "Felt-tip marker strokes, full colors, expressive pedagogical",
  'Collage Urbain': "Paper cutout effect, superpositions, underground zine style",
  'Hiéroglyphe Moderne': "Modernized simplified ancient symbols, geometric heritage",
  'Pictogramme Ancestral': "Tribal abstract symbols, serious cultural branding",
  'Glyphes / Runes': "Codified symbolic runes, mystic knowledge, heritage archives",
  'Afro-Gradient': "African geometric symbols with modern premium gradients",
  'Street-Flat Hybrid': "Flat icon with light graffiti texture, culture-legibility balance",
  'Material-Gradient': "Wood/Stone/Slate material with subtle modern gradient overlays"
};

const paletteDescriptions: Record<AfricanPalette, string> = {
  Kente: "vibrant colors like gold, red, and green with intricate geometric weaving patterns",
  Bogolan: "earthy tones, deep browns, blacks, and creams with traditional mud cloth symbols",
  Safari: "warm ochre, savannah greens, and sunset oranges with minimalist wildlife textures",
  ModernSahara: "sleek sand golds, deep blues, and white minimalist desert geometric shapes",
  AbidjanNight: "modern neon African vibes, deep purples, teals, and vibrant urban patterns"
};

export const generateAfricanIcon = async (
  suggestion: IconSuggestion, 
  palette: AfricanPalette, 
  style: IconStyle,
  settings?: IconSettings
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const intensityPrompt = settings ? `
    Line thickness: ${settings.lineThickness}%, 
    Rounded corners: ${settings.roundedness}%, 
    Color saturation: ${settings.colorIntensity}%, 
    Cultural detail intensity: ${settings.culturalIntensity}%, 
    Glow effects: ${settings.glowEffect ? 'enabled' : 'disabled'},
    Surface texture: ${settings.textureEnabled ? 'highly visible' : 'minimal'}.` : '';

  const finalPrompt = `Professional app icon for "${suggestion.name}". 
  Style: ${styleDescriptions[style]}. ${intensityPrompt}
  Cultural Theme: Modern African Excellence (${paletteDescriptions[palette]}). 
  Detail: ${suggestion.africanStylingPrompt}. 
  High-res vector render, solid background, NO text, NO human faces.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: finalPrompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const refineAfricanIcon = async (
  base64Image: string,
  refinementInstruction: string,
  palette: AfricanPalette,
  style: IconStyle,
  settings?: IconSettings
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const base64Data = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;

  const finalPrompt = `Modify this African icon: "${refinementInstruction}".
  Maintain Rendering Style: ${styleDescriptions[style]} and Palette: ${paletteDescriptions[palette]}.
  Apply these adjustments: Line thickness ${settings?.lineThickness}%, Roundedness ${settings?.roundedness}%, Cultural details ${settings?.culturalIntensity}%.
  Keep it as a clean modern UI icon, no text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Data } },
        { text: finalPrompt }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};
