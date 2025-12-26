import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CalendarHeatmapProps {
  data: { date: string; count: number }[];
  year: number;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data, year }) => {
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

  const getColor = (count: number) => {
    if (count === -1) return 'transparent'; 
    if (count === 0) return '#E0E0E0'; // Muted gray
    if (count === 1) return '#F0C020'; // Yellow
    if (count === 2) return '#D02020'; // Red
    if (count >= 3) return '#1040C0';  // Blue
    return '#E0E0E0';
  };

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
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
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.0005 }}
                    className={`w-3 h-3 ${day.count >= 0 ? 'hover:ring-2 hover:ring-black relative z-10' : ''}`}
                    style={{ backgroundColor: getColor(day.count) }}
                    title={day.count >= 0 ? `${day.dateStr}: ${day.count} films` : ''}
                />
            ))}
        </div>
        {/* Month Labels aligned to grid estimation */}
        <div className="flex text-[10px] font-black uppercase tracking-widest mt-2 border-t-2 border-bauhaus-black pt-1 gap-12 text-gray-400">
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
      </div>
    </div>
  );
};

export default CalendarHeatmap;