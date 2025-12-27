
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyEntryDetail } from '../types';
import { getMoviePoster } from '../services/tmdbService';
import { Star, Film, ChevronDown, ChevronUp } from 'lucide-react';

interface CalendarHeatmapProps {
  data: { date: string; count: number }[];
  entries: Record<string, DailyEntryDetail[]>;
  year: number;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data, year, entries }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [posters, setPosters] = useState<Record<string, string>>({});
  
  // Calculate max count for gradient
  const maxCount = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map(d => d.count));
  }, [data]);

  const { days } = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const dayMap = new Map(data.map(d => [d.date, d.count]));
    
    const daysArr: { date: Date; count: number; dateStr: string }[] = [];
    const currentDate = new Date(startDate);

    // Padding for start of year
    const startDay = startDate.getDay(); 
    for (let i = 0; i < startDay; i++) {
        daysArr.push({ date: new Date(year, 0, 0), count: -1, dateStr: 'placeholder' });
    }

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      daysArr.push({
        date: new Date(currentDate),
        count: dayMap.get(dateStr) || 0,
        dateStr
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return { days: daysArr };
  }, [data, year]);

  // Fetch posters when a date is selected
  useEffect(() => {
    if (!selectedDate || !entries[selectedDate]) return;

    const fetchSelectedPosters = async () => {
        const newPosters: Record<string, string> = {};
        const movies = entries[selectedDate];
        
        for (const movie of movies) {
            if (!posters[movie.name]) {
                const url = await getMoviePoster(movie.name, movie.year);
                if (url) newPosters[movie.name] = url;
            }
        }
        
        if (Object.keys(newPosters).length > 0) {
            setPosters(prev => ({ ...prev, ...newPosters }));
        }
    };
    
    fetchSelectedPosters();
  }, [selectedDate, entries, posters]);

  // Drastic, Distinct Color Logic (Hue shifting)
  const getColor = (count: number) => {
    if (count === -1) return 'transparent'; 
    if (count === 0) return '#E0E0E0'; // Muted gray base
    
    // Normalized intensity 0 to 1
    const intensity = maxCount > 1 ? count / maxCount : 1;

    // Drastic Hue Shifts: Yellow -> Orange -> Red -> Purple -> Blue
    // Using solid, distinct colors for maximum "Pop"
    if (intensity <= 0.15) return '#F0C020'; // Bauhaus Yellow
    if (intensity <= 0.35) return '#F26522'; // Vibrant Orange
    if (intensity <= 0.55) return '#D02020'; // Bauhaus Red
    if (intensity <= 0.80) return '#6D28D9'; // Deep Purple
    return '#1040C0'; // Bauhaus Blue
  };

  const selectedMovies = selectedDate ? entries[selectedDate] : [];

  return (
    <div className="flex flex-col">
        <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
            <div className="min-w-[700px]">
                <div 
                    className="grid gap-[2px]"
                    style={{ 
                        gridTemplateRows: 'repeat(7, 1fr)', 
                        gridAutoFlow: 'column',
                        height: '100px'
                    }}
                >
                    {days.map((day, idx) => (
                        <motion.div
                            key={idx}
                            onClick={() => day.count >= 0 && setSelectedDate(selectedDate === day.dateStr ? null : day.dateStr)}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.0005 }}
                            className={`w-3 h-3 cursor-pointer transition-transform ${
                                day.count >= 0 ? 'hover:scale-125 hover:z-20' : ''
                            } ${selectedDate === day.dateStr ? 'ring-2 ring-black z-30 scale-125' : ''}`}
                            style={{ backgroundColor: getColor(day.count) }}
                            title={day.count >= 0 ? `${day.dateStr}: ${day.count} films` : ''}
                        />
                    ))}
                </div>
                
                {/* Footer: Months and Legend */}
                <div className="flex flex-col gap-2 mt-2 border-t-2 border-bauhaus-black pt-2">
                    {/* Month Labels */}
                    <div className="flex text-[10px] font-black uppercase tracking-widest gap-12 text-gray-400">
                        <span className="text-black">Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                        <span>Oct</span>
                        <span>Nov</span>
                        <span>Dec</span>
                    </div>

                    {/* Color Key / Legend */}
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider">
                        <span>Intensity:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400 mr-1">Less</span>
                            <div className="w-3 h-3 bg-[#E0E0E0] border border-gray-300" title="0 Films"></div>
                            <div className="w-3 h-3 bg-[#F0C020]" title="Low"></div>
                            <div className="w-3 h-3 bg-[#F26522]" title="Med-Low"></div>
                            <div className="w-3 h-3 bg-[#D02020]" title="Medium"></div>
                            <div className="w-3 h-3 bg-[#6D28D9]" title="Med-High"></div>
                            <div className="w-3 h-3 bg-[#1040C0]" title="High"></div>
                            <span className="text-bauhaus-black ml-1">More</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Selected Date Details Panel */}
        <AnimatePresence>
            {selectedDate && selectedMovies && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-bauhaus-bg border-t-4 border-bauhaus-black mt-2 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-black uppercase text-lg">
                                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h4>
                            <button onClick={() => setSelectedDate(null)} className="text-xs font-bold uppercase hover:text-bauhaus-red">Close</button>
                        </div>

                        {selectedMovies.length === 0 ? (
                            <div className="text-gray-500 font-bold text-sm">No films logged on this day.</div>
                        ) : (
                            <div className="space-y-3">
                                {selectedMovies.map((movie, idx) => (
                                    <div key={idx} className="flex gap-4 bg-white p-2 border-2 border-bauhaus-black shadow-hard-sm">
                                        {/* Poster */}
                                        <div className="w-12 h-16 bg-gray-200 border border-black flex-shrink-0">
                                            {posters[movie.name] ? (
                                                <img src={posters[movie.name]} alt={movie.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Film size={16} />
                                                </div>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="flex flex-col justify-center">
                                            <div className="font-bold text-sm uppercase leading-tight">{movie.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="text-xs bg-bauhaus-yellow px-1 border border-black font-bold">{movie.year}</div>
                                                {movie.rating && (
                                                    <div className="flex items-center gap-1 text-xs font-bold text-bauhaus-blue">
                                                        <Star size={10} fill="currentColor" />
                                                        {movie.rating}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default CalendarHeatmap;
