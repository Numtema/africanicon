
export interface IconSuggestion {
  name: string;
  originalDescription: string;
  africanStylingPrompt: string;
  category: 'navigation' | 'action' | 'utility' | 'social';
}

export interface GeneratedIcon {
  id: string;
  url: string;
  prompt: string;
  name: string;
}

export type AfricanPalette = 'Kente' | 'Bogolan' | 'Safari' | 'ModernSahara' | 'AbidjanNight';

export type IconStyle = 
  | '3D Glossy' 
  | 'Glassmorphism' 
  | 'Liquid Glass' 
  | 'Playful Cartoon' 
  | 'Flat Minimalist' 
  | 'Cyberpunk African'
  | 'Outline / Line'
  | 'Duotone'
  | 'Semi-Flat'
  | 'Neo-Institutional'
  | 'Isometric Light'
  | 'Monochrome Symbolic'
  | 'Pictogramme e-Gov'
  | 'Cultural-Minimal'
  | 'Manga Line Art'
  | 'Anime Flat Color'
  | 'Chibi Icons'
  | 'Pixel Art'
  | 'Cyber Anime'
  | 'Mecha Tech'
  | 'Noir & Blanc Cinéma'
  | 'Comic Book'
  | 'Illustration Vintage'
  | 'Afro-Anime'
  | 'Symbolic Mythic'
  | 'Clay Stop Motion'
  | 'Hand-Drawn Sketch'
  | 'Generative Abstract'
  | 'Wood Carved'
  | 'Wood Burned'
  | 'Slate Ardoise'
  | 'Chalk Craie'
  | 'Stone Engraved'
  | 'Parchment'
  | 'Ink & Quill'
  | 'Fabric Textile'
  | 'Clay Terracotta';

export interface Project {
  id: string;
  name: string;
  description: string;
  palette: AfricanPalette;
  style: IconStyle;
  icons: GeneratedIcon[];
  suggestions: IconSuggestion[];
  createdAt: number;
}

export type ViewMode = 'generator' | 'library' | 'project-detail';
