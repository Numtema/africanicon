
import React from 'react';
import { 
  ShieldCheck, PenTool, CircleDashed, FileText, Fingerprint, Maximize, 
  Trees, Flame, BookOpen, MousePointer2, Waves, Wind, Smile, Gamepad2, 
  Grid, Zap, Sword, Clapperboard, Film, Feather, Box, Dna, Sparkles, Droplets, Sun, Layers,
  Smartphone, AppWindow, BadgeCheck, Compass
} from 'lucide-react';
import { AfricanPalette, IconStyle } from './types';

export const THEME_TOKENS = {
  colors: {
    primary: 'orange-600',
    primaryHover: 'orange-700',
    bgMain: '#fdfaf6',
    bgCard: 'bg-white/60', // Plus transparent
    bgInput: 'bg-white/80',
    border: 'border-orange-100/30',
    borderFocus: 'border-orange-500',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
  },
  spacing: {
    containerPadding: 'px-4 py-6 md:px-8 md:py-12',
    cardPadding: 'p-4 md:p-8',
    gapLarge: 'gap-6 md:gap-12',
    gapMedium: 'gap-4 md:gap-6',
  },
  borderRadius: {
    main: 'rounded-[24px] md:rounded-[48px]',
    large: 'rounded-[32px] md:rounded-[60px]',
    icon: 'rounded-xl md:rounded-2xl',
  }
};

export const UI_TEXTS = {
  header: {
    title: 'AfriIcon',
    subtitle: 'Logo Studio',
    navGenerate: 'Studio',
    navLibrary: 'Mes Logos',
  },
  generator: {
    step1Title: '1. Analyse du Projet',
    step1Placeholder: 'Décrivez votre application ou votre marque (ex: App de transport à Lagos, logo pour boutique artisanale)...',
    step1Button: "Générer la Stratégie de Logo",
    step2Title: '2. Essence de Couleur (Transparence)',
    step3Title: '3. Signature Visuelle',
    step4Title: '4. Précision App Icon',
    resultsTitle: 'Audit de Marque',
    galleryTitle: 'Assets Générés',
    emptyGallery: "Votre studio est prêt...",
  },
  refineModal: {
    title: 'Raffiner le Design',
    placeholder: "Ex: 'Ajoute plus de contraste', 'Rends le logo plus minimaliste'...",
    button: 'Appliquer',
  },
  footer: {
    tagline: 'Expertise en Logos & Icons Modernes Africains.',
    copyright: '© 2024 AfriIcon Studio.'
  }
};

export const PALETTE_CONFIG: { name: AfricanPalette; color: string; desc: string; border: string }[] = [
  { name: 'Kente', color: 'bg-yellow-500/30', border: 'border-yellow-500/50', desc: 'Prestige & App Premium' },
  { name: 'Bogolan', color: 'bg-amber-900/30', border: 'border-amber-900/50', desc: 'Identité Forte' },
  { name: 'ModernSahara', color: 'bg-blue-400/30', border: 'border-blue-400/50', desc: 'SaaS & Technologie' },
  { name: 'AbidjanNight', color: 'bg-purple-800/30', border: 'border-purple-800/50', desc: 'Lifestyle & Night' },
  { name: 'Safari', color: 'bg-emerald-700/30', border: 'border-emerald-700/50', desc: 'Nature & Éco-Conception' },
];

export const STYLE_CONFIG: { name: IconStyle; icon: any; desc: string; category: string }[] = [
  { name: 'Neo-Institutional', icon: BadgeCheck, desc: 'Logo Officiel', category: 'Branding' },
  { name: 'Glassmorphism', icon: Layers, desc: 'Interface Moderne', category: 'UI' },
  { name: 'Glass Bubble', icon: Sun, desc: 'Sphère Brillante', category: 'UI' },
  { name: 'Outline / Line', icon: PenTool, desc: 'Minimaliste', category: 'Branding' },
  { name: 'Duotone', icon: CircleDashed, desc: 'Double Teinte', category: 'App Icon' },
  { name: 'Smartphone', icon: Smartphone, desc: 'Optimisé App Store', category: 'Mobile' },
  { name: '3D Glossy', icon: AppWindow, desc: 'Impact 3D', category: 'App Icon' },
  { name: 'Semi-Flat', icon: Box, desc: 'Polyvalent', category: 'Branding' },
  { name: 'Pictogramme e-Gov', icon: FileText, desc: 'Secteur Public', category: 'Gov' },
  { name: 'Cultural-Minimal', icon: Fingerprint, desc: 'Empreinte Unique', category: 'Branding' },
  { name: 'Isometric Light', icon: Maximize, desc: 'Structure', category: 'Data' },
  { name: 'Gradient Smooth', icon: Droplets, desc: 'Fluidité', category: 'UI' },
  { name: 'Gradient Neon', icon: Zap, desc: 'Innovation', category: 'Tech' },
  { name: 'Wood Carved', icon: Trees, desc: 'Authentique', category: 'Logo' },
  { name: 'Hiéroglyphe Moderne', icon: Feather, desc: 'Symbole Ancien', category: 'Logo' },
  { name: 'Afro-Gradient', icon: Sparkles, desc: 'Luxe Africain', category: 'Logo' },
  { name: 'Symbolic Mythic', icon: Compass, desc: 'Légendaire', category: 'Logo' },
];
