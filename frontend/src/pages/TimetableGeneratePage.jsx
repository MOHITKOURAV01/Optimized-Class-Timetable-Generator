import { useState, useEffect } from 'react';
import { departmentApi } from '../api/department.api';
import { timetableApi } from '../api/timetable.api';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Loader2, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import TimetableGrid from '../components/TimetableGrid';
import { useNotificationStore } from '../store/notification.store';

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
