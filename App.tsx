
import React, { useState, useEffect } from 'react';
import { analyzeProjectContent, generateAfricanIcon, refineAfricanIcon } from './services/geminiService';
import { IconSuggestion, GeneratedIcon, AfricanPalette, IconStyle, Project, ViewMode, IconSettings } from './types';
import { 
  Sparkles, Palette, Download, RefreshCw, CheckCircle2, Image as ImageIcon,
  ArrowRight, Globe, Layers, Droplets, Zap, Box, Smile, CircleDashed,
  FolderOpen, Plus, Trash2, ChevronLeft, Calendar, Grid, FileText,
  ShieldCheck, Maximize, PenTool, Fingerprint, Sword, Gamepad2, Film,
  Wind, Waves, Feather, Dna, Trees, Flame, Clapperboard, MousePointer2,
  BookOpen, Wand2, X, SlidersHorizontal, Sun, Hash
} from 'lucide-react';

const PALETTES: { name: AfricanPalette; color: string; desc: string }[] = [
  { name: 'Kente', color: 'bg-yellow-500', desc: 'Vibrant & Géométrique' },
  { name: 'Bogolan', color: 'bg-amber-900', desc: 'Terreux & Traditionnel' },
  { name: 'ModernSahara', color: 'bg-blue-400', desc: 'Sable & Moderne' },
  { name: 'AbidjanNight', color: 'bg-purple-800', desc: 'Néon & Urbain' },
  { name: 'Safari', color: 'bg-emerald-700', desc: 'Naturel & Chaud' },
];

const STYLES: { name: IconStyle; icon: React.ReactNode; desc: string; category: string }[] = [
  // Administratif & Institutionnel
  { name: 'Neo-Institutional', icon: <ShieldCheck size={18} />, desc: 'Officiel', category: 'Institutionnel' },
  { name: 'Outline / Line', icon: <PenTool size={18} />, desc: 'Traits fins', category: 'Administratif' },
  { name: 'Duotone', icon: <CircleDashed size={18} />, desc: 'Bicolore', category: 'Administratif' },
  { name: 'Semi-Flat', icon: <Box size={18} />, desc: 'Relief léger', category: 'Administratif' },
  { name: 'Pictogramme e-Gov', icon: <FileText size={18} />, desc: 'Standards', category: 'Administratif' },
  { name: 'Cultural-Minimal', icon: <Fingerprint size={18} />, desc: 'Discret', category: 'Institutionnel' },

  // Gradients & Couleur
  { name: 'Gradient Smooth', icon: <Droplets size={18} />, desc: 'Fluide', category: 'Gradient' },
  { name: 'Gradient Neon', icon: <Zap size={18} />, desc: 'Éclatant', category: 'Gradient' },
  { name: 'Mesh Gradient', icon: <Waves size={18} />, desc: 'Diffuse', category: 'Gradient' },
  { name: 'Afro-Gradient', icon: <Sparkles size={18} />, desc: 'Premium', category: 'Hybrid' },

  // Soft UI & Bulles
  { name: 'Bubble Icons', icon: <Smile size={18} />, desc: 'Gonflé', category: 'Soft UI' },
  { name: 'Neumorphism', icon: <Layers size={18} />, desc: 'Tactile', category: 'Soft UI' },
  { name: 'Glass Bubble', icon: <Droplets size={18} />, desc: 'Verre liquide', category: 'Soft UI' },

  // Street & Urbain
  { name: 'Street Art / Graffiti', icon: <Flame size={18} />, desc: 'Spray art', category: 'Street' },
  { name: 'Marker Posca', icon: <PenTool size={18} />, desc: 'Feutre', category: 'Street' },
  { name: 'Collage Urbain', icon: <Layers size={18} />, desc: 'Underground', category: 'Street' },

  // Matières
  { name: 'Wood Carved', icon: <Trees size={18} />, desc: 'Bois sculpté', category: 'Matière' },
  { name: 'Wood Burned', icon: <Flame size={18} />, desc: 'Pyrogravure', category: 'Matière' },
  { name: 'Slate Ardoise', icon: <BookOpen size={18} />, desc: 'Ardoise', category: 'Matière' },
  { name: 'Chalk Craie', icon: <MousePointer2 size={18} />, desc: 'Tableau noir', category: 'Matière' },
  { name: 'Stone Engraved', icon: <Wind size={18} />, desc: 'Pierre', category: 'Matière' },

  // Anciens & Symboles
  { name: 'Hiéroglyphe Moderne', icon: <Feather size={18} />, desc: 'Patrimoine', category: 'Symbolique' },
  { name: 'Pictogramme Ancestral', icon: <ShieldCheck size={18} />, desc: 'Tribal', category: 'Symbolique' },
  { name: 'Glyphes / Runes', icon: <BookOpen size={18} />, desc: 'Mystique', category: 'Symbolique' },
];

const DEFAULT_SETTINGS: IconSettings = {
  colorIntensity: 75,
  lineThickness: 40,
  roundedness: 60,
  culturalIntensity: 80,
  glowEffect: false,
  textureEnabled: true
};

const STORAGE_KEY = 'afriicon_v2_storage';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('generator');
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState('');
  const [palette, setPalette] = useState<AfricanPalette>('Kente');
  const [selectedStyle, setSelectedStyle] = useState<IconStyle>('Neo-Institutional');
  const [suggestions, setSuggestions] = useState<IconSuggestion[]>([]);
  const [currentIcons, setCurrentIcons] = useState<GeneratedIcon[]>([]);
  const [settings, setSettings] = useState<IconSettings>(DEFAULT_SETTINGS);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingIconId, setEditingIconId] = useState<string | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) try { setProjects(JSON.parse(saved)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const results = await analyzeProjectContent(content, palette);
      setSuggestions(results);
    } catch (err) { setError("Échec de l'audit."); } finally { setIsAnalyzing(false); }
  };

  const handleGenerate = async (suggestion: IconSuggestion) => {
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateAfricanIcon(suggestion, palette, selectedStyle, settings);
      if (url) {
        const newIcon: GeneratedIcon = { id: Math.random().toString(36).substr(2, 9), url, prompt: suggestion.africanStylingPrompt, name: suggestion.name, settings };
        setCurrentIcons(prev => [newIcon, ...prev]);
        saveIconToProject(newIcon);
      }
    } catch (err) { setError("Génération échouée."); } finally { setIsGenerating(false); }
  };

  const handleRefine = async () => {
    if (!editingIconId || !refinementPrompt) return;
    const target = currentIcons.find(i => i.id === editingIconId);
    if (!target) return;
    setIsGenerating(true);
    try {
      const newUrl = await refineAfricanIcon(target.url, refinementPrompt, palette, selectedStyle, settings);
      if (newUrl) {
        const updated = { ...target, url: newUrl };
        setCurrentIcons(prev => prev.map(i => i.id === editingIconId ? updated : i));
        setEditingIconId(null);
        setRefinementPrompt('');
      }
    } catch (err) { setError("Modification échouée."); } finally { setIsGenerating(false); }
  };

  const saveIconToProject = (icon: GeneratedIcon) => {
    const existingIdx = projects.findIndex(p => p.description === content);
    if (existingIdx > -1) {
      const updated = [...projects];
      updated[existingIdx].icons.unshift(icon);
      setProjects(updated);
    } else {
      setProjects(prev => [{
        id: Date.now().toString(),
        name: content.slice(0, 30) || "Sans titre",
        description: content,
        palette, style: selectedStyle, icons: [icon], suggestions, createdAt: Date.now()
      }, ...prev]);
    }
  };

  const download = (url: string, name: string) => {
    const a = document.createElement('a'); a.href = url; a.download = `${name}.png`; a.click();
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-slate-900 selection:bg-orange-200">
      <div className="african-pattern fixed inset-0 pointer-events-none opacity-[0.05]" />

      {/* Modal Modification */}
      {editingIconId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black flex items-center gap-2"><Wand2 className="text-orange-600" /> Raffiner</h3>
              <button onClick={() => setEditingIconId(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
            </div>
            <img src={currentIcons.find(i => i.id === editingIconId)?.url} className="w-32 h-32 mx-auto rounded-3xl border-2 border-orange-100 mb-6 object-contain p-2 bg-slate-50" />
            <textarea 
              className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 outline-none font-bold mb-6"
              placeholder="Ex: 'Enlève les reflets', 'Rend plus minimaliste'..."
              value={refinementPrompt}
              onChange={e => setRefinementPrompt(e.target.value)}
            />
            <button onClick={handleRefine} disabled={isGenerating} className="w-full py-5 bg-orange-600 text-white rounded-3xl font-black shadow-xl active:scale-95 disabled:opacity-50">
              {isGenerating ? "Traitement..." : "Appliquer la modification"}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b-4 border-orange-100 sticky top-0 z-50 px-8 py-5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode('generator')}>
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Palette size={28} /></div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tighter">AfriIcon <span className="text-orange-600">Studio</span></h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setViewMode('generator')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${viewMode === 'generator' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}>Générer</button>
          <button onClick={() => setViewMode('library')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${viewMode === 'library' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}>Bibliothèque ({projects.length})</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12 relative z-10">
        {viewMode === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Colonne de gauche: Config */}
            <div className="lg:col-span-5 space-y-10">
              
              {/* Etape 1 */}
              <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-950"><Globe size={22} className="text-orange-600" /> 1. Audit Deep-Analyse</h2>
                <textarea 
                  className="w-full h-36 p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 outline-none text-slate-950 font-black text-lg focus:border-orange-500 transition-colors"
                  placeholder="URL ou description pour audit exhaustif..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !content}
                  className="w-full mt-6 flex items-center justify-center gap-3 py-5 bg-slate-950 text-white rounded-3xl font-black text-xl hover:bg-orange-600 transition-all shadow-xl disabled:opacity-50"
                >
                  {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                  Lancer l'Audit Complet
                </button>
              </section>

              {/* Etape 2 & 3: Palette & Style */}
              <div className="grid grid-cols-1 gap-10">
                <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-950"><Palette size={22} className="text-orange-600" /> 2. Univers Visuel</h2>
                  <div className="space-y-3">
                    {PALETTES.map(p => (
                      <button key={p.name} onClick={() => setPalette(p.name)} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${palette === p.name ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${p.color} border-2 border-black/10`} />
                          <div className="text-left">
                            <div className="font-black text-slate-950">{p.name}</div>
                            <div className="text-[10px] text-slate-500 font-black uppercase">{p.desc}</div>
                          </div>
                        </div>
                        {palette === p.name && <CheckCircle2 className="text-orange-600" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-950"><Layers size={22} className="text-orange-600" /> 3. Style Technique</h2>
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {STYLES.map(s => (
                      <button key={s.name} onClick={() => setSelectedStyle(s.name)} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-1 ${selectedStyle === s.name ? 'border-orange-500 bg-orange-50 text-orange-600 ring-4 ring-orange-100' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                        <div className={selectedStyle === s.name ? 'text-orange-600' : 'text-slate-600'}>{s.icon}</div>
                        <span className="font-black text-[10px] uppercase text-slate-950 leading-tight">{s.name}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase">{s.category}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Réglages fins */}
              <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-950"><SlidersHorizontal size={22} className="text-orange-600" /> 4. Réglages de Précision</h2>
                <div className="space-y-6">
                  {[
                    { label: 'Intensité Culturelle', key: 'culturalIntensity' },
                    { label: 'Épaisseur du trait', key: 'lineThickness' },
                    { label: 'Arrondi des formes', key: 'roundedness' },
                    { label: 'Saturation', key: 'colorIntensity' },
                  ].map(s => (
                    <div key={s.key} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                        <span>{s.label}</span>
                        <span>{settings[s.key as keyof IconSettings]}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        className="w-full accent-orange-600 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                        value={settings[s.key as keyof IconSettings] as number}
                        onChange={e => setSettings({...settings, [s.key]: parseInt(e.target.value)})}
                      />
                    </div>
                  ))}
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setSettings({...settings, glowEffect: !settings.glowEffect})}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${settings.glowEffect ? 'bg-orange-600 text-white border-orange-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                    >
                      <Sun size={14} /> Glow ON/OFF
                    </button>
                    <button 
                      onClick={() => setSettings({...settings, textureEnabled: !settings.textureEnabled})}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${settings.textureEnabled ? 'bg-orange-600 text-white border-orange-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                    >
                      <Hash size={14} /> Texture ON/OFF
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Colonne de droite: Résultats */}
            <div className="lg:col-span-7 space-y-12">
              {suggestions.length > 0 && (
                <section>
                  <h2 className="text-3xl font-black mb-8 text-slate-950 tracking-tighter flex items-center justify-between">Audit Resultats <span className="text-xs bg-slate-900 text-white px-4 py-1 rounded-full uppercase">{suggestions.length} Icons</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {suggestions.map((s, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-[32px] border-2 border-orange-50 shadow-lg flex justify-between items-center group hover:border-orange-500 transition-all">
                        <div className="flex-1 pr-4">
                          <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">{s.category}</p>
                          <h3 className="font-black text-xl text-slate-950 leading-tight">{s.name}</h3>
                          <p className="text-slate-400 text-[10px] font-bold mt-1">Culture: {palette} | Style: {selectedStyle}</p>
                        </div>
                        <button onClick={() => handleGenerate(s)} disabled={isGenerating} className="shrink-0 bg-slate-950 text-white p-4 rounded-2xl hover:bg-orange-600 shadow-xl transition-all disabled:opacity-50">
                          {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-slate-950 tracking-tighter">Galerie en cours</h2>
                  {currentIcons.length > 0 && <button onClick={() => currentIcons.forEach(i => download(i.url, i.name))} className="text-orange-600 font-black text-sm flex items-center gap-2 hover:underline"><Download size={18} /> Tout Sauver</button>}
                </div>
                {currentIcons.length === 0 ? (
                  <div className="bg-white border-4 border-dashed border-orange-100 rounded-[60px] h-[400px] flex flex-col items-center justify-center text-slate-300 gap-6">
                    <ImageIcon size={64} className="opacity-20" />
                    <p className="text-xl font-black italic">Lancez l'audit pour créer...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                    {currentIcons.map(icon => (
                      <div key={icon.id} className="group relative bg-white rounded-[40px] p-6 shadow-2xl border-2 border-orange-50 hover:border-orange-500 transition-all hover:-translate-y-2">
                        <div className="aspect-square bg-slate-50 rounded-[32px] overflow-hidden p-4 shadow-inner">
                          <img src={icon.url} className="w-full h-full object-contain" alt={icon.name} />
                        </div>
                        <div className="absolute -top-3 -right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => download(icon.url, icon.name)} className="w-10 h-10 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-xl border-2 border-orange-100 hover:bg-orange-600 hover:text-white"><Download size={18} /></button>
                          <button onClick={() => setEditingIconId(icon.id)} className="w-10 h-10 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-xl border-2 border-slate-950 hover:bg-orange-600"><Wand2 size={18} /></button>
                        </div>
                        <p className="mt-4 text-center text-[11px] font-black text-slate-950 uppercase tracking-tighter line-clamp-1">{icon.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {viewMode === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-6xl font-black text-slate-950 mb-16 tracking-tighter">Design Archive</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {projects.map(p => (
                <div key={p.id} className="group bg-white p-10 rounded-[64px] shadow-2xl border-4 border-transparent hover:border-orange-500 transition-all cursor-pointer relative overflow-hidden">
                  <div className="flex -space-x-6 mb-8">
                    {p.icons.slice(0, 3).map(i => <img key={i.id} src={i.url} className="w-20 h-20 rounded-[32px] border-4 border-white bg-slate-50 shadow-lg object-contain" />)}
                  </div>
                  <h3 className="text-3xl font-black text-slate-950 mb-4 line-clamp-1">{p.name}</h3>
                  <div className="flex gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    <span className="bg-slate-100 px-4 py-1.5 rounded-full">{p.style}</span>
                    <span className="bg-orange-100 px-4 py-1.5 rounded-full text-orange-600">{p.icons.length} Icons</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); if(confirm("Supprimer?")) setProjects(prev => prev.filter(x => x.id !== p.id)); }} className="absolute top-8 right-8 text-slate-200 hover:text-red-500"><Trash2 size={24} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-48 py-20 border-t-4 border-orange-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center opacity-70 flex-wrap gap-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white"><Palette size={20} /></div>
             <span className="font-black text-2xl">AfriIcon Studio</span>
          </div>
          <p className="text-slate-950 font-black italic max-w-sm text-center md:text-left underline decoration-orange-500 decoration-4">Laboratoire de design institutionnel africain.</p>
          <div className="flex gap-10 font-black text-xs uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-orange-600">Docs</a>
            <a href="#" className="hover:text-orange-600">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
