import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { departmentApi } from '../api/department.api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader2, ArrowLeft, Building, Users, GraduationCap } from 'lucide-react';
import Loader from '../components/Loader';

const EditDepartment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        hod: '',
        totalFaculty: '',
        totalStudents: ''
    });

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                const data = await departmentApi.getById(id);
                setFormData({
                    name: data.name,
                    code: data.code,
                    hod: data.headOfDepartment || '',
                    totalFaculty: data.totalFaculty?.toString() || '',
                    totalStudents: data.totalStudents?.toString() || ''
                });
            } catch (error) {
                console.error("Failed to fetch department", error);
                alert("Failed to load department data");
                navigate('/dashboard/departments');
            } finally {
                setLoading(false);
            }
        };

        fetchDepartment();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                code: formData.code,
                headOfDepartment: formData.hod,
                totalFaculty: formData.totalFaculty ? parseInt(formData.totalFaculty) : 0,
                totalStudents: formData.totalStudents ? parseInt(formData.totalStudents) : 0
            };

            await departmentApi.update(id, payload);
            navigate('/dashboard/departments');
        } catch (error) {
            console.error("Failed to update department", error);
            alert("Failed to update department");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/dashboard/departments')} className="rounded-full h-10 w-10 p-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Department</h1>
                    <p className="text-gray-500">Update academic department details and statistics.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <Building className="w-5 h-5 text-blue-600" />
                            General Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Department Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Computer Science"
                                required
                            />
                            <Input
                                label="Department Code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g., CSE"
                                required
                            />
                            <Input
                                label="Head of Department"
                                value={formData.hod}
                                onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
                                placeholder="e.g., Dr. Smith"
                                className="md:col-span-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 pt-4 border-t">
                            <Users className="w-5 h-5 text-emerald-600" />
                            Department Statistics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Total Faculty"
                                type="number"
                                value={formData.totalFaculty}
                                onChange={(e) => setFormData({ ...formData, totalFaculty: e.target.value })}
                                placeholder="e.g., 25"
                                icon={<Users className="w-4 h-4" />}
                            />
                            <Input
                                label="Total Students"
                                type="number"
                                value={formData.totalStudents}
                                onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                                placeholder="e.g., 500"
                                icon={<GraduationCap className="w-4 h-4" />}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t font-medium">
                        <Button type="button" variant="secondary" onClick={() => navigate('/dashboard/departments')} className="px-6">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="px-10 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg text-white">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            {submitting ? 'Updating...' : 'Update Department'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDepartment;
