
import React, { useState, useEffect } from 'react';
import { analyzeProjectContent, generateAfricanIcon } from './services/geminiService';
import { IconSuggestion, GeneratedIcon, AfricanPalette, IconStyle, Project, ViewMode } from './types';
import { 
  Sparkles, 
  Palette, 
  Layout, 
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
  Fingerprint
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
  { name: 'Outline / Line', icon: <PenTool size={18} />, desc: 'Traits fins', category: 'Administratif' },
  { name: 'Duotone', icon: <CircleDashed size={18} />, desc: 'Bicolore moderne', category: 'Administratif' },
  { name: 'Neo-Institutional', icon: <ShieldCheck size={18} />, desc: 'Style officiel', category: 'Institutionnel' },
  { name: 'Pictogramme e-Gov', icon: <FileText size={18} />, desc: 'Normes e-gouv', category: 'Administratif' },
  { name: 'Cultural-Minimal', icon: <Fingerprint size={18} />, desc: 'Africain discret', category: 'Institutionnel' },
  { name: 'Isometric Light', icon: <Maximize size={18} />, desc: 'Structure 2.5D', category: 'Tableaux de bord' },
  
  // Digital & Créatif
  { name: '3D Glossy', icon: <Box size={18} />, desc: 'Réalisme Premium', category: 'Digital' },
  { name: 'Glassmorphism', icon: <Layers size={18} />, desc: 'Translucide', category: 'Digital' },
  { name: 'Liquid Glass', icon: <Droplets size={18} />, desc: 'Fluide & Brillant', category: 'Digital' },
  { name: 'Playful Cartoon', icon: <Smile size={18} />, desc: 'Doux & Amical', category: 'Créatif' },
  { name: 'Cyberpunk African', icon: <Zap size={18} />, desc: 'Futuriste', category: 'Créatif' },
];

const STORAGE_KEY = 'afriicon_projects';

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
      setError('Erreur lors de l\'analyse.');
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
      }
    } catch (err) {
      setError('La génération a échoué. Vérifiez votre clé API.');
    } finally { setIsGenerating(false); }
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

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-slate-900 selection:bg-orange-200">
      <div className="african-pattern fixed inset-0 pointer-events-none opacity-[0.05]" />
      
      <nav className="bg-white/95 backdrop-blur-md border-b-2 border-orange-100 sticky top-0 z-50 px-8 py-5 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewMode('generator')}>
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
            <Palette size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tighter">AfriIcon <span className="text-orange-600 italic">Modern</span></h1>
        </div>
        
        <div className="flex items-center bg-slate-100 p-1.5 rounded-[20px] shadow-inner">
          <button onClick={() => setViewMode('generator')} className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${viewMode === 'generator' ? 'bg-white shadow-md text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}>Générer</button>
          <button onClick={() => setViewMode('library')} className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${viewMode === 'library' || viewMode === 'project-detail' ? 'bg-white shadow-md text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}>Bibliothèque ({projects.length})</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 relative z-10">
        {viewMode === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-10">
              {/* Étape 1 */}
              <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-950">
                  <Globe size={24} className="text-orange-600" /> 1. Source du Projet
                </h2>
                <textarea 
                  className="w-full h-36 p-5 rounded-3xl bg-slate-50 border-3 border-slate-100 focus:border-orange-500 focus:ring-0 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-400 text-lg"
                  placeholder="Collez l'URL de votre site ou décrivez votre projet..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !content}
                  className="w-full mt-6 py-5 rounded-3xl font-black bg-slate-950 text-white hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 text-lg"
                >
                  {isAnalyzing ? <RefreshCw className="animate-spin inline mr-2" /> : <Sparkles className="inline mr-2" />}
                  Identifier les Icônes
                </button>
              </section>

              {/* Étape 2 & 3 groupées */}
              <div className="space-y-10">
                <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-950">
                    <Palette size={24} className="text-orange-600" /> 2. Palette Culturelle
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    {PALETTES.map((p) => (
                      <button key={p.name} onClick={() => setPalette(p.name)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${palette === p.name ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${p.color} border-2 border-black/10`} />
                          <div className="text-left">
                            <div className="font-black text-slate-950">{p.name}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{p.desc}</div>
                          </div>
                        </div>
                        {palette === p.name && <CheckCircle2 className="text-orange-600" size={24} />}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-10 rounded-[40px] shadow-2xl border-2 border-orange-50">
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-950">
                    <Layers size={24} className="text-orange-600" /> 3. Style de Rendu
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {STYLES.map((s) => (
                      <button key={s.name} onClick={() => setSelectedStyle(s.name)} className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all gap-2 text-center ${selectedStyle === s.name ? 'border-orange-500 bg-orange-50 text-orange-600 ring-4 ring-orange-100' : 'border-slate-50 bg-slate-50 hover:bg-slate-100 text-slate-400'}`}>
                        <div className={selectedStyle === s.name ? 'text-orange-600' : 'text-slate-600'}>{s.icon}</div>
                        <span className="font-black text-[11px] uppercase tracking-tighter text-slate-950">{s.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.category}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-16">
              {suggestions.length > 0 && (
                <section>
                  <h2 className="text-4xl font-black mb-10 text-slate-950 tracking-tighter">Icônes Identifiées</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suggestions.map((item, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-[36px] border-2 border-orange-50 shadow-xl flex justify-between items-center group hover:border-orange-400 transition-all">
                        <div className="flex-1 pr-4">
                          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{item.category}</p>
                          <h3 className="font-black text-2xl text-slate-950 mb-2">{item.name}</h3>
                          <p className="text-slate-500 text-xs italic font-medium leading-relaxed">Style : {selectedStyle}</p>
                        </div>
                        <button onClick={() => handleGenerateIcon(item)} disabled={isGenerating} className="shrink-0 bg-slate-950 text-white p-5 rounded-3xl hover:bg-orange-600 transition-all shadow-lg active:scale-90">
                          {isGenerating ? <RefreshCw className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-4xl font-black mb-10 text-slate-950 tracking-tighter">Aperçu Session</h2>
                {currentIcons.length === 0 ? (
                  <div className="bg-white border-4 border-dashed border-orange-100 rounded-[50px] h-96 flex flex-col items-center justify-center text-slate-300 gap-6">
                    <ImageIcon size={64} className="opacity-20" />
                    <p className="text-xl font-black text-slate-400 italic">Générez vos premières icônes...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                    {currentIcons.map((icon) => (
                      <div key={icon.id} className="group relative bg-white rounded-[50px] p-8 shadow-2xl border-2 border-orange-50 hover:border-orange-400 transition-all hover:-translate-y-2">
                        <div className="aspect-square bg-slate-50 rounded-[40px] overflow-hidden flex items-center justify-center">
                          <img src={icon.url} className="w-full h-full object-contain p-4" alt={icon.name} />
                        </div>
                        <button onClick={() => downloadImage(icon.url, icon.name)} className="absolute -top-4 -right-4 w-12 h-12 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-600 hover:text-white">
                          <Download size={20} />
                        </button>
                        <p className="mt-5 text-center text-sm font-black text-slate-950 uppercase tracking-tighter">{icon.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {viewMode === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-6xl font-black text-slate-950 mb-16 tracking-tighter">Votre Design Lab</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {projects.map((project) => (
                <div key={project.id} onClick={() => { setSelectedProject(project); setViewMode('project-detail'); }} className="group bg-white p-10 rounded-[60px] shadow-2xl border-2 border-transparent hover:border-orange-500 transition-all cursor-pointer relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex -space-x-5">
                      {project.icons.slice(0, 3).map((icon, i) => (
                        <div key={icon.id} className="w-16 h-16 rounded-3xl border-4 border-white bg-slate-50 shadow-xl overflow-hidden" style={{zIndex: 3-i}}>
                          <img src={icon.url} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-950 mb-4 group-hover:text-orange-600 transition-colors line-clamp-1">{project.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-600 tracking-widest">{project.style}</span>
                    <span className="px-4 py-1.5 bg-orange-100 rounded-full text-[10px] font-black uppercase text-orange-600 tracking-widest">{project.icons.length} Icônes</span>
                  </div>
                  <button onClick={(e) => deleteProject(project.id, e)} className="absolute top-8 right-8 p-3 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'project-detail' && selectedProject && (
          <div className="animate-in slide-in-from-right-10 duration-700">
            <button onClick={() => setViewMode('library')} className="flex items-center gap-3 text-slate-950 font-black mb-12 hover:text-orange-600 group transition-all">
              <div className="p-3 bg-white rounded-2xl shadow-lg group-hover:bg-orange-50"><ChevronLeft size={28} /></div>
              Retour Bibliothèque
            </button>
            
            <div className="bg-white rounded-[70px] p-16 shadow-2xl border-4 border-orange-50">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-6xl font-black text-slate-950 tracking-tighter leading-none">{selectedProject.name}</h2>
                    <span className={`px-6 py-2 rounded-full text-xs font-black text-white shadow-xl uppercase tracking-widest ${PALETTES.find(p => p.name === selectedProject.palette)?.color || 'bg-slate-950'}`}>{selectedProject.palette}</span>
                  </div>
                  <p className="text-2xl text-slate-500 font-bold italic leading-relaxed decoration-orange-300 underline underline-offset-8">"{selectedProject.description}"</p>
                </div>
                <button onClick={() => selectedProject.icons.forEach(i => downloadImage(i.url, i.name))} className="bg-slate-950 text-white px-10 py-6 rounded-[32px] font-black text-xl hover:bg-orange-600 transition-all shadow-2xl active:scale-95 flex items-center gap-3">
                  <Download size={28} /> Tout Télécharger
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12">
                {selectedProject.icons.map((icon) => (
                  <div key={icon.id} className="group relative">
                    <div className="aspect-square bg-slate-50 rounded-[50px] shadow-xl border-2 border-orange-50 p-10 transition-all hover:border-orange-400 hover:-translate-y-4 hover:shadow-orange-200">
                      <img src={icon.url} className="w-full h-full object-contain" alt={icon.name} />
                      <button onClick={() => downloadImage(icon.url, icon.name)} className="absolute -top-4 -right-4 w-14 h-14 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-600 hover:text-white">
                        <Download size={24} />
                      </button>
                    </div>
                    <p className="mt-6 text-center text-base font-black text-slate-950 uppercase tracking-tighter">{icon.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-32 py-20 border-t-2 border-orange-100 bg-white/90">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-600 rounded-[20px] flex items-center justify-center text-white shadow-xl"><Palette size={32} /></div>
            <span className="font-black text-3xl text-slate-950 tracking-tighter">AfriIcon Labs</span>
          </div>
          <p className="text-slate-950 font-black text-xl italic max-w-sm text-center md:text-left underline decoration-orange-500 decoration-4">Design system institutionnel africain propulsé par l'IA.</p>
          <div className="flex gap-10 font-black uppercase text-xs tracking-widest text-slate-950">
             <a href="#" className="hover:text-orange-600">Documentation</a>
             <a href="#" className="hover:text-orange-600">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
