import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessedStats, PersonaResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, AreaChart, Area } from 'recharts';
import { generatePersona } from '../services/geminiService';
import { Play, Pause, ChevronRight, ChevronLeft, Share2, RotateCcw, Flame, Calendar, Trophy } from 'lucide-react';
import CalendarHeatmap from './CalendarHeatmap';

interface WrappedSlidesProps {
  stats: ProcessedStats;
  onReset: () => void;
}

const WrappedSlides: React.FC<WrappedSlidesProps> = ({ stats, onReset }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [persona, setPersona] = useState<PersonaResult | null>(null);
  const totalSlides = 6;

  useEffect(() => {
    // Fetch persona when mounting if not present, primarily for the last slide
    generatePersona(stats).then(setPersona);
  }, [stats]);

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  // Slide Components
  const SlideIntro = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="w-full"
      >
        <h2 className="text-xl md:text-2xl font-light text-orange-400 mb-4 tracking-widest uppercase">The Year In Review</h2>
        <h1 className="text-7xl md:text-9xl font-black text-slate-100 cinematic-text">{stats.year}</h1>
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-slate-400 text-lg md:text-xl max-w-md"
      >
        The lights dimmed. The projector whirred. Here is the story of what you watched.
      </motion.p>
    </div>
  );

  const SlideVolume = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <h3 className="text-2xl text-slate-300 mb-8 font-light">The Scale of It All</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-4xl">
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800"
            >
                <div className="text-6xl md:text-8xl font-black text-green-500 mb-2">{stats.totalWatched}</div>
                <div className="text-xl text-slate-400 uppercase tracking-wider font-semibold">Films Watched</div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800"
            >
                <div className="text-6xl md:text-8xl font-black text-orange-500 mb-2">{stats.totalRuntimeHours}</div>
                <div className="text-xl text-slate-400 uppercase tracking-wider font-semibold">Hours Spent</div>
            </motion.div>
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-slate-300"
        >
            <p className="text-lg">That's roughly <span className="font-bold text-white">{(stats.totalRuntimeHours / 24).toFixed(1)}</span> full days of cinema.</p>
        </motion.div>
    </div>
  );

  const SlideRhythm = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 w-full max-w-5xl mx-auto">
        <h3 className="text-3xl font-bold text-white mb-2 cinematic-text">Your Cinematic Rhythm</h3>
        <p className="text-slate-400 mb-6">Every day you watched a film is a pixel in your story.</p>

        {/* Heatmap Section */}
        <div className="w-full bg-slate-900/40 p-4 rounded-xl border border-slate-800 mb-8">
             <CalendarHeatmap data={stats.dailyActivity} year={stats.year} />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 w-full mb-8">
             <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 p-4 rounded-xl flex flex-col items-center text-center"
             >
                <Flame className="text-orange-500 mb-2" size={24} />
                <div className="text-2xl md:text-3xl font-bold text-white">{stats.longestStreak}</div>
                <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">Longest Streak</div>
             </motion.div>

             <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 p-4 rounded-xl flex flex-col items-center text-center"
             >
                <Trophy className="text-yellow-500 mb-2" size={24} />
                <div className="text-2xl md:text-3xl font-bold text-white">{stats.busiestDay.count}</div>
                <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">Single Day Record</div>
             </motion.div>

             <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-800/50 p-4 rounded-xl flex flex-col items-center text-center"
             >
                <Calendar className="text-green-500 mb-2" size={24} />
                <div className="text-xl md:text-2xl font-bold text-white leading-8 pt-1">{stats.topDayOfWeek.slice(0, 3)}</div>
                <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">Fav Day</div>
             </motion.div>
        </div>

        {/* Monthly Chart (Compact) */}
        <div className="w-full h-32 md:h-40">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyDistribution}>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {stats.monthlyDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.month === stats.topMonth ? '#f97316' : '#334155'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-slate-500 mt-2">Monthly Volume</div>
        </div>
    </div>
  );

  const SlideRatings = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 w-full max-w-5xl mx-auto">
         <h3 className="text-3xl font-bold text-white mb-2 cinematic-text">The Critic's Corner</h3>
         <div className="text-6xl font-black text-yellow-500 mb-2">{stats.averageRating}</div>
         <p className="text-slate-400 mb-8">Average Rating</p>

         <div className="w-full h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ratingDistribution}>
                    <XAxis dataKey="rating" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                    <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <p className="mt-6 text-slate-500 italic max-w-lg text-center">
            {stats.averageRating > 3.5 ? "You're quite generous with those stars!" : "A tough critic, hard to impress."}
        </p>
    </div>
  );

  const SlideFavorites = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 w-full max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold text-white mb-8 cinematic-text">Highest Rated</h3>
        <div className="space-y-4 w-full">
            {stats.topRatedFilms.map((film, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between bg-slate-800/40 p-4 rounded-xl border-l-4 border-green-500"
                >
                    <div>
                        <div className="text-lg md:text-xl font-bold text-white truncate max-w-[200px] md:max-w-md">{film.Name}</div>
                        <div className="text-slate-400 text-sm">{film.Year}</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-bold text-white">{film.Rating}</span>
                    </div>
                </motion.div>
            ))}
             {stats.topRatedFilms.length === 0 && <p className="text-slate-500">No rated films found.</p>}
        </div>
        <div className="mt-8 text-center text-slate-400">
            <span className="text-orange-400 font-bold">{stats.rewatchCount}</span> rewatches this year.
            <br/>
            Oldest habit: <span className="text-white italic">{stats.firstFilm}</span> to start the year.
        </div>
    </div>
  );

  const SlideIdentity = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-3xl mx-auto">
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-12 rounded-3xl border border-slate-700 shadow-2xl"
        >
            <div className="text-orange-500 font-bold tracking-widest uppercase mb-4">Your Persona</div>
            {persona ? (
                <>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 cinematic-text leading-tight">{persona.title}</h2>
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
                        {persona.description}
                    </p>
                </>
            ) : (
                 <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-64 bg-slate-700 rounded mb-4"></div>
                    <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
                    <p className="mt-4 text-sm text-slate-500">Consulting the cinema gods (Gemini)...</p>
                 </div>
            )}
        </motion.div>
        
        <button 
            onClick={onReset}
            className="mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
            <RotateCcw size={20} />
            Start Over
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

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
            >
                <CurrentSlideComponent />
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="h-20 flex items-center justify-between px-8 pb-4 z-40">
        <button 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            className={`p-3 rounded-full hover:bg-slate-800 transition-colors ${currentSlide === 0 ? 'opacity-0' : 'opacity-100'}`}
        >
            <ChevronLeft size={32} />
        </button>

        <div className="text-xs text-slate-600 font-mono">
            {currentSlide + 1} / {totalSlides}
        </div>

        <button 
            onClick={nextSlide} 
            disabled={currentSlide === totalSlides - 1}
            className={`p-3 rounded-full hover:bg-slate-800 transition-colors ${currentSlide === totalSlides - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default WrappedSlides;