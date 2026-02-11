import { useState, useEffect } from 'react';
import { departmentApi } from '../api/department.api';
import { timetableApi } from '../api/timetable.api';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Loader2, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import TimetableGrid from '../components/TimetableGrid';
import { useNotificationStore } from '../store/notification.store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TimetableGeneratePage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generatedTimetable, setGeneratedTimetable] = useState(null);
    const { addNotification, showConfirm } = useNotificationStore();
    const [formData, setFormData] = useState({
        departmentId: '',
        semester: '',
        objective: 'balance' // 'balance' or 'utilization'
    });

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const data = await departmentApi.getAll();
                setDepartments(data);
            } catch (error) {
                console.error("Failed to fetch departments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDepts();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        setGeneratedTimetable(null);

        try {
            // Call the generation API
            const result = await timetableApi.generate({
                departmentId: parseInt(formData.departmentId),
                semester: parseInt(formData.semester),
                objective: formData.objective
            });
            setGeneratedTimetable(result);
        } catch (error) {
            console.error("Failed to generate timetable", error);
            const errorMessage = error.response?.data?.error || "Failed to generate timetable. Please try again.";
            addNotification(errorMessage, "error");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedTimetable) return;
        try {
            await timetableApi.create(generatedTimetable);
            addNotification("Timetable saved and sent for approval!", "success");
            setGeneratedTimetable(null);
        } catch (error) {
            console.error("Failed to save timetable", error);
            addNotification("Failed to save timetable", "error");
        }
    };

    const exportToPDF = () => {
        if (!generatedTimetable) return;
        setGenerating(true); // Reuse generating for loading feedback
        console.log("Starting Draft PDF Export...", generatedTimetable);

        const doc = new jsPDF('l', 'mm', 'a4'); // landscape
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. PROFESSIONAL HEADER
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setFillColor(59, 130, 246); // Blue-500
        doc.rect(0, 40, pageWidth, 2, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("DRAFT ACADEMIC TIMETABLE", 14, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text("PRE-APPROVAL PREVIEW", 14, 26);

        const dept = departments.find(d => d.id === parseInt(formData.departmentId));
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${dept?.name || 'All Departments'}`, 14, 34);

        doc.setFont("helvetica", "bold");
        doc.text(`SEMESTER ${formData.semester}`, pageWidth - 14, 20, { align: 'right' });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 14, 26, { align: 'right' });

        // 2. PREPARE DATA
        const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
        const slots = generatedTimetable.slots || [];

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
                    s.dayOfWeek.toUpperCase() === day &&
                    s.startTime.substring(0, 5) <= seg.start &&
                    s.endTime.substring(0, 5) >= seg.end
                );

                if (slot) {
                    row.push({
                        content: `${slot.subject?.code}\n${slot.subject?.name}\n${slot.classroom?.name}\n${slot.faculty?.name}`,
                        styles: {
                            fillColor: slot.slotType === 'LAB' ? [245, 243, 255] : [239, 246, 255],
                            textColor: slot.slotType === 'LAB' ? [107, 33, 168] : [30, 64, 175],
                        }
                    });
                } else {
                    row.push({ content: '', styles: { fillColor: [255, 255, 255] } });
                }
            });
            return row;
        });

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
                    const pWidth = doc.internal.pageSize.getWidth();
                    const pHeight = doc.internal.pageSize.getHeight();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Draft Page ${data.pageNumber} | AI Scheduler Generation Preview`,
                        pWidth / 2,
                        pHeight - 10,
                        { align: 'center' }
                    );
                }
            });
            console.log("AutoTable complete");
        } catch (error) {
            console.error("AutoTable error:", error);
            addNotification("Error generating PDF", "error");
            setGenerating(false);
            return;
        }

        const filename = `Draft_Timetable_Sem${formData.semester}.pdf`;
        console.log("Saving PDF...", filename);

        // Diagnostic: Check output size
        const pdfOutput = doc.output('arraybuffer');
        console.log("PDF generated, size:", pdfOutput.byteLength, "bytes");

        if (pdfOutput.byteLength < 1000) {
            console.warn("PDF appears too small, might be corrupted");
        }

        doc.save(filename);
        addNotification("Draft PDF Exported Successfully", "success");
        setGenerating(false);
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Generate Timetable</h1>
                <p className="text-gray-600">AI-powered timetable generation</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1">
                    <Card title="Configuration">
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    placeholder="e.g., 3"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.objective}
                                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                >
                                    <option value="balance">Balance Workload</option>
                                    <option value="utilization">Maximize Resource Utilization</option>
                                </select>
                            </div>

                            <Button type="submit" disabled={generating} className="w-full flex justify-center items-center gap-2">
                                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                {generating ? 'Generating...' : 'Generate Timetable'}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2">
                    <Card title="Generated Timetable">
                        {!generatedTimetable && !generating && (
                            <div className="text-center py-12 text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Configure settings and click Generate to create a timetable.</p>
                            </div>
                        )}

                        {generating && (
                            <div className="text-center py-12">
                                <Loader2 className="w-12 h-12 mx-auto mb-3 text-blue-600 animate-spin" />
                                <p className="text-gray-600">AI is optimizing the schedule...</p>
                                <p className="text-sm text-gray-400 mt-1">This may take a few moments</p>
                            </div>
                        )}

                        {generatedTimetable && (
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-green-900">Timetable Generated Successfully</h3>
                                        <p className="text-sm text-green-700 mt-1">
                                            The algorithm has found an optimal schedule based on your constraints.
                                        </p>
                                    </div>
                                </div>

                                {/* Preview of generated slots */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Weekly Schedule Preview</h4>
                                        <span className="text-xs text-slate-400">{generatedTimetable.slots?.length} Optimized Slots</span>
                                    </div>
                                    <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-100 shadow-inner bg-slate-50/30 p-2">
                                        <TimetableGrid slots={generatedTimetable.slots || []} />
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="secondary" onClick={() => setGeneratedTimetable(null)}>
                                        Discard
                                    </Button>
                                    <Button variant="secondary" onClick={exportToPDF} className="bg-slate-100 hover:bg-slate-200 text-slate-700">
                                        Export Draft PDF
                                    </Button>
                                    <Button onClick={handleSave}>
                                        Save Timetable
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TimetableGeneratePage;
