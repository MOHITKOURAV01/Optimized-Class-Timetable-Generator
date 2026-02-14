import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classroomApi } from '../api/classroom.api';
import { departmentApi } from '../api/department.api';
import TableView from '../components/TableView';
import Loader from '../components/Loader';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader2, Plus, School } from 'lucide-react';

const ClassroomPage = () => {
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        year: '',
        semester: '',
        departmentId: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classroomData, deptData] = await Promise.all([
                    classroomApi.getAll(),
                    departmentApi.getAll()
                ]);
                setClassrooms(classroomData);
                setDepartments(deptData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const data = await classroomApi.getAll();
            setClassrooms(data);
        } catch (error) {
            console.error("Failed to fetch classrooms", error);
        }
    };

    const columns = [
        { key: 'name', header: 'Classroom Name' },
        { key: 'year', header: 'Year' },
        { key: 'semester', header: 'Semester' },
        {
            key: 'department',
            header: 'Department',
            render: (value, row) => row.department?.code || '-'
        }
    ];

    const handleEdit = (row) => {
        navigate(`/dashboard/classrooms/edit/${row.id}`);
    };

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
            try {
                await classroomApi.delete(row.id);
                fetchClassrooms();
            } catch (error) {
                console.error("Failed to delete classroom", error);
                alert("Failed to delete classroom");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                year: parseInt(formData.year),
                semester: parseInt(formData.semester),
                departmentId: parseInt(formData.departmentId)
            };

            if (editingId) {
                await classroomApi.update(editingId, payload);
            } else {
                await classroomApi.create(payload);
            }

            handleCloseModal();
            fetchClassrooms();
        } catch (error) {
            console.error("Failed to save classroom", error);
            alert("Failed to save classroom");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            name: '',
            year: '',
            semester: '',
            departmentId: '',
        });
        setEditingId(null);
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Classrooms</h1>
                    <p className="text-gray-500 text-lg">Manage available rooms, labs, and their academic allocation.</p>
                </div>
                <Button
                    onClick={() => navigate('/dashboard/classrooms/add')}
                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Add Classroom
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <TableView
                    columns={columns}
                    data={classrooms}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "Edit Classroom" : "Quick Add Classroom"}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Update' : 'Save')}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Classroom Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., CSE-Lab-1"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Year"
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            placeholder="e.g., 2"
                            required
                        />
                        <Input
                            label="Semester"
                            type="number"
                            value={formData.semester}
                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                            placeholder="e.g., 3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
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
                </form>
            </Modal>
        </div>
    );
};

export default ClassroomPage;

