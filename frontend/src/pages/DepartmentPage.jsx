import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentApi } from '../api/department.api';
import TableView from '../components/TableView';
import Loader from '../components/Loader';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader2, Plus } from 'lucide-react';
import { useNotificationStore } from '../store/notification.store';

const DepartmentPage = () => {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', hod: '' });
    const { addNotification, showConfirm } = useNotificationStore();

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await departmentApi.getAll();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'code', header: 'Code' },
        { key: 'name', header: 'Department Name' },
        {
            key: 'headOfDepartment',
            header: 'Head of Department',
            render: (val) => val || '-'
        },
        {
            key: 'facultyCount',
            header: 'Faculty',
            render: (value, row) => row._count?.faculties || 0
        },
        {
            key: 'studentCount',
            header: 'Students',
            render: (value, row) => row._count?.students || 0
        }
    ];

    const handleEdit = (row) => {
        navigate(`/dashboard/departments/edit/${row.id}`);
    };

    const handleDelete = async (dept) => {
        showConfirm({
            title: `Delete Department?`,
            message: `Are you sure you want to delete ${dept.name}? All linked faculties and subjects might be affected.`,
            type: "danger",
            onConfirm: async () => {
                try {
                    await departmentApi.delete(dept.id);
                    addNotification("Department deleted successfully", "success");
                    fetchDepartments();
                } catch (error) {
                    addNotification("Failed to delete department", "error");
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                code: formData.code,
                headOfDepartment: formData.hod
            };

            if (editingId) {
                await departmentApi.update(editingId, payload);
            } else {
                await departmentApi.create(payload);
            }

            setIsModalOpen(false);
            setFormData({ name: '', code: '', hod: '' });
            setEditingId(null);
            fetchDepartments();
        } catch (error) {
            console.error("Failed to save department", error);
            addNotification("Failed to save department", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', code: '', hod: '' });
        setEditingId(null);
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Departments</h1>
                    <p className="text-gray-500">Overview of all academic departments and their capacity.</p>
                </div>
                <Button
                    onClick={() => navigate('/dashboard/departments/add')}
                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    New Department
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <TableView
                    columns={columns}
                    data={departments}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "Edit Department" : "Quick Add Department"}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Update' : 'Save')}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    />
                </form>
            </Modal>
        </div>
    );
};

export default DepartmentPage;

