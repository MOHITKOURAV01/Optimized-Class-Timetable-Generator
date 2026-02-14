import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { facultyApi } from '../api/faculty.api';
import { departmentApi } from '../api/department.api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader2, ArrowLeft, Info } from 'lucide-react';
import Loader from '../components/Loader';

const EditFaculty = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        maxWeeklyLoad: '',
        averageLeavesPerMonth: '0',
        departmentId: '',
        availableDays: '',
        preferredSlots: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [facultyData, deptData] = await Promise.all([
                    facultyApi.getById(id),
                    departmentApi.getAll()
                ]);

                setDepartments(deptData);

                let days = '';
                try {
                    const parsed = JSON.parse(facultyData.availableDays);
                    days = Array.isArray(parsed) ? parsed.join(', ') : facultyData.availableDays;
                } catch (e) {
                    days = facultyData.availableDays;
                }

                let slots = '';
                try {
                    if (facultyData.preferredSlots) {
                        const parsed = JSON.parse(facultyData.preferredSlots);
                        slots = Array.isArray(parsed) ? parsed.join(', ') : facultyData.preferredSlots;
                    }
                } catch (e) {
                    slots = facultyData.preferredSlots || '';
                }

                setFormData({
                    name: facultyData.name,
                    email: facultyData.email,
                    phone: facultyData.phone || '',
                    maxWeeklyLoad: facultyData.maxWeeklyLoad.toString(),
                    averageLeavesPerMonth: facultyData.averageLeavesPerMonth.toString(),
                    departmentId: facultyData.departmentId.toString(),
                    availableDays: days,
                    preferredSlots: slots
                });
            } catch (error) {
                console.error("Failed to fetch faculty data", error);
                alert("Failed to load faculty data");
                navigate('/dashboard/faculty');
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
                email: formData.email,
                phone: formData.phone || null,
                maxWeeklyLoad: parseInt(formData.maxWeeklyLoad),
                averageLeavesPerMonth: parseFloat(formData.averageLeavesPerMonth),
                departmentId: parseInt(formData.departmentId),
                availableDays: JSON.stringify(formData.availableDays.split(',').map(day => day.trim()).filter(Boolean)),
                preferredSlots: formData.preferredSlots ? JSON.stringify(formData.preferredSlots.split(',').map(slot => slot.trim()).filter(Boolean)) : null
            };

            await facultyApi.update(id, payload);
            navigate('/dashboard/faculty');
        } catch (error) {
            console.error("Failed to update faculty", error);
            const message = error.response?.data?.message || error.message || "Failed to update faculty";
            alert(`Error: ${message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/dashboard/faculty')} className="rounded-full h-10 w-10 p-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Faculty Member</h1>
                    <p className="text-gray-500">Update faculty profile and scheduling constraints.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Dr. John Doe"
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="e.g., john.doe@university.edu"
                            required
                        />
                        <Input
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="e.g., +1 234 567 890"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
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
                    </div>
                </div>

                {/* Workload & Availability */}
                <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
                        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                        Workload & Availability
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Max Weekly Load (Hours)"
                            type="number"
                            value={formData.maxWeeklyLoad}
                            onChange={(e) => setFormData({ ...formData, maxWeeklyLoad: e.target.value })}
                            placeholder="e.g., 40"
                            required
                        />
                        <Input
                            label="Average Leaves per Month"
                            type="number"
                            step="0.5"
                            value={formData.averageLeavesPerMonth}
                            onChange={(e) => setFormData({ ...formData, averageLeavesPerMonth: e.target.value })}
                            placeholder="e.g., 2"
                        />

                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2 font-semibold">
                                    Available Days
                                    <div className="group relative">
                                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl z-20">
                                            Comma-separated days of the week when this faculty is available.
                                        </div>
                                    </div>
                                </label>
                                <Input
                                    value={formData.availableDays}
                                    onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                                    placeholder="e.g., Monday, Tuesday, Wednesday"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2 font-semibold">
                                    Preferred Time Slots
                                    <div className="group relative">
                                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl z-20">
                                            Comma-separated slots, e.g., 09:00-11:00, 14:00-16:00
                                        </div>
                                    </div>
                                </label>
                                <Input
                                    value={formData.preferredSlots}
                                    onChange={(e) => setFormData({ ...formData, preferredSlots: e.target.value })}
                                    placeholder="e.g., 09:00-12:00, 14:00-16:00"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/dashboard/faculty')} className="px-8">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="px-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-md text-white">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {submitting ? 'Updating...' : 'Update Faculty'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditFaculty;
