
import React, { useState, useEffect } from 'react';
import { analyzeProjectContent, generateAfricanIcon, refineAfricanIcon } from './services/geminiService';
import { IconSuggestion, GeneratedIcon, AfricanPalette, IconStyle, Project, ViewMode } from './types';
import { 
  Sparkles, 
  Palette, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Image as ImageIcon,
  ArrowRight,
  Globe,
  Layers,
  Droplets,
  Zap,
  Box,
  Smile,
  CircleDashed,
  FolderOpen,
  Plus,
  Trash2,
  ChevronLeft,
  Calendar,
  Grid,
  FileText,
  ShieldCheck,
  Maximize,
  PenTool,
  Fingerprint,
  Sword,
  Gamepad2,
  Film,
  Wind,
  Waves,
  Feather,
  Dna,
  Trees,
  Flame,
  Clapperboard,
  MousePointer2,
  BookOpen,
  Wand2,
  X
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
  { name: 'Neo-Institutional', icon: <ShieldCheck size={18} />, desc: 'Style officiel', category: 'Institutionnel' },
  { name: 'Outline / Line', icon: <PenTool size={18} />, desc: 'Traits fins', category: 'Administratif' },
  { name: 'Duotone', icon: <CircleDashed size={18} />, desc: 'Bicolore moderne', category: 'Administratif' },
  { name: 'Pictogramme e-Gov', icon: <FileText size={18} />, desc: 'Normes e-gouv', category: 'Administratif' },
  { name: 'Cultural-Minimal', icon: <Fingerprint size={18} />, desc: 'Africain discret', category: 'Institutionnel' },
  { name: 'Isometric Light', icon: <Maximize size={18} />, desc: 'Structure 2.5D', category: 'Data' },
  
  // Matières & Matériaux
  { name: 'Wood Carved', icon: <Trees size={18} />, desc: 'Bois sculpté', category: 'Matière' },
  { name: 'Wood Burned', icon: <Flame size={18} />, desc: 'Pyrogravure', category: 'Matière' },
  { name: 'Slate Ardoise', icon: <BookOpen size={18} />, desc: 'Ardoise scolaire', category: 'Matière' },
  { name: 'Chalk Craie', icon: <MousePointer2 size={18} />, desc: 'Effet craie', category: 'Matière' },
  { name: 'Fabric Textile', icon: <Waves size={18} />, desc: 'Tissé textile', category: 'Matière' },
  { name: 'Stone Engraved', icon: <Wind size={18} />, desc: 'Pierre taillée', category: 'Matière' },
  { name: 'Clay Terracotta', icon: <Waves size={18} />, desc: 'Terre cuite', category: 'Matière' },

  // Manga & Anime
  { name: 'Manga Line Art', icon: <PenTool size={18} />, desc: 'Encre Shonen', category: 'Manga' },
  { name: 'Anime Flat Color', icon: <Wind size={18} />, desc: 'Aplats colorés', category: 'Manga' },
  { name: 'Chibi Icons', icon: <Smile size={18} />, desc: 'Mignon & Fun', category: 'Manga' },
  { name: 'Afro-Anime', icon: <Gamepad2 size={18} />, desc: 'Hybride Moderne', category: 'Manga' },

  // Gaming & Pop
  { name: 'Pixel Art', icon: <Grid size={18} />, desc: '8-bit Rétro', category: 'Gaming' },
  { name: 'Cyber Anime', icon: <Zap size={18} />, desc: 'Néon futuriste', category: 'Gaming' },
  { name: 'Mecha Tech', icon: <Sword size={18} />, desc: 'Robotique', category: 'Gaming' },

  // Cinéma & Art
  { name: 'Noir & Blanc Cinéma', icon: <Clapperboard size={18} />, desc: 'Contraste fort', category: 'Cinéma' },
  { name: 'Comic Book', icon: <BookOpen size={18} />, desc: 'Style US Comic', category: 'Cinéma' },
  { name: 'Illustration Vintage', icon: <Film size={18} />, desc: 'Rétro 60s', category: 'Cinéma' },
  { name: 'Symbolic Mythic', icon: <Feather size={18} />, desc: 'Mythologie', category: 'Art' },

  // Digital & Expérimental
  { name: '3D Glossy', icon: <Box size={18} />, desc: 'Premium', category: 'Digital' },
  { name: 'Clay Stop Motion', icon: <Waves size={18} />, desc: 'Pâte à modeler', category: 'Expérimental' },
  { name: 'Generative Abstract', icon: <Dna size={18} />, desc: 'Algorithmique', category: 'Expérimental' },
  { name: 'Hand-Drawn Sketch', icon: <PenTool size={18} />, desc: 'Croquis humain', category: 'Expérimental' },
];

const STORAGE_KEY = 'afriicon_projects_v2';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('generator');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState('');
  const [palette, setPalette] = useState<AfricanPalette>('Kente');
  const [selectedStyle, setSelectedStyle] = useState<IconStyle>('Neo-Institutional');
  const [suggestions, setSuggestions] = useState<IconSuggestion[]>([]);
  const [currentIcons, setCurrentIcons] = useState<GeneratedIcon[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [styleSearch, setStyleSearch] = useState('');

  // Modification State
  const [editingIconId, setEditingIconId] = useState<string | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setProjects(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
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
      setCurrentIcons([]);
    } catch (err) {
      setError('Erreur lors de l\'analyse profonde.');
    } finally { setIsAnalyzing(false); }
  };

  const handleGenerateIcon = async (suggestion: IconSuggestion) => {
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateAfricanIcon(suggestion, palette, selectedStyle);
      if (url) {
        const newIcon: GeneratedIcon = {
          id: Math.random().toString(36).substr(2, 9),
          url,
          prompt: suggestion.africanStylingPrompt,
          name: suggestion.name
        };
        addIconToProject(newIcon);
      }
    } catch (err) {
      setError('La génération a échoué.');
    } finally { setIsGenerating(false); }
  };

  const handleRefineIcon = async () => {
    if (!editingIconId || !refinementPrompt) return;
    const targetIcon = currentIcons.find(i => i.id === editingIconId);
    if (!targetIcon) return;

    setIsGenerating(true);
    setError(null);
    try {
      const newUrl = await refineAfricanIcon(targetIcon.url, refinementPrompt, palette, selectedStyle);
      if (newUrl) {
        const updatedIcon = { ...targetIcon, url: newUrl };
        setCurrentIcons(prev => prev.map(i => i.id === editingIconId ? updatedIcon : i));
        
        // Update in project storage too
        setProjects(prev => prev.map(p => ({
          ...p,
          icons: p.icons.map(i => i.id === editingIconId ? updatedIcon : i)
        })));

        setEditingIconId(null);
        setRefinementPrompt('');
      }
    } catch (err) {
      setError('Modification échouée.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addIconToProject = (newIcon: GeneratedIcon) => {
    setCurrentIcons(prev => [newIcon, ...prev]);
    const projectName = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    const existingProjectIndex = projects.findIndex(p => p.description === content);
    if (existingProjectIndex > -1) {
      const updatedProjects = [...projects];
      updatedProjects[existingProjectIndex].icons.unshift(newIcon);
      setProjects(updatedProjects);
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectName || "Projet sans nom",
        description: content,
        palette,
        style: selectedStyle,
        icons: [newIcon],
        suggestions: suggestions,
        createdAt: Date.now()
      };
      setProjects(prev => [newProject, ...prev]);
    }
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Supprimer ce projet ?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProject?.id === id) setViewMode('library');
    }
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-afriicon.png`;
    link.click();
  };

  const filteredStyles = STYLES.filter(s => 
    s.name.toLowerCase().includes(styleSearch.toLowerCase()) || 
    s.category.toLowerCase().includes(styleSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-slate-900 selection:bg-orange-200">
      <div className="african-pattern fixed inset-0 pointer-events-none opacity-[0.05]" />
      
      {/* Modification Modal */}
      {editingIconId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-950 flex items-center gap-2">
                <Wand2 className="text-orange-600" /> Modifier l'icône
              </h3>
              <button onClick={() => setEditingIconId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="aspect-square w-32 mx-auto bg-slate-50 rounded-3xl overflow-hidden mb-6 border-2 border-orange-100 shadow-inner">
              <img src={currentIcons.find(i => i.id === editingIconId)?.url} className="w-full h-full object-contain p-2" />
            </div>
            <p className="text-slate-500 font-bold text-sm mb-4">Instructions de modification (ex: "enlève les détails complexes", "rend la structure plus épaisse") :</p>
            <textarea 
              autoFocus
              className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-orange-500 outline-none font-bold text-slate-900 placeholder:text-slate-400"
              placeholder="Que souhaitez-vous changer ?"
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
            />
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setEditingIconId(null)}
                className="flex-1 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleRefineIcon}
                disabled={isGenerating || !refinementPrompt}
                className="flex-1 py-4 rounded-2xl font-black bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                {isGenerating ? 'Modification...' : 'Appliquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white/95 backdrop-blur-md border-b-2 border-orange-100 sticky top-0 z-50 px-8 py-5 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewMode('generator')}>
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
            <Palette size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tighter">AfriIcon <span className="text-orange-600 italic">Studio</span></h1>
        </div>
        
        <div className="flex items-center bg-slate-200/50 p-1.5 rounded-[20px] shadow-inner">
          <button onClick={() => setViewMode('generator')} className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${viewMode === 'generator' ? 'bg-white shadow-md text-orange-600' : 'text-slate-600 hover:text-slate-950'}`}>Générer</button>
          <button onClick={() => setViewMode('library')} className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${viewMode === 'library' || viewMode === 'project-detail' ? 'bg-white shadow-md text-orange-600' : 'text-slate-600 hover:text-slate-950'}`}>Bibliothèque ({projects.length})</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 relative z-10">
        {viewMode === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-10">
              {/* Étape 1: Audit Exhaustif */}
              <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-950">
                  <Globe size={24} className="text-orange-600" /> 1. Audit Deep-Analyse
                </h2>
                <textarea 
                  className="w-full h-36 p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:ring-0 transition-all outline-none text-slate-950 font-black placeholder:text-slate-400 text-lg shadow-inner"
                  placeholder="Décrivez votre projet complexe pour une analyse complète (audit de 20+ icônes)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !content}
                  className="w-full mt-6 flex items-center justify-center gap-2 min-h-[72px] rounded-3xl font-black bg-slate-950 text-white hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 text-xl leading-none py-4 px-6"
                >
                  <div className="flex items-center gap-3">
                    {isAnalyzing ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />}
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">Lancer l'Analyse Profonde</span>
                  </div>
                </button>
              </section>

              {/* Étape 2: Palette */}
              <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-950">
                  <Palette size={24} className="text-orange-600" /> 2. Univers de Couleur
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {PALETTES.map((p) => (
                    <button key={p.name} onClick={() => setPalette(p.name)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${palette === p.name ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100 shadow-lg' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${p.color} border-2 border-black/10 shadow-sm`} />
                        <div className="text-left">
                          <div className="font-black text-slate-950 text-lg">{p.name}</div>
                          <div className="text-xs text-slate-500 font-black uppercase tracking-widest">{p.desc}</div>
                        </div>
                      </div>
                      {palette === p.name && <CheckCircle2 className="text-orange-600" size={28} />}
                    </button>
                  ))}
                </div>
              </section>

              {/* Étape 3: Styles */}
              <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                  <h2 className="text-2xl font-black flex items-center gap-3 text-slate-950">
                    <Layers size={24} className="text-orange-600" /> 3. Style Visuel
                  </h2>
                  <input 
                    type="text" 
                    placeholder="Chercher style..."
                    className="px-4 py-2 bg-slate-100 rounded-full text-xs font-black border-2 border-transparent focus:border-orange-500 outline-none"
                    value={styleSearch}
                    onChange={(e) => setStyleSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredStyles.map((s) => (
                    <button 
                      key={s.name} 
                      onClick={() => setSelectedStyle(s.name)} 
                      className={`flex flex-col items-center p-5 rounded-[28px] border-2 transition-all gap-2 text-center group ${selectedStyle === s.name ? 'border-orange-500 bg-orange-50 text-orange-600 ring-4 ring-orange-100 shadow-lg' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-400'}`}
                    >
                      <div className={`transition-transform group-hover:scale-110 ${selectedStyle === s.name ? 'text-orange-600' : 'text-slate-600'}`}>{s.icon}</div>
                      <span className="font-black text-[11px] uppercase tracking-tighter text-slate-950 leading-tight">{s.name}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.category}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-7 space-y-16">
              {suggestions.length > 0 && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <h2 className="text-4xl font-black mb-10 text-slate-950 tracking-tighter flex items-center justify-between">
                    Audit Institutionnel <span className="text-sm bg-slate-900 text-white px-4 py-1 rounded-full uppercase tracking-widest">{suggestions.length} Objets</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                    {suggestions.map((item, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-[40px] border-2 border-orange-100 shadow-xl flex justify-between items-center group hover:border-orange-500 transition-all">
                        <div className="flex-1 pr-4">
                          <p className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2">{item.category}</p>
                          <h3 className="font-black text-2xl text-slate-950 mb-3 tracking-tight">{item.name}</h3>
                          <p className="text-slate-500 text-sm font-bold italic leading-relaxed">Rendu : <span className="text-slate-900 not-italic">{selectedStyle}</span></p>
                        </div>
                        <button onClick={() => handleGenerateIcon(item)} disabled={isGenerating} className="shrink-0 bg-slate-950 text-white p-6 rounded-[32px] hover:bg-orange-600 transition-all shadow-xl active:scale-90 disabled:opacity-50">
                          {isGenerating ? <RefreshCw className="animate-spin" size={28} /> : <ArrowRight size={28} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-4xl font-black text-slate-950 tracking-tighter">Plan de Travail</h2>
                  {currentIcons.length > 0 && (
                    <div className="flex gap-4">
                       <button 
                        onClick={() => currentIcons.forEach(i => downloadImage(i.url, i.name))}
                        className="text-orange-600 font-black text-sm flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-xl transition-all border border-orange-50"
                      >
                        <Download size={18} /> Tout Exporter
                      </button>
                    </div>
                  )}
                </div>
                
                {currentIcons.length === 0 ? (
                  <div className="bg-white border-4 border-dashed border-orange-100 rounded-[60px] h-[450px] flex flex-col items-center justify-center text-slate-300 gap-6 shadow-inner">
                    <div className="p-8 bg-orange-50 rounded-full">
                      <ImageIcon size={72} className="text-orange-200" />
                    </div>
                    <p className="text-2xl font-black text-slate-400 italic">Lancez une génération...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                    {currentIcons.map((icon) => (
                      <div key={icon.id} className="group relative bg-white rounded-[50px] p-8 shadow-2xl border-2 border-orange-100 hover:border-orange-500 transition-all hover:-translate-y-3">
                        <div className="aspect-square bg-slate-50 rounded-[40px] overflow-hidden flex items-center justify-center shadow-inner">
                          <img src={icon.url} className="w-full h-full object-contain p-6" alt={icon.name} />
                        </div>
                        
                        {/* Action Toolbar */}
                        <div className="absolute -top-4 -right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => downloadImage(icon.url, icon.name)} className="w-12 h-12 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-2xl hover:bg-orange-600 hover:text-white border-2 border-orange-100 transition-colors">
                            <Download size={20} />
                          </button>
                          <button onClick={() => setEditingIconId(icon.id)} className="w-12 h-12 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-orange-600 transition-colors border-2 border-slate-950">
                            <Wand2 size={20} />
                          </button>
                        </div>
                        
                        <p className="mt-6 text-center text-base font-black text-slate-950 uppercase tracking-tighter line-clamp-1">{icon.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* View Library & Project Detail same as before */}
        {viewMode === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="flex items-center justify-between mb-20 flex-wrap gap-8">
               <div>
                  <h2 className="text-6xl font-black text-slate-950 mb-4 tracking-tighter leading-none">Design Archive</h2>
                  <p className="text-slate-500 font-black italic text-xl">Vos créations iconographiques institutionnelles.</p>
               </div>
               <button onClick={() => setViewMode('generator')} className="bg-orange-600 text-white px-10 py-5 rounded-full font-black text-xl shadow-xl hover:scale-105 transition-all active:scale-95">Nouveau Projet</button>
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {projects.map((project) => (
                <div key={project.id} onClick={() => { setSelectedProject(project); setViewMode('project-detail'); }} className="group bg-white p-10 rounded-[64px] shadow-2xl border-4 border-transparent hover:border-orange-500 transition-all cursor-pointer relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="flex -space-x-6">
                      {project.icons.slice(0, 3).map((icon, i) => (
                        <div key={icon.id} className="w-20 h-20 rounded-[32px] border-4 border-white bg-slate-50 shadow-2xl overflow-hidden" style={{zIndex: 3-i}}>
                          <img src={icon.url} className="w-full h-full object-contain p-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-950 mb-5 group-hover:text-orange-600 transition-colors line-clamp-1 leading-tight">{project.name}</h3>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-5 py-2 bg-slate-100 rounded-full text-[11px] font-black uppercase text-slate-700 tracking-widest">{project.style}</span>
                    <span className="px-5 py-2 bg-orange-100 rounded-full text-[11px] font-black uppercase text-orange-600 tracking-widest">{project.icons.length} Assets</span>
                  </div>
                  <button onClick={(e) => deleteProject(project.id, e)} className="absolute top-10 right-10 p-3 text-slate-200 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm"><Trash2 size={24} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'project-detail' && selectedProject && (
          <div className="animate-in slide-in-from-right-10 duration-700">
            <button onClick={() => setViewMode('library')} className="flex items-center gap-4 text-slate-950 font-black mb-16 hover:text-orange-600 group transition-all text-xl">
              <div className="p-4 bg-white rounded-3xl shadow-xl group-hover:bg-orange-50 transition-colors"><ChevronLeft size={32} /></div>
              Design Archive
            </button>
            
            <div className="bg-white rounded-[80px] p-20 shadow-2xl border-4 border-orange-50 mb-16">
              <div className="flex flex-col xl:flex-row justify-between items-start gap-12 mb-24 border-b-4 border-orange-50 pb-16">
                <div className="max-w-4xl">
                  <div className="flex items-center flex-wrap gap-6 mb-8">
                    <h2 className="text-7xl font-black text-slate-950 tracking-tighter leading-none">{selectedProject.name}</h2>
                    <span className={`px-8 py-3 rounded-full text-xs font-black text-white shadow-2xl uppercase tracking-[0.2em] ${PALETTES.find(p => p.name === selectedProject.palette)?.color || 'bg-slate-950'}`}>{selectedProject.palette}</span>
                  </div>
                  <p className="text-3xl text-slate-500 font-black italic leading-tight decoration-orange-400 underline underline-offset-[12px] decoration-4 opacity-90">"{selectedProject.description}"</p>
                </div>
                <button onClick={() => selectedProject.icons.forEach(i => downloadImage(i.url, i.name))} className="bg-slate-950 text-white px-12 py-7 rounded-[40px] font-black text-2xl hover:bg-orange-600 transition-all shadow-2xl active:scale-95 flex items-center gap-4 shrink-0">
                  <Download size={32} /> Export Pack PNG
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-16">
                {selectedProject.icons.map((icon) => (
                  <div key={icon.id} className="group relative">
                    <div className="aspect-square bg-slate-50 rounded-[64px] shadow-2xl border-4 border-orange-50 p-12 transition-all hover:border-orange-500 hover:-translate-y-5 hover:shadow-orange-200">
                      <img src={icon.url} className="w-full h-full object-contain" alt={icon.name} />
                      <div className="absolute -top-6 -right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => downloadImage(icon.url, icon.name)} className="w-14 h-14 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-2xl hover:bg-orange-600 hover:text-white border-2 border-orange-100 transition-colors">
                          <Download size={24} />
                        </button>
                        <button onClick={() => { setEditingIconId(icon.id); setViewMode('generator'); }} className="w-14 h-14 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-orange-600 transition-colors border-2 border-slate-950">
                          <Wand2 size={24} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-8 text-center text-lg font-black text-slate-950 uppercase tracking-tighter">{icon.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-48 py-24 border-t-4 border-orange-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-orange-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl"><Palette size={40} /></div>
            <span className="font-black text-5xl text-slate-950 tracking-tighter">AfriIcon <span className="text-orange-600">Studio</span></span>
          </div>
          <div className="max-w-md text-center md:text-left">
            <p className="text-slate-950 font-black text-2xl italic leading-tight underline decoration-orange-500 decoration-8 underline-offset-8">
              Audit institutionnel et création iconographique haute-fidélité.
            </p>
          </div>
          <div className="flex gap-12 font-black uppercase text-sm tracking-[0.3em] text-slate-950">
             <a href="#" className="hover:text-orange-600 transition-colors">Lab Docs</a>
             <a href="#" className="hover:text-orange-600 transition-colors">Manifesto</a>
             <a href="#" className="hover:text-orange-600 transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
