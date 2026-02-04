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
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 shadow-2xl bg-white">
            <div className="bg-[#1e293b] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] border border-white/20"></span>
                        <span className="text-white text-[11px] font-black uppercase tracking-widest opacity-90">Lecture</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)] border border-white/20"></span>
                        <span className="text-white text-[11px] font-black uppercase tracking-widest opacity-90">Lab</span>
                    </div>
                </div>
                <div className="bg-blue-500/10 px-5 py-2 rounded-full border border-blue-400/30 backdrop-blur-sm">
                    <span className="text-blue-400 text-[10px] font-black tracking-widest uppercase">Elastic Spanning Grid</span>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[1100px] border-separate border-spacing-0">
                    <thead>
                        <tr className="sticky top-0 z-[60]">
                            <th className="p-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest bg-white border-b-2 border-r-2 border-slate-100 sticky left-0 top-0 z-[70] w-[140px]">
                                <div className="flex flex-col">
                                    <span className="text-blue-600">TIME</span>
                                    <span className="text-[8px] opacity-40 uppercase">Flexible Intervals</span>
                                </div>
                            </th>
                            {DAYS.map(day => (
                                <th key={day} className="p-5 text-center text-[11px] font-black text-slate-800 uppercase tracking-[0.25em] bg-white border-b-2 border-r border-slate-100 last:border-r-0">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {segments.map((seg, idx) => (
                            <tr key={seg.key} className="hover:bg-blue-50/10 transition-colors">
                                <td className="p-5 text-[11px] font-black text-slate-500 border-r-2 border-slate-100 bg-white sticky left-0 z-[50] text-center shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                    <div className="bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 shadow-sm font-mono text-slate-600">
                                        {seg.start} - {seg.end}
                                    </div>
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
                                            className="p-2 border-r border-slate-100 last:border-r-0 relative group h-1"
                                        >
                                            {slot ? (
                                                <div className={`h-full min-h-[90px] w-full p-4 rounded-2xl border-b-4 shadow-lg flex flex-col justify-between transition-all duration-300 transform group-hover:scale-[1.01] group-hover:shadow-2xl ${isLab
                                                    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-900 text-white'
                                                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-900 text-white'
                                                    }`}>
                                                    <div className="relative z-10 w-full">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-tighter ${isLab ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                                {isLab ? 'Laboratory' : 'Lecture'}
                                                            </span>
                                                            <span className="text-[10px] font-bold opacity-80">{slot.classroom?.name || `RM ${slot.classroomId}`}</span>
                                                        </div>
                                                        <h4 className="text-[13px] font-black leading-[1.2] line-clamp-2 uppercase tracking-tight mb-1">
                                                            {slot.subject?.name || 'Subject Allotted'}
                                                        </h4>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-[9px] font-bold opacity-70 tracking-widest">{slot.subject?.code || `SUB${slot.subjectId}`}</p>
                                                            <span className="text-[8px] font-black bg-black/20 px-1.5 rounded-sm">
                                                                {calculateDuration(slot.startTime, slot.endTime)} min
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-2 relative z-10">
                                                        <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                            <span className="text-[10px] font-black">{slot.faculty?.name?.charAt(0) || 'F'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black truncate max-w-[100px] leading-none">{slot.faculty?.name || 'TBD'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full min-h-[50px] rounded-2xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center transition-all duration-300 group-hover:border-blue-200 group-hover:bg-blue-50/30">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] opacity-40 transition-opacity">Reserved</span>
                                                </div>
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
