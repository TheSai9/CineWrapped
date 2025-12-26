import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessedStats, PersonaResult } from '../types';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell, LabelList } from 'recharts';
import { generatePersona } from '../services/geminiService';
import { ChevronRight, ChevronLeft, RotateCcw, Flame, Trophy, Clock, Star } from 'lucide-react';
import CalendarHeatmap from './CalendarHeatmap';

interface WrappedSlidesProps {
  stats: ProcessedStats;
  onReset: () => void;
}

// Custom Bauhaus Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-bauhaus-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3">
        <p className="font-black text-bauhaus-black text-xs uppercase tracking-widest mb-1">{label}</p>
        <p className="text-bauhaus-red font-black text-2xl leading-none">
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const WrappedSlides: React.FC<WrappedSlidesProps> = ({ stats, onReset }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [persona, setPersona] = useState<PersonaResult | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const totalSlides = 6;

  useEffect(() => {
    generatePersona(stats).then(setPersona);
  }, [stats]);

  useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  // --- SLIDE 1: INTRO (Red Background) ---
  const SlideIntro = () => (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 bg-bauhaus-red text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-bauhaus-black rounded-bl-full opacity-20 md:opacity-100"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-bauhaus-blue rounded-tr-full border-t-4 border-r-4 border-white opacity-20 md:opacity-100"></div>
      
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 text-center border-4 border-black bg-white text-bauhaus-black p-8 md:p-16 shadow-hard-lg max-w-2xl w-full mx-4"
      >
        <div className="border-b-4 border-black pb-4 mb-6">
            <h2 className="text-sm md:text-xl font-bold uppercase tracking-[0.3em]">Year in Review</h2>
        </div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-2 leading-none">{stats.year}</h1>
        <div className="flex justify-center gap-4 mt-8">
            <div className="w-4 h-4 bg-bauhaus-red rounded-full border-2 border-black"></div>
            <div className="w-4 h-4 bg-bauhaus-blue border-2 border-black"></div>
            <div className="w-4 h-4 bg-bauhaus-yellow rotate-45 border-2 border-black"></div>
        </div>
      </motion.div>
    </div>
  );

  // --- SLIDE 2: VOLUME (Yellow Background) ---
  const SlideVolume = () => (
    <div className="flex flex-col min-h-full py-12 px-4 md:px-8 bg-bauhaus-yellow text-bauhaus-black">
        <div className="max-w-6xl mx-auto w-full h-full flex flex-col justify-center">
            <h3 className="text-4xl md:text-6xl font-black uppercase mb-8 md:mb-12 border-b-4 border-black pb-4">Volume Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-16">
                {/* Total Watched */}
                <div className="bg-white border-4 border-black p-6 md:p-8 shadow-hard-md relative hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute top-4 right-4 w-6 h-6 md:w-8 md:h-8 bg-bauhaus-red rounded-full border-2 border-black"></div>
                    <div className="text-6xl md:text-8xl font-black text-bauhaus-blue mb-2 leading-none">{stats.totalWatched}</div>
                    <div className="text-sm md:text-xl font-bold uppercase tracking-widest border-t-4 border-black pt-2 mt-2">Films Watched</div>
                </div>

                {/* Total Hours */}
                <div className="bg-white border-4 border-black p-6 md:p-8 shadow-hard-md relative hover:-translate-y-1 transition-transform duration-300">
                     <div className="absolute top-4 right-4 w-6 h-6 md:w-8 md:h-8 bg-bauhaus-blue rotate-45 border-2 border-black"></div>
                    <div className="text-6xl md:text-8xl font-black text-bauhaus-red mb-2 leading-none">{stats.totalRuntimeHours}</div>
                    <div className="text-sm md:text-xl font-bold uppercase tracking-widest border-t-4 border-black pt-2 mt-2">Hours Spent</div>
                </div>
            </div>

            {/* Eras Chart */}
            <div className="bg-bauhaus-bg border-4 border-black p-6 md:p-8 shadow-hard-md flex-1 min-h-[300px] flex flex-col">
                <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-2">
                    <div className="w-3 h-3 bg-black"></div>
                    <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight">Eras Distribution</h4>
                </div>
                <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.decadeDistribution} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                            <XAxis 
                                dataKey="decade" 
                                tick={{fill: '#121212', fontWeight: 800, fontSize: 12, fontFamily: 'Outfit'}} 
                                axisLine={{stroke: '#121212', strokeWidth: 3}} 
                                tickLine={false} 
                                dy={10}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                            <Bar dataKey="count" fill="#121212" radius={0} animationDuration={1000}>
                                <LabelList dataKey="count" position="top" style={{ fill: '#121212', fontWeight: 900, fontSize: '14px', fontFamily: 'Outfit' }} offset={10} />
                                {stats.decadeDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1040C0' : '#D02020'} stroke="#121212" strokeWidth={2} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );

  // --- SLIDE 3: RHYTHM (White Background) ---
  const SlideRhythm = () => (
    <div className="flex flex-col min-h-full py-12 px-4 md:px-8 bg-white text-bauhaus-black">
        <div className="max-w-5xl mx-auto w-full">
            <h3 className="text-4xl md:text-6xl font-black uppercase mb-8">Rhythm &<br/><span className="text-bauhaus-red">Patterns</span></h3>

            {/* Heatmap Section */}
            <div className="border-4 border-black p-4 md:p-6 mb-8 shadow-hard-md bg-white">
                 <div className="flex items-center justify-between mb-4">
                    <span className="font-bold uppercase bg-bauhaus-yellow px-2 border-2 border-black text-sm">Daily Activity</span>
                 </div>
                 <CalendarHeatmap data={stats.dailyActivity} year={stats.year} />
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full mb-8">
                 <div className="bg-bauhaus-bg border-4 border-black p-4 md:p-6 shadow-hard-sm hover:shadow-hard-md transition-shadow">
                    <Flame className="w-8 h-8 md:w-10 md:h-10 text-bauhaus-red mb-2" strokeWidth={2.5} />
                    <div className="text-4xl md:text-5xl font-black">{stats.longestStreak}</div>
                    <div className="text-xs md:text-sm font-bold uppercase mt-1">Day Streak</div>
                 </div>

                 <div className="bg-bauhaus-bg border-4 border-black p-4 md:p-6 shadow-hard-sm hover:shadow-hard-md transition-shadow">
                    <Trophy className="w-8 h-8 md:w-10 md:h-10 text-bauhaus-yellow fill-current mb-2 text-black stroke-black" strokeWidth={2} />
                    <div className="text-4xl md:text-5xl font-black">{stats.busiestDay.count}</div>
                    <div className="text-xs md:text-sm font-bold uppercase mt-1">Max in 1 Day</div>
                 </div>

                 <div className="bg-bauhaus-bg border-4 border-black p-4 md:p-6 shadow-hard-sm hover:shadow-hard-md transition-shadow">
                    <Clock className="w-8 h-8 md:w-10 md:h-10 text-bauhaus-blue mb-2" strokeWidth={2.5} />
                    <div className="text-3xl md:text-4xl font-black pt-1 md:pt-2">{stats.topDayOfWeek.substring(0,3)}</div>
                    <div className="text-xs md:text-sm font-bold uppercase mt-1">Fav Day</div>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Monthly Chart */}
                <div className="border-4 border-black p-4 md:p-6">
                     <h4 className="text-sm md:text-lg font-black uppercase mb-4 bg-bauhaus-blue text-white inline-block px-2">Monthly</h4>
                    <div className="w-full h-32 md:h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyDistribution} margin={{top: 15, right: 5, left: 5, bottom: 0}}>
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" stroke="#121212" strokeWidth={2} animationDuration={1000}>
                                    <LabelList dataKey="count" position="top" style={{ fill: '#121212', fontWeight: 800, fontSize: '10px' }} />
                                    {stats.monthlyDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.month === stats.topMonth ? '#F0C020' : '#E0E0E0'} />
                                    ))}
                                </Bar>
                                <XAxis dataKey="month" tick={{fontSize: 10, fontWeight: 700}} interval={0} tickLine={false} axisLine={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Breakdown */}
                 <div className="border-4 border-black p-4 md:p-6">
                    <h4 className="text-sm md:text-lg font-black uppercase mb-4 bg-bauhaus-red text-white inline-block px-2">Weekly</h4>
                    <div className="w-full h-32 md:h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.dayOfWeekDistribution} margin={{top: 15, right: 5, left: 5, bottom: 0}}>
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                 <Bar dataKey="count" stroke="#121212" strokeWidth={2} animationDuration={1000}>
                                    <LabelList dataKey="count" position="top" style={{ fill: '#121212', fontWeight: 800, fontSize: '10px' }} />
                                    {stats.dayOfWeekDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.day === stats.topDayOfWeek ? '#1040C0' : '#E0E0E0'} />
                                    ))}
                                </Bar>
                                <XAxis dataKey="day" tickFormatter={(val) => val.substring(0,1)} tick={{fontSize: 10, fontWeight: 700}} tickLine={false} axisLine={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="h-20"></div>
        </div>
    </div>
  );

  // --- SLIDE 4: RATINGS (Blue Background) ---
  const SlideRatings = () => (
    <div className="flex flex-col min-h-full py-12 px-4 md:px-6 bg-bauhaus-blue text-white">
         <div className="max-w-5xl mx-auto w-full h-full flex flex-col justify-center">
            <h3 className="text-5xl md:text-6xl font-black uppercase mb-8 md:mb-12 text-center md:text-left leading-none">Critical<br/>Analysis</h3>
         
             <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full mb-8 md:mb-16 bg-white text-black border-4 border-black p-6 md:p-8 shadow-hard-lg">
                 <div className="flex-1 text-center border-b-4 md:border-b-0 md:border-r-4 border-black pb-6 md:pb-0 md:pr-6">
                    <div className="text-7xl md:text-9xl font-black text-bauhaus-red leading-none">{stats.averageRating}</div>
                    <p className="font-bold uppercase tracking-widest text-sm md:text-lg bg-black text-white inline-block px-2 mt-2">Average</p>
                 </div>
                 
                 <div className="flex-1 text-center md:text-left">
                     <p className="text-xl md:text-3xl font-bold leading-tight uppercase">
                        "{stats.averageRating > 3.5 ? "Generous & Enthusiastic." : stats.averageRating > 2.8 ? "Balanced & Fair." : "Strict & Exacting."}"
                     </p>
                 </div>
             </div>

             <div className="w-full h-64 md:h-80 bg-bauhaus-yellow p-4 md:p-8 border-4 border-black shadow-hard-md">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.ratingDistribution} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <XAxis 
                            dataKey="rating" 
                            tick={{fill: '#121212', fontWeight: 900, fontSize: 14}} 
                            axisLine={{stroke: '#121212', strokeWidth: 4}} 
                            tickLine={false} 
                            dy={10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Bar dataKey="count" fill="#fff" stroke="#121212" strokeWidth={2} radius={0} animationDuration={1000}>
                             <LabelList dataKey="count" position="top" style={{ fill: '#121212', fontWeight: 900, fontSize: '14px' }} offset={10} />
                             {stats.ratingDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={parseFloat(entry.rating) >= 4 ? '#D02020' : '#FFFFFF'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );

  // --- SLIDE 5: FAVORITES (White Background) ---
  const SlideFavorites = () => (
    <div className="flex flex-col min-h-full py-12 px-4 md:px-8 bg-white text-bauhaus-black">
        <div className="max-w-4xl mx-auto w-full">
            <h3 className="text-4xl md:text-6xl font-black uppercase mb-8 md:mb-12 border-l-8 border-bauhaus-yellow pl-4">Highest<br/>Rated</h3>
            
            <div className="space-y-4 md:space-y-6 w-full mb-8 md:mb-16">
                {stats.topRatedFilms.map((film, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between bg-white border-2 border-black p-3 md:p-4 shadow-hard-sm hover:-translate-y-1 transition-transform"
                    >
                        <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                            <div className="font-black text-xl md:text-2xl w-8 h-8 md:w-10 md:h-10 bg-bauhaus-black text-white flex-shrink-0 flex items-center justify-center rounded-none">{idx + 1}</div>
                            <div className="min-w-0">
                                <div className="text-lg md:text-2xl font-bold uppercase leading-none mb-1 truncate">{film.Name}</div>
                                <div className="text-xs md:text-sm font-bold text-gray-500">{film.Year}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-bauhaus-blue text-white px-2 md:px-3 py-1 border-2 border-black flex-shrink-0">
                            <Star size={14} fill="white" />
                            <span className="font-bold text-sm md:text-base">{film.Rating}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="bg-bauhaus-red text-white p-4 md:p-6 border-4 border-black text-center shadow-hard-md">
                     <div className="text-4xl md:text-6xl font-black mb-1 md:mb-2">{stats.rewatchCount}</div>
                     <div className="font-bold uppercase tracking-widest text-xs md:text-base">Rewatches</div>
                </div>
                <div className="bg-bauhaus-blue text-white p-4 md:p-6 border-4 border-black text-center shadow-hard-md">
                     <div className="text-4xl md:text-6xl font-black mb-1 md:mb-2">{stats.uniqueFilmsCount}</div>
                     <div className="font-bold uppercase tracking-widest text-xs md:text-base">New Films</div>
                </div>
            </div>
            
            <div className="mt-8 md:mt-12 pt-8 border-t-4 border-black text-center text-sm md:text-base">
                <span className="font-bold uppercase">First:</span> <span className="font-medium">{stats.firstFilm}</span> <span className="mx-2 text-bauhaus-red font-black">///</span> <span className="font-bold uppercase">Last:</span> <span className="font-medium">{stats.lastFilm}</span>
            </div>
        </div>
    </div>
  );

  // --- SLIDE 6: IDENTITY (Yellow Background) ---
  const SlideIdentity = () => (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 md:px-6 bg-bauhaus-yellow text-bauhaus-black relative overflow-hidden">
        {/* Poster Design Layout */}
        <div className="max-w-3xl w-full border-4 border-black bg-white p-6 md:p-12 shadow-hard-lg relative z-10">
            {/* Top Decoration */}
            <div className="flex justify-between items-start mb-6 md:mb-8 border-b-4 border-black pb-4 md:pb-8">
                <div className="flex gap-2">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-bauhaus-red border-2 border-black rounded-full"></div>
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-bauhaus-blue border-2 border-black"></div>
                </div>
                <div className="text-right">
                   <div className="font-black uppercase text-lg md:text-xl tracking-tighter">Persona</div>
                   <div className="text-xs md:text-sm font-bold">Analysis Module</div>
                </div>
            </div>

            {persona ? (
                <div className="text-center">
                    <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] mb-6 md:mb-8 text-bauhaus-black break-words">
                        {persona.title}
                    </h2>
                    <div className="w-16 md:w-24 h-2 bg-bauhaus-black mx-auto mb-6 md:mb-8"></div>
                    <p className="text-lg md:text-2xl font-bold uppercase leading-relaxed max-w-2xl mx-auto">
                        "{persona.description}"
                    </p>
                </div>
            ) : (
                 <div className="animate-pulse flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-t-bauhaus-red border-r-bauhaus-blue border-b-bauhaus-yellow border-l-black rounded-full animate-spin mb-4"></div>
                    <p className="font-bold uppercase">Constructing Persona...</p>
                 </div>
            )}
            
            {/* Bottom Decoration */}
            <div className="mt-8 md:mt-12 pt-8 border-t-4 border-black flex justify-center">
                <button 
                    onClick={onReset}
                    className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-bauhaus-black text-white font-black uppercase tracking-widest hover:bg-bauhaus-red transition-colors border-2 border-transparent hover:border-black shadow-hard-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 text-sm md:text-base"
                >
                    <RotateCcw size={18} />
                    Reset
                </button>
            </div>
        </div>
        
        {/* Background shapes */}
        <div className="absolute top-10 left-10 w-24 h-24 md:w-32 md:h-32 bg-bauhaus-blue border-4 border-black rounded-full opacity-50 md:opacity-100"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-bauhaus-red border-4 border-black rotate-12 opacity-50 md:opacity-100"></div>
    </div>
  );

  const slides = [SlideIntro, SlideVolume, SlideRhythm, SlideRatings, SlideFavorites, SlideIdentity];
  const CurrentSlideComponent = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-bauhaus-bg text-bauhaus-fg flex flex-col font-sans">
      
      {/* Progress Bar */}
      <div className="h-2 md:h-4 w-full flex border-b-4 border-black bg-white">
        {slides.map((_, idx) => (
            <div 
                key={idx} 
                className={`h-full flex-1 border-r border-black transition-all duration-300 ${idx <= currentSlide ? 'bg-bauhaus-red' : 'bg-transparent'}`}
            />
        ))}
      </div>

      {/* Main Scrollable Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar bg-white"
      >
        <AnimatePresence mode="wait">
            <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full min-h-full"
            >
                <CurrentSlideComponent />
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-white border-t-4 border-black z-50">
        <button 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            className={`p-2 md:p-3 border-2 border-black bg-white shadow-hard-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <ChevronLeft size={20} strokeWidth={3} />
        </button>

        <div className="text-lg md:text-xl font-black">
            {currentSlide + 1} <span className="text-gray-300 mx-1">/</span> {totalSlides}
        </div>

        <button 
            onClick={nextSlide} 
            disabled={currentSlide === totalSlides - 1}
            className={`p-2 md:p-3 border-2 border-black bg-bauhaus-yellow shadow-hard-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all ${currentSlide === totalSlides - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <ChevronRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default WrappedSlides;