import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectApi } from '../api/subject.api';
import { departmentApi } from '../api/department.api';
import TableView from '../components/TableView';
import Loader from '../components/Loader';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader2, Plus, BookOpen } from 'lucide-react';
import { useNotificationStore } from '../store/notification.store';

const SubjectPage = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        departmentId: '',
        credits: '',
        semester: '',
        type: 'THEORY',
        lecturesPerWeek: ''
    });

    const { addNotification, showConfirm } = useNotificationStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectData, deptData] = await Promise.all([
                    subjectApi.getAll(),
                    departmentApi.getAll()
                ]);
                setSubjects(subjectData);
                setDepartments(deptData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchSubjects = async () => {
        try {
            const data = await subjectApi.getAll();
            setSubjects(data);
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        }
    };

    const columns = [
        { key: 'code', header: 'Code' },
        { key: 'name', header: 'Subject Name' },
        {
            key: 'department',
            header: 'Department',
            render: (value, row) => row.department?.code || '-'
        },
        { key: 'semester', header: 'Sem' },
        { key: 'credits', header: 'Credits' },
        { key: 'type', header: 'Type' }
    ];

    const handleEdit = (row) => {
        navigate(`/dashboard/subjects/edit/${row.id}`);
    };

    const handleDelete = async (row) => {
        showConfirm({
            title: "Delete Subject?",
            message: `Are you sure you want to delete ${row.name}? This will remove it from the curriculum catalog.`,
            type: "danger",
            onConfirm: async () => {
                try {
                    await subjectApi.delete(row.id);
                    addNotification("Subject deleted", "success");
                    fetchSubjects();
                } catch (error) {
                    addNotification("Failed to delete subject", "error");
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                departmentId: parseInt(formData.departmentId),
                credits: parseInt(formData.credits),
                semester: parseInt(formData.semester),
                lecturesPerWeek: parseInt(formData.lecturesPerWeek)
            };

            if (editingId) {
                await subjectApi.update(editingId, payload);
            } else {
                await subjectApi.create(payload);
            }

            handleCloseModal();
            fetchSubjects();
        } catch (error) {
            console.error("Failed to save subject", error);
            addNotification("Failed to save subject", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            name: '',
            code: '',
            departmentId: '',
            credits: '',
            semester: '',
            type: 'THEORY',
            lecturesPerWeek: ''
        });
        setEditingId(null);
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Subjects</h1>
                    <p className="text-gray-500 text-lg">Manage course catalog, credits, and teaching requirements.</p>
                </div>
                <Button
                    onClick={() => navigate('/dashboard/subjects/add')}
                    className="bg-orange-600 hover:bg-orange-700 shadow-md flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Subject
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <TableView
                    columns={columns}
                    data={subjects}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "Edit Subject" : "Quick Add Subject"}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-orange-600 font-medium">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Update' : 'Save')}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="THEORY">Theory</option>
                                <option value="LAB">Lab</option>
                            </select>
                        </div>
                        <Input
                            label="Lectures/Week"
                            type="number"
                            value={formData.lecturesPerWeek}
                            onChange={(e) => setFormData({ ...formData, lecturesPerWeek: e.target.value })}
                            required
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SubjectPage;
