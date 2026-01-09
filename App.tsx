
import React, { useState, useEffect, useRef } from 'react';
import { analyzeProjectContent, generateAfricanIcon, refineAfricanIcon } from './services/geminiService';
import { IconSuggestion, GeneratedIcon, AfricanPalette, IconStyle, Project, ViewMode, IconSettings } from './types';
import { 
  Sparkles, Palette, Download, RefreshCw, CheckCircle2, Image as ImageIcon,
  ArrowRight, Globe, Layers, Droplets, Zap, Box, Smile, CircleDashed,
  Trash2, ChevronLeft, ShieldCheck, Wand2, X, SlidersHorizontal, Sun, Hash,
  Loader2, Search, AlertCircle, Smartphone
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

  const resultsRef = useRef<HTMLDivElement>(null);

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
    setSuggestions([]);
    setError(null);
    try {
      const results = await analyzeProjectContent(content, palette);
      if (results.length === 0) {
        setError("L'IA n'a pas pu identifier d'icônes.");
      } else {
        setSuggestions(results);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    } catch (err: any) { 
      setError("Erreur : " + (err.message || "Problème de connexion.")); 
    } finally { 
      setIsAnalyzing(false); 
    }
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
    } catch (err: any) { 
      setError("Désolé, la génération a échoué. Essayez un autre style.");
    } finally { 
      setIsGenerating(false); 
    }
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
        name: content.slice(0, 30) || "Logo " + suggestionCount(),
        description: content,
        palette, style: selectedStyle, icons: [icon], suggestions, createdAt: Date.now()
      }, ...prev]);
    }
  };

  const suggestionCount = () => projects.length + 1;

  const download = (url: string, name: string) => {
    const a = document.createElement('a'); a.href = url; a.download = `${name}.png`; a.click();
  };

  const filteredStyles = STYLE_CONFIG.filter(s => 
    s.name.toLowerCase().includes(styleSearch.toLowerCase()) || 
    s.category.toLowerCase().includes(styleSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-[${THEME_TOKENS.colors.bgMain}] ${THEME_TOKENS.colors.textMain} selection:bg-orange-200 pb-10`}>
      <div className="african-pattern fixed inset-0 pointer-events-none opacity-[0.05]" />

      {/* MODAL RAFFINER (Glass) */}
      {editingIconId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6">
          <div className={`bg-white/90 backdrop-blur-xl rounded-t-[32px] md:rounded-[40px] p-6 md:p-10 max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Wand2 className="text-orange-600" /> {UI_TEXTS.refineModal.title}
              </h3>
              <button onClick={() => setEditingIconId(null)} className="p-3 hover:bg-slate-200/50 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={24} /></button>
            </div>
            <div className="bg-slate-100/50 backdrop-blur-md p-4 rounded-3xl border border-orange-100/30 mb-6 flex justify-center">
              <img src={currentIcons.find(i => i.id === editingIconId)?.url} className="w-32 h-32 md:w-40 md:h-40 object-contain shadow-lg rounded-2xl" />
            </div>
            <textarea 
              className="w-full h-24 p-4 rounded-2xl bg-white/50 border-2 border-slate-100 outline-none font-bold mb-6 focus:border-orange-500 shadow-inner"
              placeholder={UI_TEXTS.refineModal.placeholder}
              value={refinementPrompt}
              onChange={e => setRefinementPrompt(e.target.value)}
            />
            <div className="flex flex-col md:flex-row gap-3">
              <button onClick={() => setEditingIconId(null)} className="order-2 md:order-1 flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black min-h-[44px]">Annuler</button>
              <button onClick={handleRefine} disabled={isGenerating} className="order-1 md:order-2 flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-black shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]">
                {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                {isGenerating ? "En cours..." : UI_TEXTS.refineModal.button}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAV (Glass) */}
      <nav className="bg-white/70 backdrop-blur-lg border-b border-orange-100/30 sticky top-0 z-50 px-4 md:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => setViewMode('generator')}>
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform"><Smartphone size={24} /></div>
          <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tighter">
            {UI_TEXTS.header.title} <span className="text-orange-600 italic">{UI_TEXTS.header.subtitle}</span>
          </h1>
        </div>
        <div className="flex bg-slate-200/50 backdrop-blur-md p-1 rounded-xl w-full sm:w-auto">
          <button onClick={() => setViewMode('generator')} className={`flex-1 sm:px-8 py-2.5 rounded-lg text-xs md:text-sm font-black transition-all min-h-[44px] ${viewMode === 'generator' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}>{UI_TEXTS.header.navGenerate}</button>
          <button onClick={() => setViewMode('library')} className={`flex-1 sm:px-8 py-2.5 rounded-lg text-xs md:text-sm font-black transition-all min-h-[44px] ${viewMode === 'library' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}>{UI_TEXTS.header.navLibrary} ({projects.length})</button>
        </div>
      </nav>

      <main className={`max-w-7xl mx-auto ${THEME_TOKENS.spacing.containerPadding} relative z-10`}>
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-md border border-red-200 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <AlertCircle className="text-red-600" size={24} />
              <p className="text-red-900 font-bold text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 text-red-600 hover:bg-red-100 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={20} /></button>
          </div>
        )}

        {viewMode === 'generator' && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-12">
            
            {/* SIDEBAR CONFIG */}
            <div className="lg:col-span-5 space-y-6 md:space-y-10">
              <section className={`bg-white/60 backdrop-blur-md ${THEME_TOKENS.spacing.cardPadding} ${THEME_TOKENS.borderRadius.main} shadow-xl border border-orange-100/30`}>
                <h2 className="text-lg font-black mb-4 flex items-center gap-3"><Globe size={20} className="text-orange-600" /> {UI_TEXTS.generator.step1Title}</h2>
                <textarea 
                  className="w-full h-32 p-4 rounded-2xl bg-white/50 border border-slate-200 outline-none font-bold text-base focus:border-orange-500 transition-colors shadow-inner"
                  placeholder={UI_TEXTS.generator.step1Placeholder}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !content}
                  className="w-full mt-4 flex items-center justify-center gap-3 h-14 md:h-16 bg-slate-950 text-white rounded-2xl font-black text-base md:text-lg hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 min-h-[44px]"
                >
                  {isAnalyzing ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />}
                  <span>{isAnalyzing ? "Analyse..." : UI_TEXTS.generator.step1Button}</span>
                </button>
              </section>

              {/* PALETTE (Univers Transparent) */}
              <section className={`bg-white/60 backdrop-blur-md ${THEME_TOKENS.spacing.cardPadding} ${THEME_TOKENS.borderRadius.main} shadow-xl border border-orange-100/30`}>
                <h2 className="text-lg font-black mb-4 flex items-center gap-3"><Droplets size={20} className="text-orange-600" /> {UI_TEXTS.generator.step2Title}</h2>
                <div className="grid grid-cols-1 gap-2">
                  {PALETTE_CONFIG.map(p => (
                    <button 
                      key={p.name} 
                      onClick={() => setPalette(p.name)} 
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all min-h-[44px] ${palette === p.name ? `border-orange-500 bg-orange-50/50 shadow-md scale-[1.01]` : 'border-slate-100 bg-white/30 hover:bg-white/60'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${p.color} border-2 ${p.border} shadow-sm`} />
                        <div className="text-left">
                          <div className="font-black text-slate-950 text-sm md:text-base leading-tight">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.desc}</div>
                        </div>
                      </div>
                      {palette === p.name && <CheckCircle2 className="text-orange-600" size={22} />}
                    </button>
                  ))}
                </div>
              </section>

              {/* STYLE (Grid Responsif) */}
              <section className={`bg-white/60 backdrop-blur-md ${THEME_TOKENS.spacing.cardPadding} ${THEME_TOKENS.borderRadius.main} shadow-xl border border-orange-100/30`}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-lg font-black flex items-center gap-3"><Layers size={20} className="text-orange-600" /> {UI_TEXTS.generator.step3Title}</h2>
                  <div className="relative w-full sm:w-auto">
                    <input 
                      type="text" 
                      placeholder="Filtrer styles..."
                      className="pl-9 pr-3 py-2 bg-white/50 rounded-full text-xs font-bold border border-slate-100 focus:border-orange-500 outline-none w-full min-h-[44px]"
                      value={styleSearch}
                      onChange={e => setStyleSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>
                <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredStyles.map(s => {
                    const IconComp = s.icon;
                    return (
                      <button 
                        key={s.name} 
                        onClick={() => setSelectedStyle(s.name)} 
                        className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all gap-1 text-center group min-h-[44px] ${selectedStyle === s.name ? 'border-orange-500 bg-orange-50/50 text-orange-600 shadow-md' : 'border-slate-50 bg-white/20 hover:bg-white/40 text-slate-400'}`}
                      >
                        <div className={`transition-transform group-hover:scale-110 ${selectedStyle === s.name ? 'text-orange-600' : 'text-slate-600'}`}>
                          <IconComp size={18} />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-tighter text-slate-950 leading-tight truncate w-full">{s.name}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.category}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* MAIN RESULTS */}
            <div className="lg:col-span-7 space-y-10" ref={resultsRef}>
              
              {/* SUGGESTIONS DE LOGOS */}
              {(suggestions.length > 0 || isAnalyzing) && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-950 leading-none">
                      {isAnalyzing ? "Analyse Stratégique..." : UI_TEXTS.generator.resultsTitle}
                    </h2>
                    {!isAnalyzing && (
                      <span className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg">
                        {suggestions.length} Idées
                      </span>
                    )}
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white/40 backdrop-blur-sm p-6 rounded-[24px] border border-slate-50 shadow-sm animate-pulse flex flex-col gap-3">
                          <div className="h-3 w-12 bg-slate-100 rounded-full" />
                          <div className="h-6 w-32 bg-slate-100 rounded-lg" />
                          <div className="h-3 w-20 bg-slate-50 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {suggestions.map((s, idx) => (
                        <div key={idx} className="bg-white/60 backdrop-blur-md p-6 rounded-[24px] border border-orange-100/30 shadow-xl flex justify-between items-center group hover:border-orange-500 transition-all">
                          <div className="flex-1 pr-4">
                            <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1">{s.category}</p>
                            <h3 className="font-black text-lg md:text-xl text-slate-950 leading-tight mb-2 tracking-tight">{s.name}</h3>
                            <div className="flex items-center gap-1.5 opacity-60">
                               <CheckCircle2 size={10} className="text-green-600" />
                               <span className="text-[9px] font-bold uppercase tracking-widest">Concept Prêt</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleGenerate(s)} 
                            disabled={isGenerating} 
                            className="shrink-0 bg-slate-950 text-white p-4 rounded-[20px] hover:bg-orange-600 shadow-xl transition-all disabled:opacity-50 active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          >
                            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* GALLERY (App Icons) */}
              <section className="pt-8 border-t border-orange-100/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-950 leading-none">{UI_TEXTS.generator.galleryTitle}</h2>
                  {currentIcons.length > 0 && (
                    <button onClick={() => currentIcons.forEach(i => download(i.url, i.name))} className="text-orange-600 font-black text-xs flex items-center justify-center gap-2 px-6 py-2.5 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-orange-100/30 min-h-[44px]">
                      <Download size={16} /> Tout exporter
                    </button>
                  )}
                </div>
                
                {currentIcons.length === 0 && !isAnalyzing ? (
                  <div className="bg-white/40 backdrop-blur-md border-2 border-dashed border-orange-100/30 rounded-[40px] h-[300px] flex flex-col items-center justify-center text-slate-300 gap-4 shadow-inner text-center p-6">
                    <div className="p-5 bg-orange-50/50 rounded-full"><Smartphone size={40} className="text-orange-100" /></div>
                    <p className="text-xl font-black italic opacity-50">{UI_TEXTS.generator.emptyGallery}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {currentIcons.map(icon => (
                      <div key={icon.id} className="bg-white/80 backdrop-blur-md rounded-[32px] p-5 shadow-xl border border-orange-100/30 hover:border-orange-500 transition-all group relative">
                        <div className="aspect-square bg-slate-50 rounded-[20px] overflow-hidden flex items-center justify-center shadow-inner relative">
                          <img src={icon.url} className="w-full h-full object-contain p-4" alt={icon.name} />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                             <button onClick={() => download(icon.url, icon.name)} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"><Download size={20} /></button>
                             <button onClick={() => setEditingIconId(icon.id)} className="bg-slate-950 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"><Wand2 size={20} /></button>
                          </div>
                        </div>
                        <p className="mt-3 text-center text-[11px] font-black text-slate-950 uppercase tracking-tighter truncate px-2">{icon.name}</p>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="bg-white/40 backdrop-blur-sm rounded-[32px] aspect-square shadow-inner border-2 border-dashed border-orange-100/30 flex flex-col items-center justify-center gap-3 animate-pulse">
                         <Loader2 className="animate-spin text-orange-600" size={32} />
                         <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Génération Logo...</span>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ARCHIVES (Library) */}
        {viewMode === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 text-center md:text-left">
               <div>
                  <h2 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter leading-none">Patrimoine Digital</h2>
                  <p className="text-slate-400 font-bold italic text-base">Vos logos et identités visuelles sauvegardés.</p>
               </div>
               <button onClick={() => setViewMode('generator')} className="w-full md:w-auto bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all min-h-[44px]">Créer un Nouveau Logo</button>
             </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {projects.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-200 font-black text-2xl uppercase tracking-widest opacity-30">Studio Vide</div>
              ) : projects.map(p => (
                <div key={p.id} onClick={() => { setContent(p.description); setViewMode('generator'); }} className="bg-white/60 backdrop-blur-md p-6 rounded-[32px] shadow-xl border border-orange-100/30 hover:border-orange-500 transition-all group relative cursor-pointer">
                  <div className="flex -space-x-4 mb-6">
                    {p.icons.slice(0, 3).map((icon, i) => (
                      <div key={icon.id} className="w-16 h-16 rounded-2xl border-4 border-white/80 bg-slate-50 shadow-md overflow-hidden" style={{zIndex: 3-i}}>
                        <img src={icon.url} className="w-full h-full object-contain p-2" />
                      </div>
                    ))}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-3 line-clamp-1 leading-tight">{p.name}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-slate-100/50 px-3 py-1 rounded-full text-[9px] font-black uppercase text-slate-600 tracking-widest border border-slate-200/30">{p.style}</span>
                    <span className="bg-orange-100/50 px-3 py-1 rounded-full text-[9px] font-black uppercase text-orange-600 tracking-widest border border-orange-200/30">{p.icons.length} Assets</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); if(confirm("Supprimer ce pack de logos ?")) setProjects(prev => prev.filter(x => x.id !== p.id)); }} className="absolute top-6 right-6 p-2 text-slate-200 hover:text-red-500 transition-colors bg-white/80 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-24 py-16 border-t border-orange-100/30 bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-xl"><Smartphone size={28} /></div>
            <span className="font-black text-3xl tracking-tighter">AfriIcon <span className="text-orange-600">Logo</span></span>
          </div>
          <p className="text-slate-900 font-black text-lg italic max-w-sm leading-tight underline decoration-orange-500 decoration-4 underline-offset-4">
            {UI_TEXTS.footer.tagline}
          </p>
          <div className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-50">
            {UI_TEXTS.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
