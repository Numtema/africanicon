
import { GoogleGenAI, Type } from "@google/genai";
import { IconSuggestion, AfricanPalette, IconStyle, IconSettings } from "../types";

const cleanJsonResponse = (text: string): string => {
  const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
};

export const analyzeProjectContent = async (content: string, palette: AfricanPalette): Promise<IconSuggestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `EXPERTISE UI/UX & BRANDING :
  Projet : "${content}"
  Esthétique : Modernité Africaine (${palette})
  
  Tâche : Identifie les logos et icônes d'application nécessaires.
  Focus : Pense en termes d'icône d'App Store, logo de barre de navigation, icônes de fonctionnalités clés.
  Propose au moins 10 concepts. 
  Pour chaque concept, explique comment intégrer des motifs africains de manière moderne et minimaliste.
  
  RÉPONDS UNIQUEMENT AVEC UN TABLEAU JSON VALIDE.`;

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
    const rawText = response.text || "[]";
    const cleanedJson = cleanJsonResponse(rawText);
    return JSON.parse(cleanedJson);
  } catch (e) {
    console.error("Failed to parse suggestions", e);
    throw new Error("Erreur de lecture. Réessayez.");
  }
};

const styleDescriptions: Record<string, string> = {
  'Glassmorphism': "frosted glass effect, semi-transparent, blurred backdrop, high-end app icon aesthetic",
  'Liquid Glass': "fluid organic shapes, high gloss, caustic light reflections",
  'Playful Cartoon': "rounded, bold colors, thick outlines, puffy 3D",
  '3D Glossy': "premium 3D render, high-shine, studio lighting, depth, app store style",
  'Flat Minimalist': "2D vector, clean lines, solid fills, no shadows, modern logo aesthetic",
  'Cyberpunk African': "neon glowing edges, dark metallic, futuristic patterns",
  'Outline / Line': "Thin elegant lines, minimal strokes, high legibility",
  'Duotone': "Two-tone contrast, clear hierarchy, dual-color fill",
  'Semi-Flat': "Flat design with subtle depth and warm shadows",
  'Neo-Institutional': "Stable geometric forms, official seal style, majestic logo",
  'Isometric Light': "Light 2.5D perspective, structural, professional",
  'Smartphone': "Centered icon, consistent padding, mobile app icon style, high legibility on small screens",
  'Pictogramme e-Gov': "Functional, ISO-standardized, official government look",
  'Cultural-Minimal': "Minimalist flat with subtle non-figurative African patterns",
  'Gradient Smooth': "Smooth fluid gradients, clean transitions, modern professional",
  'Gradient Neon': "Vibrant neon gradients, glowing edges, high-energy glow",
  'Wood Carved': "Deeply carved wood, visible grain, rustic texture",
  'Hiéroglyphe Moderne': "Modernized simplified ancient symbols, geometric heritage",
  'Afro-Anime': "Fusion of anime line-art with African geometric patterns",
  'Afro-Gradient': "African geometric symbols with modern premium gradients",
  'Symbolic Mythic': "Abstract symbolic forms from ancient myths, spiritual"
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const intensityPrompt = settings ? `
    Line thickness: ${settings.lineThickness}%, 
    Rounded corners: ${settings.roundedness}%, 
    Color saturation: ${settings.colorIntensity}%, 
    Cultural detail intensity: ${settings.culturalIntensity}%, 
    Glow effects: ${settings.glowEffect ? 'enabled' : 'disabled'},
    Surface texture: ${settings.textureEnabled ? 'highly visible' : 'minimal'}.` : '';

  const finalPrompt = `Professional HIGH-FIDELITY APP ICON or LOGO for "${suggestion.name}". 
  Context: ${suggestion.originalDescription}.
  Style: ${styleDescriptions[style] || style}. ${intensityPrompt}
  Cultural Heritage: Modern African Excellence (${paletteDescriptions[palette]}). 
  Logic: ${suggestion.africanStylingPrompt}. 
  Requirements: Perfectly centered, isolated on a solid or gradient background, professional branding quality, NO TEXT, NO LETTERS, NO HUMAN FIGURES. High Resolution.`;

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;

  const finalPrompt = `Refine this APP LOGO based on: "${refinementInstruction}".
  Maintain Logo Style: ${styleDescriptions[style] || style} and Palette: ${paletteDescriptions[palette]}.
  Apply: Line ${settings?.lineThickness}%, Roundedness ${settings?.roundedness}%, Cultural Essence ${settings?.culturalIntensity}%.
  Ensure the result is a clean, centered professional app icon without any text.`;

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
