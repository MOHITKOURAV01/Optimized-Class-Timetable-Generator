import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { classroomApi } from '../api/classroom.api';
import { departmentApi } from '../api/department.api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader2, ArrowLeft, School, Building2, Calendar } from 'lucide-react';
import Loader from '../components/Loader';

const EditClassroom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        year: '',
        semester: '',
        departmentId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classroomData, deptData] = await Promise.all([
                    classroomApi.getById(id),
                    departmentApi.getAll()
                ]);

                setDepartments(deptData);
                setFormData({
                    name: classroomData.name,
                    year: classroomData.year.toString(),
                    semester: classroomData.semester.toString(),
                    departmentId: classroomData.departmentId.toString()
                });
            } catch (error) {
                console.error("Failed to fetch classroom data", error);
                alert("Failed to load classroom data");
                navigate('/dashboard/classrooms');
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
                name: formData.name,
                year: parseInt(formData.year),
                semester: parseInt(formData.semester),
                departmentId: parseInt(formData.departmentId)
            };

            await classroomApi.update(id, payload);
            navigate('/dashboard/classrooms');
        } catch (error) {
            console.error("Failed to update classroom", error);
            alert("Failed to update classroom");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/dashboard/classrooms')} className="rounded-full h-10 w-10 p-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Classroom</h1>
                    <p className="text-gray-500">Modify classroom allocation and academic settings.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <School className="w-5 h-5 text-purple-600" />
                            Classroom Details
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Classroom Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., CSE-Lab-1"
                                required
                                icon={<School className="w-4 h-4" />}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        Assigned Department
                                    </label>
                                    <select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name} ({dept.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Year"
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        placeholder="e.g., 2"
                                        required
                                        icon={<Calendar className="w-4 h-4" />}
                                    />
                                    <Input
                                        label="Semester"
                                        type="number"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        placeholder="e.g., 4"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t font-medium">
                        <Button type="button" variant="secondary" onClick={() => navigate('/dashboard/classrooms')} className="px-8">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="px-10 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg text-white">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            {submitting ? 'Updating...' : 'Update Classroom'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClassroom;
