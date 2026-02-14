import React, { useState, useEffect } from 'react';
import { timetableApi } from '../api/timetable.api';
import { departmentApi } from '../api/department.api';
import TimetableGrid from '../components/TimetableGrid';
import Loader from '../components/Loader';
import Card from '../components/ui/Card';
import { Search, Filter, Download, Calendar, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../store/notification.store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TimetableDetailPage = () => {
    const [departments, setDepartments] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [selectedTimetable, setSelectedTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchingDetail, setFetchingDetail] = useState(false);
    const [filters, setFilters] = useState({
        departmentId: '',
        semester: ''
    });
    const [exporting, setExporting] = useState(false);

    const { addNotification, showConfirm } = useNotificationStore();

    useEffect(() => {
        const init = async () => {
            try {
                const [depts, tts] = await Promise.all([
                    departmentApi.getAll(),
                    timetableApi.getAll()
                ]);
                setDepartments(depts);

                // Filter only approved ones for "Final" view
                const approved = tts.filter(t => t.status === 'APPROVED');
                setTimetables(approved);

                if (approved.length > 0) {
                    loadDetail(approved[0].id);
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const loadDetail = async (id) => {
        setFetchingDetail(true);
        try {
            const data = await timetableApi.getById(id);
            setSelectedTimetable(data);
        } catch (error) {
            console.error("Failed to fetch detail", error);
        } finally {
            setFetchingDetail(false);
        }
    };

    const handleDelete = async (id) => {
        showConfirm({
            title: "Delete Timetable?",
            message: "This will permanently remove this approved timetable and free up these slots for future generation. This action cannot be undone.",
            type: "danger",
            onConfirm: async () => {
                try {
                    await timetableApi.delete(id);
                    const updated = timetables.filter(t => t.id !== id);
                    setTimetables(updated);
                    if (selectedTimetable?.id === id) {
                        setSelectedTimetable(null);
                    }
                    addNotification("Timetable deleted successfully", "success");
                } catch (error) {
                    addNotification("Failed to delete timetable", "error");
                }
            }
        });
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredTimetables = timetables.filter(t => {
        const matchDept = !filters.departmentId || t.departmentId === parseInt(filters.departmentId);
        const matchSem = !filters.semester || t.semester === parseInt(filters.semester);
        return matchDept && matchSem;
    });

    const exportToPDF = () => {
        if (!selectedTimetable) return;
        setExporting(true);

        const doc = new jsPDF('l', 'mm', 'a4'); // landscape
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. PROFESSIONAL HEADER
        // Accent bar at the top
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Secondary accent line
        doc.setFillColor(59, 130, 246); // Blue-500
        doc.rect(0, 40, pageWidth, 2, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("ACADEMIC TIMETABLE", 14, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text("OFFICIALLY APPROVED SCHEDULE", 14, 26);

        // Department & Semester Info
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${selectedTimetable.department?.name || 'All Departments'}`, 14, 34);

        doc.setFont("helvetica", "bold");
        doc.text(`SEMESTER ${selectedTimetable.semester}`, pageWidth - 14, 20, { align: 'right' });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 14, 26, { align: 'right' });
        doc.text(`Total Slots: ${selectedTimetable.slots?.length || 0}`, pageWidth - 14, 32, { align: 'right' });

        // 2. PREPARE DATA
        const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
        const slots = selectedTimetable.slots || [];

        // Time identification logic (consistent with UI)
        const timeTics = new Set(["09:00", "13:00", "14:00", "18:00"]);
        slots.forEach(s => {
            if (s.startTime) timeTics.add(s.startTime.substring(0, 5));
            if (s.endTime) timeTics.add(s.endTime.substring(0, 5));
        });
        const sortedTics = Array.from(timeTics).sort();
        const segments = [];
        for (let i = 0; i < sortedTics.length - 1; i++) {
            segments.push({ start: sortedTics[i], end: sortedTics[i + 1], key: `${sortedTics[i]}-${sortedTics[i + 1]}` });
        }

        const head = [['TIME', ...DAYS]];
        const body = segments.map(seg => {
            const row = [{ content: `${seg.start} - ${seg.end}`, styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } }];
            DAYS.forEach(day => {
                const slot = slots.find(s =>
                    s?.dayOfWeek?.toUpperCase() === day &&
                    s?.startTime?.substring(0, 5) <= seg.start &&
                    s?.endTime?.substring(0, 5) >= seg.end
                );

                if (slot) {
                    const type = slot.slotType === 'LAB' ? 'LABORATORY' : 'LECTURE';
                    row.push({
                        content: `${slot?.subject?.code || ''}\n${slot?.subject?.name || ''}\n${slot?.classroom?.name || ''}\n${slot?.faculty?.name || ''}`,
                        styles: {
                            fillColor: slot.slotType === 'LAB' ? [245, 243, 255] : [239, 246, 255], // Light Purple or Light Blue
                            textColor: slot.slotType === 'LAB' ? [107, 33, 168] : [30, 64, 175], // Deep Purple or Deep Blue
                        }
                    });
                } else {
                    row.push({ content: '', styles: { fillColor: [255, 255, 255] } });
                }
            });
            return row;
        });

        // 3. RENDER TABLE
        try {
            autoTable(doc, {
                startY: 50,
                head: head,
                body: body,
                theme: 'grid',
                headStyles: {
                    fillColor: [30, 41, 59],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    cellPadding: 4
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    halign: 'center',
                    valign: 'middle',
                    font: 'helvetica',
                    lineWidth: 0.1,
                    lineColor: [226, 232, 240]
                },
                columnStyles: {
                    0: { cellWidth: 35 }
                },
                margin: { left: 14, right: 14 },
                didDrawPage: (data) => {
                    // FOOTER
                    const pWidth = doc.internal.pageSize.getWidth();
                    const pHeight = doc.internal.pageSize.getHeight();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} | Generated by AI Scheduler Pro`,
                        pWidth / 2,
                        pHeight - 10,
                        { align: 'center' }
                    );
                    doc.text(
                        `© ${new Date().getFullYear()} Optimized Class Timetable Generator`,
                        14,
                        pHeight - 10
                    );
                }
            });
        } catch (error) {
            console.error("AutoTable error:", error);
            addNotification("Database error while generating PDF", "error");
            setExporting(false);
            return;
        }

        // 4. Open PDF in new tab — user downloads from Chrome's PDF viewer
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');

        addNotification("Professional PDF opened in new tab", "success");
        setExporting(false);
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Academic Timetables</h1>
                    <p className="text-slate-500">View finalized and approved class schedules.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToPDF}
                        disabled={!selectedTimetable || exporting}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                    >
                        {exporting ? (
                            <>
                                <Loader size="sm" color="white" />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 text-blue-400" />
                                <span>Export Professional PDF</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-6">
                        {/* Filters */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                            <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                                <Filter className="w-4 h-4" /> Filters
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                                <select
                                    name="departmentId"
                                    value={filters.departmentId}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:ring-blue-500"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester</label>
                                <select
                                    name="semester"
                                    value={filters.semester}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:ring-blue-500"
                                >
                                    <option value="">All Semesters</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-2">
                            <div className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Approved Schedules ({filteredTimetables.length})
                            </div>
                            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {filteredTimetables.map(tt => (
                                    <div
                                        key={tt.id}
                                        className={`group relative p-4 rounded-xl border transition-all ${selectedTimetable?.id === tt.id
                                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 border-transparent text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
                                            }`}
                                    >
                                        {/* Click area for selection */}
                                        <div onClick={() => loadDetail(tt.id)} className="cursor-pointer">
                                            <div className="font-bold flex items-center justify-between">
                                                {tt.name || `Timetable #${tt.id}`}
                                                {selectedTimetable?.id === tt.id && <Calendar className="w-4 h-4" />}
                                            </div>
                                            <div className={`text-xs mt-1 ${selectedTimetable?.id === tt.id ? 'text-blue-100' : 'text-slate-500'}`}>
                                                {tt.department?.name} • Sem {tt.semester}
                                            </div>
                                        </div>

                                        {/* Delete Button (Always semi-visible, fully on hover) */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(tt.id);
                                            }}
                                            className={`absolute top-3 right-3 p-2 rounded-lg z-20 transition-all ${selectedTimetable?.id === tt.id
                                                ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                                                : 'bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white opacity-40 group-hover:opacity-100'
                                                }`}
                                            title="Delete Timetable"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {filteredTimetables.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                                        No approved timetables found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        {fetchingDetail ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Loader />
                                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading schedule details...</p>
                            </div>
                        ) : selectedTimetable ? (
                            <div id="timetable-printable" className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl text-white shadow-xl shadow-blue-500/20 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
                                    <div className="relative z-10">
                                        <h2 className="text-2xl font-bold">{selectedTimetable.department?.name}</h2>
                                        <div className="flex items-center gap-4 mt-2 text-slate-300">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Semester {selectedTimetable.semester}</span>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                            <span>{selectedTimetable.slots?.length} Scheduled Classes</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-right">
                                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Status</div>
                                        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30 inline-block">
                                            OFFICIALLY APPROVED
                                        </div>
                                    </div>
                                </div>
                                <TimetableGrid slots={selectedTimetable.slots || []} />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Select a Timetable</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                    Select an approved timetable from the left sidebar to view the full weekly schedule.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TimetableDetailPage;
