import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { subjectApi } from '../api/subject.api';
import { departmentApi } from '../api/department.api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader2, ArrowLeft, BookOpen, Clock, Building2 } from 'lucide-react';
import Loader from '../components/Loader';

const EditSubject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        departmentId: '',
        credits: '',
        semester: '',
        type: 'LECTURE',
        lecturesPerWeek: '',
        labsPerWeek: '0',
        classesPerWeek: '',
        classesPerDay: '1',
        durationPerClass: '60',
        prerequisites: '',
        allowedRoomTypes: 'Classroom'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectData, deptData] = await Promise.all([
                    subjectApi.getById(id),
                    departmentApi.getAll()
                ]);

                setDepartments(deptData);

                let prereqs = '';
                try {
                    if (subjectData.prerequisites) {
                        const parsed = JSON.parse(subjectData.prerequisites);
                        prereqs = Array.isArray(parsed) ? parsed.join(', ') : subjectData.prerequisites;
                    }
                } catch (e) {
                    prereqs = subjectData.prerequisites || '';
                }

                let rooms = '';
                try {
                    if (subjectData.allowedRoomTypes) {
                        const parsed = JSON.parse(subjectData.allowedRoomTypes);
                        rooms = Array.isArray(parsed) ? parsed.join(', ') : subjectData.allowedRoomTypes;
                    }
                } catch (e) {
                    rooms = subjectData.allowedRoomTypes || '';
                }

                setFormData({
                    name: subjectData.name,
                    code: subjectData.code,
                    departmentId: subjectData.departmentId?.toString() || '',
                    credits: subjectData.credits?.toString() || '',
                    semester: subjectData.semester?.toString() || '',
                    type: subjectData.type || 'LECTURE',
                    lecturesPerWeek: subjectData.lecturesPerWeek?.toString() || '',
                    labsPerWeek: subjectData.labsPerWeek?.toString() || '0',
                    classesPerWeek: subjectData.classesPerWeek?.toString() || '',
                    classesPerDay: subjectData.classesPerDay?.toString() || '',
                    durationPerClass: subjectData.durationPerClass?.toString() || '',
                    prerequisites: prereqs,
                    allowedRoomTypes: rooms
                });
            } catch (error) {
                console.error("Failed to fetch subject data", error);

                // --- DEBUGGING ---
                console.log("Error Response:", error.response);
                console.log("Error Message:", error.message);
                if (error.response && error.response.status === 404) {
                    alert("Subject not found (404). It might have been deleted.");
                } else {
                    alert(`Failed to load subject data. Details: ${error.message}`);
                }
                // -----------------

                navigate('/dashboard/subjects');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                departmentId: parseInt(formData.departmentId),
                credits: parseInt(formData.credits),
                semester: parseInt(formData.semester),
                lecturesPerWeek: parseInt(formData.lecturesPerWeek),
                labsPerWeek: parseInt(formData.labsPerWeek),
                classesPerWeek: parseInt(formData.classesPerWeek),
                classesPerDay: parseInt(formData.classesPerDay),
                durationPerClass: parseInt(formData.durationPerClass),
                prerequisites: formData.prerequisites ? JSON.stringify(formData.prerequisites.split(',').map(p => p.trim()).filter(Boolean)) : null,
                allowedRoomTypes: formData.allowedRoomTypes ? JSON.stringify(formData.allowedRoomTypes.split(',').map(r => r.trim()).filter(Boolean)) : null
            };

            await subjectApi.update(id, payload);
            navigate('/dashboard/subjects');
        } catch (error) {
            console.error("Failed to update subject", error);
            const message = error.response?.data?.message || error.message || "Failed to update subject";
            alert(`Error: ${message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/dashboard/subjects')} className="rounded-full h-10 w-10 p-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Subject</h1>
                    <p className="text-gray-500">Update curriculum details and scheduling requirements.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Course Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Subject Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Data Structures"
                                    required
                                />
                                <Input
                                    label="Subject Code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., CS201"
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Credits"
                                        type="number"
                                        value={formData.credits}
                                        onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Semester"
                                        type="number"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-purple-600" />
                                Advanced Config
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Prerequisites (comma separated codes)"
                                    value={formData.prerequisites}
                                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                                    placeholder="e.g., CS101, CS102"
                                />
                                <Input
                                    label="Allowed Room Types"
                                    value={formData.allowedRoomTypes}
                                    onChange={(e) => setFormData({ ...formData, allowedRoomTypes: e.target.value })}
                                    placeholder="e.g., Classroom, Lab, Seminar Hall"
                                />
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 h-full">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                Scheduling
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instruction Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        required
                                    >
                                        <option value="Lecture">Lecture</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Tutorial">Tutorial</option>
                                    </select>
                                </div>
                                <Input
                                    label="Lectures / Week"
                                    type="number"
                                    value={formData.lecturesPerWeek}
                                    onChange={(e) => setFormData({ ...formData, lecturesPerWeek: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Labs / Week"
                                    type="number"
                                    value={formData.labsPerWeek}
                                    onChange={(e) => setFormData({ ...formData, labsPerWeek: e.target.value })}
                                />
                                <Input
                                    label="Duration / Class (Mins)"
                                    type="number"
                                    value={formData.durationPerClass}
                                    onChange={(e) => setFormData({ ...formData, durationPerClass: e.target.value })}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Classes / Week"
                                        type="number"
                                        value={formData.classesPerWeek}
                                        onChange={(e) => setFormData({ ...formData, classesPerWeek: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Classes / Day"
                                        type="number"
                                        value={formData.classesPerDay}
                                        onChange={(e) => setFormData({ ...formData, classesPerDay: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/dashboard/subjects')} className="px-8 font-medium">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="px-10 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg text-white font-semibold transform transition-transform hover:-translate-y-0.5 active:translate-y-0">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {submitting ? 'Updating...' : 'Update Subject'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditSubject;
