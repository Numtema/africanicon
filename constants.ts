
import React from 'react';
import { 
  ShieldCheck, PenTool, CircleDashed, FileText, Fingerprint, Maximize, 
  Trees, Flame, BookOpen, MousePointer2, Waves, Wind, Smile, Gamepad2, 
  Grid, Zap, Sword, Clapperboard, Film, Feather, Box, Dna, Sparkles, Droplets, Sun, Layers
} from 'lucide-react';
import { AfricanPalette, IconStyle } from './types';

/**
 * 🎨 DESIGN TOKENS - Couleurs, Espacements, Bordures
 * Modifiez ces jetons pour changer l'apparence globale de l'application.
 */
export const THEME_TOKENS = {
  colors: {
    primary: 'orange-600',
    primaryHover: 'orange-700',
    bgMain: '#fdfaf6',
    bgCard: 'bg-white',
    bgInput: 'bg-slate-50',
    border: 'border-orange-100',
    borderFocus: 'border-orange-500',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
  },
  spacing: {
    containerPadding: 'px-8 py-12',
    cardPadding: 'p-10',
    gapLarge: 'gap-12',
    gapMedium: 'gap-6',
  },
  borderRadius: {
    main: 'rounded-[40px]',
    large: 'rounded-[60px]',
    icon: 'rounded-2xl',
  }
};

/**
 * 📝 UI TEXTS - Tous les textes de l'application
 * Centralisés ici pour faciliter la traduction ou le changement de ton par l'IA.
 */
export const UI_TEXTS = {
  header: {
    title: 'AfriIcon',
    subtitle: 'Studio',
    navGenerate: 'Générer',
    navLibrary: 'Bibliothèque',
  },
  generator: {
    step1Title: '1. Audit Deep-Analyse',
    step1Placeholder: 'Décrivez votre projet complexe pour une analyse complète (audit de 20+ icônes)...',
    step1Button: "Lancer l'Audit Complet",
    step2Title: '2. Univers de Couleur',
    step3Title: '3. Style Visuel',
    step4Title: '4. Réglages de Précision',
    resultsTitle: 'Audit Résultats',
    galleryTitle: 'Galerie en cours',
    emptyGallery: "Lancez l'audit pour créer...",
  },
  refineModal: {
    title: 'Raffiner l\'icône',
    placeholder: "Ex: 'Enlève les reflets', 'Rend plus minimaliste'...",
    button: 'Appliquer la modification',
  },
  footer: {
    tagline: 'Laboratoire de design institutionnel africain.',
    copyright: '© 2024 AfriIcon Studio. Haute Précision Visuelle.'
  }
};

/**
 * 🌍 PALETTE CONFIGURATION
 */
export const PALETTE_CONFIG: { name: AfricanPalette; color: string; desc: string }[] = [
  { name: 'Kente', color: 'bg-yellow-500', desc: 'Vibrant & Géométrique' },
  { name: 'Bogolan', color: 'bg-amber-900', desc: 'Terreux & Traditionnel' },
  { name: 'ModernSahara', color: 'bg-blue-400', desc: 'Sable & Moderne' },
  { name: 'AbidjanNight', color: 'bg-purple-800', desc: 'Néon & Urbain' },
  { name: 'Safari', color: 'bg-emerald-700', desc: 'Naturel & Chaud' },
];

/**
 * 🎭 ICON STYLE CONFIGURATION
 */
export const STYLE_CONFIG: { name: IconStyle; icon: any; desc: string; category: string }[] = [
  // Administratif
  { name: 'Neo-Institutional', icon: ShieldCheck, desc: 'Officiel', category: 'Institutionnel' },
  { name: 'Outline / Line', icon: PenTool, desc: 'Traits fins', category: 'Administratif' },
  { name: 'Duotone', icon: CircleDashed, desc: 'Bicolore', category: 'Administratif' },
  { name: 'Semi-Flat', icon: Box, desc: 'Relief léger', category: 'Administratif' },
  { name: 'Pictogramme e-Gov', icon: FileText, desc: 'Standards', category: 'Administratif' },
  { name: 'Cultural-Minimal', icon: Fingerprint, desc: 'Discret', category: 'Institutionnel' },
  { name: 'Isometric Light', icon: Maximize, desc: 'Structure 2.5D', category: 'Data' },

  // Gradients
  { name: 'Gradient Smooth', icon: Droplets, desc: 'Fluide', category: 'Gradient' },
  { name: 'Gradient Neon', icon: Zap, desc: 'Éclatant', category: 'Gradient' },
  { name: 'Mesh Gradient', icon: Waves, desc: 'Diffuse', category: 'Gradient' },
  { name: 'Afro-Gradient', icon: Sparkles, desc: 'Premium', category: 'Hybrid' },

  // Matières
  { name: 'Wood Carved', icon: Trees, desc: 'Bois sculpté', category: 'Matière' },
  { name: 'Wood Burned', icon: Flame, desc: 'Pyrogravure', category: 'Matière' },
  { name: 'Slate Ardoise', icon: BookOpen, desc: 'Ardoise', category: 'Matière' },
  { name: 'Chalk Craie', icon: MousePointer2, desc: 'Tableau noir', category: 'Matière' },
  { name: 'Stone Engraved', icon: Wind, desc: 'Pierre', category: 'Matière' },

  // Soft UI
  { name: 'Bubble Icons', icon: Smile, desc: 'Gonflé', category: 'Soft UI' },
  { name: 'Neumorphism', icon: Layers, desc: 'Tactile', category: 'Soft UI' },
  { name: 'Glass Bubble', icon: Droplets, desc: 'Verre liquide', category: 'Soft UI' },

  // Street
  { name: 'Street Art / Graffiti', icon: Flame, desc: 'Spray art', category: 'Street' },
  { name: 'Marker Posca', icon: PenTool, desc: 'Feutre', category: 'Street' },
  { name: 'Collage Urbain', icon: Layers, desc: 'Underground', category: 'Street' },

  // Manga & Anime
  { name: 'Manga Line Art', icon: PenTool, desc: 'Encre Shonen', category: 'Manga' },
  { name: 'Anime Flat Color', icon: Wind, desc: 'Aplats colorés', category: 'Manga' },
  { name: 'Chibi Icons', icon: Smile, desc: 'Mignon & Fun', category: 'Manga' },
  { name: 'Afro-Anime', icon: Gamepad2, desc: 'Hybride Moderne', category: 'Manga' },

  // Symbolique
  { name: 'Hiéroglyphe Moderne', icon: Feather, desc: 'Patrimoine', category: 'Symbolique' },
  { name: 'Pictogramme Ancestral', icon: ShieldCheck, desc: 'Tribal', category: 'Symbolique' },
  { name: 'Glyphes / Runes', icon: BookOpen, desc: 'Mystique', category: 'Symbolique' },
];
