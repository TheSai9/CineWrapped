import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessedStats, PersonaResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { generatePersona } from '../services/geminiService';
import { Play, Pause, ChevronRight, ChevronLeft, Share2, RotateCcw, Flame, Calendar, Trophy, Clock, Film } from 'lucide-react';
import CalendarHeatmap from './CalendarHeatmap';

interface WrappedSlidesProps {
  stats: ProcessedStats;
  onReset: () => void;
}

const WrappedSlides: React.FC<WrappedSlidesProps> = ({ stats, onReset }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [persona, setPersona] = useState<PersonaResult | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const totalSlides = 6;

  useEffect(() => {
    generatePersona(stats).then(setPersona);
  }, [stats]);

  useEffect(() => {
    // Scroll to top on slide change
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  // Slide Components
  const SlideIntro = () => (
    <div className="flex flex-col items-center justify-center min-h-full py-20 text-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="w-full"
      >
        <h2 className="text-xl md:text-2xl font-light text-orange-400 mb-4 tracking-widest uppercase">The Year In Review</h2>
        <h1 className="text-7xl md:text-9xl font-black text-slate-100 cinematic-text mb-8">{stats.year}</h1>
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-slate-400 text-lg md:text-xl max-w-md leading-relaxed"
      >
        The lights dimmed. The projector whirred. <br/> Here is the story of what you watched.
      </motion.p>
    </div>
  );

  const SlideVolume = () => (
    <div className="flex flex-col items-center justify-center min-h-full py-16 px-6 text-center w-full max-w-6xl mx-auto">
        <h3 className="text-3xl text-slate-300 mb-12 font-light">The Scale of It All</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center"
            >
                <div className="text-6xl md:text-8xl font-black text-green-500 mb-4">{stats.totalWatched}</div>
                <div className="text-xl text-slate-400 uppercase tracking-wider font-semibold">Films Watched</div>
                <div className="mt-4 text-sm text-slate-500">~{stats.moviesPerWeekAvg} per week</div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center"
            >
                <div className="text-6xl md:text-8xl font-black text-orange-500 mb-4">{stats.totalRuntimeHours}</div>
                <div className="text-xl text-slate-400 uppercase tracking-wider font-semibold">Hours Spent</div>
                <div className="mt-4 text-sm text-slate-500">{(stats.totalRuntimeHours / 24).toFixed(1)} full days</div>
            </motion.div>
        </div>

        {/* Eras Chart */}
        <div className="w-full bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50">
            <h4 className="text-xl text-white mb-6 cinematic-text text-left pl-2 border-l-4 border-purple-500">Eras Watched</h4>
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.decadeDistribution}>
                        <XAxis dataKey="decade" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]}>
                             {stats.decadeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fillOpacity={0.6 + (index / stats.decadeDistribution.length) * 0.4} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );

  const SlideRhythm = () => (
    <div className="flex flex-col items-center min-h-full py-16 px-4 w-full max-w-5xl mx-auto">
        <h3 className="text-3xl font-bold text-white mb-2 cinematic-text">Your Cinematic Rhythm</h3>
        <p className="text-slate-400 mb-8 text-center max-w-lg">Every day you watched a film is a pixel in your story. <br/> Scroll down to see your patterns.</p>

        {/* Heatmap Section */}
        <div className="w-full bg-slate-900/40 p-4 rounded-xl border border-slate-800 mb-8 overflow-hidden">
             <div className="flex items-center gap-2 mb-4 text-slate-300">
                <Calendar size={18} className="text-orange-400" />
                <span className="font-semibold text-sm uppercase tracking-wide">Daily Activity</span>
             </div>
             <CalendarHeatmap data={stats.dailyActivity} year={stats.year} />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/40 p-6 rounded-xl flex flex-col items-center text-center border border-slate-700/50"
             >
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
                    <Flame className="text-orange-500" size={24} />
                </div>
                <div className="text-3xl font-black text-white">{stats.longestStreak}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide font-bold mt-1">Longest Streak</div>
             </motion.div>

             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/40 p-6 rounded-xl flex flex-col items-center text-center border border-slate-700/50"
             >
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3">
                     <Trophy className="text-yellow-500" size={24} />
                </div>
                <div className="text-3xl font-black text-white">{stats.busiestDay.count}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide font-bold mt-1">Movies in 1 Day</div>
                <div className="text-[10px] text-slate-500 mt-1">{stats.busiestDay.date}</div>
             </motion.div>

             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/40 p-6 rounded-xl flex flex-col items-center text-center border border-slate-700/50"
             >
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                    <Clock className="text-green-500" size={24} />
                </div>
                <div className="text-2xl font-black text-white pt-1">{stats.topDayOfWeek}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide font-bold mt-1">Favorite Day</div>
             </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Monthly Chart */}
            <div className="w-full bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50">
                 <h4 className="text-sm uppercase tracking-widest text-slate-400 mb-6 font-bold">Monthly Volume</h4>
                <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.monthlyDistribution}>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                {stats.monthlyDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.month === stats.topMonth ? '#f97316' : '#475569'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Weekly Breakdown */}
             <div className="w-full bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50">
                <h4 className="text-sm uppercase tracking-widest text-slate-400 mb-6 font-bold">Weekly Rituals</h4>
                <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.dayOfWeekDistribution}>
                            <XAxis dataKey="day" hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                cursor={{fill: 'transparent'}}
                                labelFormatter={(value) => value}
                            />
                             <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                                {stats.dayOfWeekDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.day === stats.topDayOfWeek ? '#22c55e' : '#334155'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                     <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-2 uppercase font-mono">
                        {stats.dayOfWeekDistribution.map(d => <span key={d.day}>{d.day.substring(0,3)}</span>)}
                    </div>
                </div>
            </div>
        </div>
        <div className="h-12"></div> {/* Spacer for scroll */}
    </div>
  );

  const SlideRatings = () => (
    <div className="flex flex-col items-center min-h-full py-16 px-6 w-full max-w-5xl mx-auto">
         <h3 className="text-3xl font-bold text-white mb-8 cinematic-text">The Critic's Corner</h3>
         
         <div className="flex flex-col md:flex-row items-center gap-12 w-full mb-12">
             <div className="flex-1 text-center md:text-right">
                <div className="text-8xl font-black text-yellow-500 mb-2 drop-shadow-lg shadow-yellow-500/20">{stats.averageRating}</div>
                <p className="text-slate-400 uppercase tracking-widest text-sm">Average Rating</p>
             </div>
             
             <div className="w-px h-32 bg-slate-800 hidden md:block"></div>

             <div className="flex-1 text-center md:text-left">
                 <p className="text-xl text-slate-200 italic font-serif leading-relaxed max-w-xs mx-auto md:mx-0">
                    "{stats.averageRating > 3.5 ? "A generous spirit who finds joy in the moving image." : stats.averageRating > 2.8 ? "Balanced and fair, respecting the craft." : "A discerning eye that demands perfection."}"
                 </p>
             </div>
         </div>

         <div className="w-full h-72 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ratingDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="rating" stroke="#94a3b8" fontSize={14} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                    <Bar dataKey="count" fill="#eab308" radius={[6, 6, 0, 0]} animationDuration={1500}>
                         {stats.ratingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fillOpacity={0.7 + (parseFloat(entry.rating)/5) * 0.3} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );

  const SlideFavorites = () => (
    <div className="flex flex-col items-center min-h-full py-16 px-4 w-full max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold text-white mb-10 cinematic-text">Highest Rated</h3>
        <div className="space-y-4 w-full mb-12">
            {stats.topRatedFilms.map((film, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 p-5 rounded-xl border-l-4 border-green-500 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="text-slate-500 font-mono text-sm w-6">#{idx + 1}</div>
                        <div>
                            <div className="text-lg md:text-xl font-bold text-white group-hover:text-green-400 transition-colors">{film.Name}</div>
                            <div className="text-slate-400 text-sm">{film.Year}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1 rounded-lg">
                        <span className="text-yellow-500">★</span>
                        <span className="font-bold text-white">{film.Rating}</span>
                    </div>
                </motion.div>
            ))}
             {stats.topRatedFilms.length === 0 && <p className="text-slate-500">No rated films found.</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 text-center">
                 <div className="text-3xl font-bold text-orange-500 mb-1">{stats.rewatchCount}</div>
                 <div className="text-xs text-slate-400 uppercase">Rewatches</div>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 text-center">
                 <div className="text-3xl font-bold text-purple-500 mb-1">{stats.uniqueFilmsCount}</div>
                 <div className="text-xs text-slate-400 uppercase">New Discoveries</div>
            </div>
        </div>

         <div className="mt-8 text-center text-slate-500 text-sm">
            Bookends: <span className="text-slate-300">{stats.firstFilm}</span> (Jan 1) → <span className="text-slate-300">{stats.lastFilm}</span> (Dec 31)
        </div>
    </div>
  );

  const SlideIdentity = () => (
    <div className="flex flex-col items-center justify-center min-h-full py-16 px-6 text-center max-w-3xl mx-auto">
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-12 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden"
        >
             {/* Decorative element */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="text-orange-500 font-bold tracking-widest uppercase mb-6 flex items-center justify-center gap-2">
                <Film size={20} />
                Your Persona
            </div>
            {persona ? (
                <>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 cinematic-text leading-tight">{persona.title}</h2>
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light italic">
                        "{persona.description}"
                    </p>
                </>
            ) : (
                 <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-64 bg-slate-700 rounded mb-4"></div>
                    <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
                    <p className="mt-6 text-sm text-slate-500 font-mono">Gemini is analyzing your taste...</p>
                 </div>
            )}
        </motion.div>
        
        <button 
            onClick={onReset}
            className="mt-12 flex items-center gap-3 px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-200 hover:text-white transition-all font-semibold"
        >
            <RotateCcw size={18} />
            Generate Another
        </button>
    </div>
  );

  const slides = [SlideIntro, SlideVolume, SlideRhythm, SlideRatings, SlideFavorites, SlideIdentity];
  const CurrentSlideComponent = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-900 z-50 flex gap-1 p-2">
        {slides.map((_, idx) => (
            <div 
                key={idx} 
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx <= currentSlide ? 'bg-orange-500' : 'bg-slate-800'}`}
            />
        ))}
      </div>

      {/* Main Content Area - Scrollable */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth"
      >
        <AnimatePresence mode="wait">
            <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full min-h-full"
            >
                <CurrentSlideComponent />
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="h-20 flex items-center justify-between px-8 pb-4 z-40 bg-gradient-to-t from-slate-950 to-transparent absolute bottom-0 w-full pointer-events-none">
        <button 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            className={`pointer-events-auto p-3 rounded-full hover:bg-slate-800/80 backdrop-blur-sm transition-colors ${currentSlide === 0 ? 'opacity-0' : 'opacity-100'}`}
        >
            <ChevronLeft size={32} />
        </button>

        <div className="text-xs text-slate-500 font-mono pointer-events-auto">
            {currentSlide + 1} / {totalSlides}
        </div>

        <button 
            onClick={nextSlide} 
            disabled={currentSlide === totalSlides - 1}
            className={`pointer-events-auto p-3 rounded-full hover:bg-slate-800/80 backdrop-blur-sm transition-colors ${currentSlide === totalSlides - 1 ? 'opacity-0' : 'opacity-100'}`}
        >
            <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default WrappedSlides;