import React from 'react';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const TimetableGrid = ({ slots = [] }) => {
    // 1. DYNAMIC TIME SCANNER
    const timeTics = new Set(["09:00", "13:00", "14:00", "18:00"]);
    slots.forEach(s => {
        if (s.startTime) timeTics.add(s.startTime.substring(0, 5));
        if (s.endTime) timeTics.add(s.endTime.substring(0, 5));
    });

    const sortedTics = Array.from(timeTics).sort((a, b) => {
        const [h1, m1] = a.split(':').map(Number);
        const [h2, m2] = b.split(':').map(Number);
        return (h1 * 60 + m1) - (h2 * 60 + m2);
    });

    const segments = [];
    for (let i = 0; i < sortedTics.length - 1; i++) {
        segments.push({
            start: sortedTics[i],
            end: sortedTics[i + 1],
            key: `${sortedTics[i]}-${sortedTics[i + 1]}`
        });
    }

    const grid = {};
    DAYS.forEach(day => {
        grid[day] = {};
        segments.forEach(seg => {
            grid[day][seg.key] = { slot: null, isCovered: false };
        });
    });

    slots.forEach(slot => {
        if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) return;
        const day = slot.dayOfWeek.trim().toUpperCase();
        if (!grid[day]) return;

        const sTime = slot.startTime.substring(0, 5);
        const eTime = slot.endTime.substring(0, 5);

        const coveredSegments = segments.filter(seg => {
            return seg.start >= sTime && seg.end <= eTime;
        });

        if (coveredSegments.length > 0) {
            const firstSegKey = coveredSegments[0].key;
            grid[day][firstSegKey].slot = {
                ...slot,
                rowSpan: coveredSegments.length
            };

            for (let i = 1; i < coveredSegments.length; i++) {
                grid[day][coveredSegments[i].key].isCovered = true;
            }
        }
    });

    const calculateDuration = (start, end) => {
        if (!start || !end) return 0;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        return (h2 * 60 + m2) - (h1 * 60 + m1);
    };

    if (!slots || slots.length === 0) {
        return (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="text-slate-400 font-medium whitespace-pre-wrap text-lg">No classes found in this timetable.</div>
                <p className="text-slate-400 text-sm mt-2">The database returned an empty slot list.</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-3xl border border-white/20 shadow-2xl bg-white/40 backdrop-blur-xl">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-white">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                        <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">Lecture</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
                        <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">Lab</span>
                    </div>
                </div>
                <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-blue-200 text-[10px] font-black tracking-widest uppercase">Smart Schedule</span>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[1100px] border-separate border-spacing-0">
                    <thead>
                        <tr>
                            <th className="p-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest bg-white/80 backdrop-blur-md border-b border-r border-slate-200/50 sticky left-0 top-0 z-20 w-[120px]">
                                TIME
                            </th>
                            {DAYS.map(day => (
                                <th key={day} className="p-4 text-center text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] bg-white/60 backdrop-blur-sm border-b border-r border-slate-200/50 last:border-r-0">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {segments.map((seg, idx) => (
                            <tr key={seg.key} className="group transition-colors hover:bg-white/30">
                                <td className="p-4 text-[11px] font-bold text-slate-500 border-r border-slate-200/50 bg-white/80 backdrop-blur-md sticky left-0 z-10 text-center shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                    {seg.start} <br /> <span className="text-[9px] opacity-60 font-medium">to</span> <br /> {seg.end}
                                </td>
                                {DAYS.map(day => {
                                    const cell = grid[day][seg.key];
                                    if (cell.isCovered) return null;

                                    const slot = cell.slot;
                                    const isLab = slot?.slotType === 'LAB';

                                    return (
                                        <td
                                            key={`${day}-${seg.key}`}
                                            rowSpan={slot?.rowSpan || 1}
                                            className="p-1.5 border-r border-slate-100/50 last:border-r-0 relative h-1"
                                        >
                                            {slot ? (
                                                <div className={`h-full min-h-[100px] w-full p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-md ${isLab
                                                    ? 'bg-gradient-to-br from-purple-600/90 to-indigo-700/90 border-purple-400/30 text-white shadow-purple-900/20'
                                                    : 'bg-gradient-to-br from-blue-600/90 to-indigo-700/90 border-blue-400/30 text-white shadow-blue-900/20'
                                                    }`}>

                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/20 ${isLab ? 'bg-purple-900/30' : 'bg-blue-900/30'}`}>
                                                            {slot.classroom?.name || `RM ${slot.classroomId}`}
                                                        </span>
                                                        <span className="text-[10px] font-bold opacity-80">{calculateDuration(slot.startTime, slot.endTime)}m</span>
                                                    </div>

                                                    <h4 className="text-[12px] font-black leading-tight line-clamp-2 mb-1 drop-shadow-md">
                                                        {slot.subject?.name}
                                                    </h4>

                                                    <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-white/10">
                                                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold border border-white/20">
                                                            {slot.faculty?.name?.charAt(0)}
                                                        </div>
                                                        <span className="text-[10px] font-medium truncate opacity-90">{slot.faculty?.name}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full min-h-[60px] rounded-xl border border-dashed border-slate-300/50 bg-white/20 hover:bg-white/40 transition-colors"></div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimetableGrid;
