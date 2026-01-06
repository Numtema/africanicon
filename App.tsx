
import React, { useState, useEffect } from 'react';
import { analyzeProjectContent, generateAfricanIcon, refineAfricanIcon } from './services/geminiService';
import { IconSuggestion, GeneratedIcon, AfricanPalette, IconStyle, Project, ViewMode, IconSettings } from './types';
import { 
  Sparkles, Palette, Download, RefreshCw, CheckCircle2, Image as ImageIcon,
  ArrowRight, Globe, Layers, Droplets, Zap, Box, Smile, CircleDashed,
  Trash2, ChevronLeft, Grid, ShieldCheck, PenTool, Wand2, X, SlidersHorizontal, Sun, Hash
} from 'lucide-react';
import { THEME_TOKENS, UI_TEXTS, PALETTE_CONFIG, STYLE_CONFIG } from './constants';

const DEFAULT_SETTINGS: IconSettings = {
  colorIntensity: 75,
  lineThickness: 40,
  roundedness: 60,
  culturalIntensity: 80,
  glowEffect: false,
  textureEnabled: true
};

const STORAGE_KEY = 'afriicon_v2_storage_final';

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
  const [styleSearch, setStyleSearch] = useState('');

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

  const filteredStyles = STYLE_CONFIG.filter(s => 
    s.name.toLowerCase().includes(styleSearch.toLowerCase()) || 
    s.category.toLowerCase().includes(styleSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-[${THEME_TOKENS.colors.bgMain}] ${THEME_TOKENS.colors.textMain} selection:bg-orange-200`}>
      <div className="african-pattern fixed inset-0 pointer-events-none opacity-[0.05]" />

      {/* MODAL MODIFICATION */}
      {editingIconId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className={`${THEME_TOKENS.colors.bgCard} ${THEME_TOKENS.borderRadius.main} p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <Wand2 className={`text-${THEME_TOKENS.colors.primary}`} /> {UI_TEXTS.refineModal.title}
              </h3>
              <button onClick={() => setEditingIconId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <img src={currentIcons.find(i => i.id === editingIconId)?.url} className="w-32 h-32 mx-auto rounded-3xl border-2 border-orange-100 mb-6 object-contain p-2 bg-slate-50" />
            <textarea 
              className={`w-full h-32 p-4 ${THEME_TOKENS.borderRadius.icon} ${THEME_TOKENS.colors.bgInput} border-2 border-slate-200 outline-none font-bold mb-6 focus:border-orange-500`}
              placeholder={UI_TEXTS.refineModal.placeholder}
              value={refinementPrompt}
              onChange={e => setRefinementPrompt(e.target.value)}
            />
            <button onClick={handleRefine} disabled={isGenerating} className={`w-full py-5 bg-${THEME_TOKENS.colors.primary} text-white rounded-3xl font-black shadow-xl active:scale-95 disabled:opacity-50 hover:bg-${THEME_TOKENS.colors.primaryHover} transition-colors`}>
              {isGenerating ? "Traitement IA..." : UI_TEXTS.refineModal.button}
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="bg-white border-b-4 border-orange-100 sticky top-0 z-50 px-8 py-5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewMode('generator')}>
          <div className={`w-12 h-12 bg-${THEME_TOKENS.colors.primary} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}><Palette size={28} /></div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tighter">
            {UI_TEXTS.header.title} <span className={`text-${THEME_TOKENS.colors.primary}`}>{UI_TEXTS.header.subtitle}</span>
          </h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
          <button onClick={() => setViewMode('generator')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${viewMode === 'generator' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}>{UI_TEXTS.header.navGenerate}</button>
          <button onClick={() => setViewMode('library')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${viewMode === 'library' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}>{UI_TEXTS.header.navLibrary} ({projects.length})</button>
        </div>
      </nav>

      <main className={`max-w-7xl mx-auto ${THEME_TOKENS.spacing.containerPadding} relative z-10`}>
        {viewMode === 'generator' && (
          <div className={`grid grid-cols-1 lg:grid-cols-12 ${THEME_TOKENS.spacing.gapLarge}`}>
            
            {/* CONFIG PANEL */}
            <div className="lg:col-span-5 space-y-10">
              
              {/* ÉTAPE 1: AUDIT */}
              <section className={`${THEME_TOKENS.colors.bgCard} ${THEME_TOKENS.spacing.cardPadding} ${THEME_TOKENS.borderRadius.main} shadow-2xl border-2 border-orange-50`}>
                <h2 className="text-xl font-black mb-6 flex items-center gap-3"><Globe size={22} className={`text-${THEME_TOKENS.colors.primary}`} /> {UI_TEXTS.generator.step1Title}</h2>
                <textarea 
                  className={`w-full h-36 p-5 ${THEME_TOKENS.borderRadius.icon} ${THEME_TOKENS.colors.bgInput} border-2 border-slate-200 outline-none font-black text-lg focus:border-orange-500 transition-colors shadow-inner`}
                  placeholder={UI_TEXTS.generator.step1Placeholder}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !content}
                  className={`w-full mt-6 flex items-center justify-center gap-3 py-6 bg-slate-950 text-white ${THEME_TOKENS.borderRadius.icon} font-black text-xl hover:bg-${THEME_TOKENS.colors.primary} transition-all shadow-xl disabled:opacity-50 active:scale-95`}
                >
                  {isAnalyzing ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />}
                  {UI_TEXTS.generator.step1Button}
                </button>
              </section>

              {/* ÉTAPE 2: PALETTE */}
              <section className={`${THEME_TOKENS.colors.bgCard} ${THEME_TOKENS.spacing.cardPadding} ${THEME_TOKENS.borderRadius.main} shadow-2xl border-2 border-orange-50`}>
                <h2 className="text-xl font-black mb-6 flex items-center gap-3"><Palette size={22} className={`text-${THEME_TOKENS.colors.primary}`} /> {UI_TEXTS.generator.step2Title}</h2>
                <div className="space-y-3">
                  {PALETTE_CONFIG.map(p => (
                    <button key={p.name} onClick={() => setPalette(p.name)} className={`w-full flex items-center justify-between p-4 rounded-3xl border-2 transition-all ${palette === p.name ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100 shadow-md' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${p.color} border-2 border-black/10 shadow-sm`} />
                        <div className="text-left">
                          <div className="font-black text-slate-950 text-lg">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{p.desc}</div>
                        </div>
                      </div>
                      {palette === p.name && <CheckCircle2 className={`text-${THEME_TOKENS.colors.primary}`} size={24} />}
                    </button>
                  ))}
                </div>
              </section>

              {/* ÉTAPE 3: STYLE VISUEL */}
              <section className={`${THEME_TOKENS.colors.bgCard} ${THEME_TOKENS.spacing.cardPadding} ${THEME_TOKENS.borderRadius.main} shadow-2xl border-2 border-orange-50`}>
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                  <h2 className="text-xl font-black flex items-center gap-3"><Layers size={22} className={`text-${THEME_TOKENS.colors.primary}`} /> {UI_TEXTS.generator.step3Title}</h2>
                  <input 
                    type="text" 
                    placeholder="Filtrer styles..."
                    className="px-4 py-2 bg-slate-100 rounded-full text-xs font-black border-2 border-transparent focus:border-orange-500 outline-none"
                    value={styleSearch}
                    onChange={e => setStyleSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredStyles.map(s => {
                    const IconComp = s.icon;
                    return (
                      <button 
                        key={s.name} 
                        onClick={() => setSelectedStyle(s.name)} 
                        className={`flex flex-col items-center p-5 rounded-[28px] border-2 transition-all gap-2 text-center group ${selectedStyle === s.name ? 'border-orange-500 bg-orange-50 text-orange-600 ring-4 ring-orange-100 shadow-lg' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-400'}`}
                      >
                        <div className={`transition-transform group-hover:scale-110 ${selectedStyle === s.name ? 'text-orange-600' : 'text-slate-600'}`}>
                          <IconComp size={20} />
                        </div>
                        <span className="font-black text-[11px] uppercase tracking-tighter text-slate-950 leading-tight">{s.name}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.category}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ÉTAPE 4: RÉGLAGES FINS */}
              <section className={`${THEME_TOKENS.colors.bgCard} ${THEME_TOKENS.spacing.cardPadding} ${THEME_TOKENS.borderRadius.main} shadow-2xl border-2 border-orange-50`}>
                <h2 className="text-xl font-black mb-8 flex items-center gap-3"><SlidersHorizontal size={22} className={`text-${THEME_TOKENS.colors.primary}`} /> {UI_TEXTS.generator.step4Title}</h2>
                <div className="space-y-8">
                  {[
                    { label: 'Intensité Culturelle', key: 'culturalIntensity' },
                    { label: 'Épaisseur du trait', key: 'lineThickness' },
                    { label: 'Arrondi des formes', key: 'roundedness' },
                    { label: 'Saturation Couleur', key: 'colorIntensity' },
                  ].map(s => (
                    <div key={s.key} className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase text-slate-500 tracking-widest">
                        <span>{s.label}</span>
                        <span className="text-slate-900">{settings[s.key as keyof IconSettings]}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        className="w-full accent-orange-600 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer"
                        value={settings[s.key as keyof IconSettings] as number}
                        onChange={e => setSettings({...settings, [s.key]: parseInt(e.target.value)})}
                      />
                    </div>
                  ))}
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setSettings({...settings, glowEffect: !settings.glowEffect})}
                      className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${settings.glowEffect ? 'bg-orange-600 text-white border-orange-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                    >
                      <Sun size={14} /> Glow {settings.glowEffect ? 'ON' : 'OFF'}
                    </button>
                    <button 
                      onClick={() => setSettings({...settings, textureEnabled: !settings.textureEnabled})}
                      className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${settings.textureEnabled ? 'bg-orange-600 text-white border-orange-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                    >
                      <Hash size={14} /> Texture {settings.textureEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* RESULTS PANEL */}
            <div className="lg:col-span-7 space-y-16">
              {suggestions.length > 0 && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <h2 className="text-4xl font-black mb-10 tracking-tighter flex items-center justify-between">
                    {UI_TEXTS.generator.resultsTitle} <span className="text-xs bg-slate-900 text-white px-5 py-2 rounded-full uppercase tracking-widest shadow-lg">{suggestions.length} Objets détectés</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                    {suggestions.map((s, idx) => (
                      <div key={idx} className={`${THEME_TOKENS.colors.bgCard} p-8 ${THEME_TOKENS.borderRadius.main} border-2 border-orange-50 shadow-xl flex justify-between items-center group hover:border-orange-500 transition-all`}>
                        <div className="flex-1 pr-4">
                          <p className={`text-[11px] font-black text-${THEME_TOKENS.colors.primary} uppercase tracking-[0.2em] mb-2`}>{s.category}</p>
                          <h3 className="font-black text-2xl text-slate-950 leading-tight mb-2 tracking-tight">{s.name}</h3>
                          <p className="text-slate-400 text-xs font-bold italic leading-tight">Style : <span className="text-slate-900 not-italic uppercase text-[10px] tracking-widest">{selectedStyle}</span></p>
                        </div>
                        <button 
                          onClick={() => handleGenerate(s)} 
                          disabled={isGenerating} 
                          className={`shrink-0 bg-slate-950 text-white p-6 rounded-[32px] hover:bg-${THEME_TOKENS.colors.primary} shadow-xl transition-all disabled:opacity-50 active:scale-90`}
                        >
                          {isGenerating ? <RefreshCw className="animate-spin" size={28} /> : <ArrowRight size={28} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-4xl font-black tracking-tighter">{UI_TEXTS.generator.galleryTitle}</h2>
                  {currentIcons.length > 0 && (
                    <button onClick={() => currentIcons.forEach(i => download(i.url, i.name))} className={`text-${THEME_TOKENS.colors.primary} font-black text-sm flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-xl transition-all border border-orange-50`}>
                      <Download size={20} /> Exporter le Pack
                    </button>
                  )}
                </div>
                
                {currentIcons.length === 0 ? (
                  <div className="bg-white border-4 border-dashed border-orange-100 rounded-[60px] h-[450px] flex flex-col items-center justify-center text-slate-300 gap-6 shadow-inner">
                    <div className="p-8 bg-orange-50 rounded-full animate-pulse"><ImageIcon size={80} className="text-orange-200" /></div>
                    <p className="text-2xl font-black italic">{UI_TEXTS.generator.emptyGallery}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                    {currentIcons.map(icon => (
                      <div key={icon.id} className={`${THEME_TOKENS.colors.bgCard} rounded-[50px] p-8 shadow-2xl border-2 border-orange-100 hover:border-orange-500 transition-all group hover:-translate-y-3`}>
                        <div className="aspect-square bg-slate-50 rounded-[40px] overflow-hidden flex items-center justify-center shadow-inner relative">
                          <img src={icon.url} className="w-full h-full object-contain p-8" alt={icon.name} />
                          {/* QUICK ACTIONS OVERLAY */}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                             <button onClick={() => download(icon.url, icon.name)} className="bg-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"><Download size={24} /></button>
                             <button onClick={() => setEditingIconId(icon.id)} className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"><Wand2 size={24} /></button>
                          </div>
                        </div>
                        <p className="mt-6 text-center text-sm font-black text-slate-950 uppercase tracking-tighter line-clamp-1">{icon.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* LIBRARY VIEW */}
        {viewMode === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center justify-between mb-20 flex-wrap gap-8">
               <div>
                  <h2 className="text-7xl font-black mb-4 tracking-tighter">Design Archive</h2>
                  <p className="text-slate-500 font-black italic text-xl">Vos projets iconographiques institutionnels sauvegardés.</p>
               </div>
               <button onClick={() => setViewMode('generator')} className={`bg-${THEME_TOKENS.colors.primary} text-white px-12 py-6 rounded-full font-black text-2xl shadow-2xl hover:scale-105 transition-all active:scale-95`}>Nouveau Projet</button>
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {projects.map(p => (
                <div key={p.id} className={`${THEME_TOKENS.colors.bgCard} p-10 ${THEME_TOKENS.borderRadius.large} shadow-2xl border-4 border-transparent hover:border-orange-500 transition-all group relative cursor-pointer`}>
                  <div className="flex -space-x-8 mb-10">
                    {p.icons.slice(0, 3).map((icon, i) => (
                      <div key={icon.id} className="w-24 h-24 rounded-[36px] border-4 border-white bg-slate-50 shadow-2xl overflow-hidden" style={{zIndex: 3-i}}>
                        <img src={icon.url} className="w-full h-full object-contain p-4" />
                      </div>
                    ))}
                  </div>
                  <h3 className="text-3xl font-black mb-6 group-hover:text-orange-600 transition-colors line-clamp-1 leading-tight tracking-tight">{p.name}</h3>
                  <div className="flex gap-3 flex-wrap">
                    <span className="bg-slate-100 px-6 py-2 rounded-full text-[11px] font-black uppercase text-slate-700 tracking-widest">{p.style}</span>
                    <span className="bg-orange-100 px-6 py-2 rounded-full text-[11px] font-black uppercase text-orange-600 tracking-widest">{p.icons.length} Assets</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); if(confirm("Supprimer ce projet?")) setProjects(prev => prev.filter(x => x.id !== p.id)); }} className="absolute top-10 right-10 p-4 text-slate-200 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm"><Trash2 size={24} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-48 py-24 border-t-4 border-orange-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 bg-${THEME_TOKENS.colors.primary} rounded-[32px] flex items-center justify-center text-white shadow-2xl`}><Palette size={48} /></div>
            <span className="font-black text-5xl tracking-tighter">{UI_TEXTS.header.title} <span className={`text-${THEME_TOKENS.colors.primary}`}>{UI_TEXTS.header.subtitle}</span></span>
          </div>
          <p className="text-slate-950 font-black text-2xl italic max-w-sm text-center md:text-left underline decoration-orange-500 decoration-8 underline-offset-8 leading-tight">
            {UI_TEXTS.footer.tagline}
          </p>
          <div className="flex gap-12 font-black uppercase text-xs tracking-[0.4em] text-slate-950">
            <a href="#" className="hover:text-orange-600 transition-colors">Lab Docs</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Manifesto</a>
          </div>
        </div>
        <div className="text-center mt-24 text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] opacity-60">
          {UI_TEXTS.footer.copyright}
        </div>
      </footer>
    </div>
  );
};

export default App;
