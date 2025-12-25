import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CalendarHeatmapProps {
  data: { date: string; count: number }[];
  year: number;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data, year }) => {
  const { days, weeks } = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const dayMap = new Map(data.map(d => [d.date, d.count]));
    
    const daysArr: { date: Date; count: number; dateStr: string }[] = [];
    const currentDate = new Date(startDate);

    // Padding for start of year (if Jan 1 is not Sunday)
    const startDay = startDate.getDay(); // 0 = Sunday
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
    
    // Split into chunks of 7 for columns if needed, but CSS Grid handles this better with flow-col
    return { days: daysArr, weeks: Math.ceil(daysArr.length / 7) };
  }, [data, year]);

  const getColor = (count: number) => {
    if (count === -1) return 'transparent'; // Placeholder
    if (count === 0) return 'rgba(30, 41, 59, 0.5)'; // slate-800/50
    if (count === 1) return 'rgba(194, 65, 12, 0.4)'; // orange-700/40
    if (count === 2) return 'rgba(234, 88, 12, 0.6)'; // orange-600/60
    if (count === 3) return 'rgba(249, 115, 22, 0.8)'; // orange-500/80
    return 'rgba(251, 146, 60, 1)'; // orange-400 (4+ movies)
  };

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="min-w-[700px]">
        <div 
            className="grid gap-1"
            style={{ 
                gridTemplateRows: 'repeat(7, 1fr)', 
                gridAutoFlow: 'column',
                height: '140px'
            }}
        >
            {days.map((day, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.002, duration: 0.2 }}
                    className={`w-3 h-3 rounded-sm ${day.count >= 0 ? 'cursor-help' : ''}`}
                    style={{ backgroundColor: getColor(day.count) }}
                    title={day.count >= 0 ? `${day.dateStr}: ${day.count} film${day.count !== 1 ? 's' : ''}` : ''}
                />
            ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
            <span>Jan</span>
            <span>Apr</span>
            <span>Jul</span>
            <span>Oct</span>
            <span>Dec</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeatmap;