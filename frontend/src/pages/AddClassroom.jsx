import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classroomApi } from '../api/classroom.api';
import { departmentApi } from '../api/department.api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader2, ArrowLeft, School, GraduationCap, Calendar } from 'lucide-react';

const AddClassroom = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        year: new Date().getFullYear().toString(),
        semester: '',
        departmentId: ''
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await departmentApi.getAll();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                year: parseInt(formData.year),
                semester: parseInt(formData.semester),
                departmentId: parseInt(formData.departmentId)
            };

            await classroomApi.create(payload);
            navigate('/dashboard/classrooms');
        } catch (error) {
            console.error("Failed to save classroom", error);
            const message = error.response?.data?.message || error.message || "Failed to save classroom";
            alert(`Error: ${message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/dashboard/classrooms')} className="rounded-full h-10 w-10 p-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Classroom</h1>
                    <p className="text-gray-500">Register a new physical room or lab for scheduling.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <School className="w-5 h-5 text-purple-600" />
                                Room Identification
                            </h2>
                            <Input
                                label="Classroom Name / Room Number"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Block A - Room 101"
                                required
                            />
                        </section>

                        <section className="space-y-4 pt-6 border-t">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-emerald-600" />
                                Allocation Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Department</label>
                                    <select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Semester"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    placeholder="e.g., 3"
                                    required
                                />
                                <Input
                                    label="Academic Year"
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    placeholder="e.g., 2024"
                                    required
                                    icon={<Calendar className="w-4 h-4" />}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t font-medium">
                        <Button type="button" variant="secondary" onClick={() => navigate('/dashboard/classrooms')} className="px-6">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="px-10 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            {submitting ? 'Registering...' : 'Register Room'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClassroom;

