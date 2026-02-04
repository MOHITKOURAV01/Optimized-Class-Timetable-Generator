import { useState, useEffect } from 'react';
import { timetableApi } from '../api/timetable.api';
import TableView from '../components/TableView';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

import TimetableGrid from '../components/TimetableGrid';
import { useNotificationStore } from '../store/notification.store';

const ApprovalPage = () => {
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimetable, setSelectedTimetable] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [fetchingDetail, setFetchingDetail] = useState(false);
    const { addNotification, showConfirm } = useNotificationStore();

    useEffect(() => {
        fetchPendingTimetables();
    }, []);

    const fetchPendingTimetables = async () => {
        try {
            setLoading(true);
            const data = await timetableApi.getAll();
            console.log("Approvals Page - All Data:", data);
            window.lastFetchedTimetables = data;
            const pending = data.filter(t => t.status === 'PENDING' || t.status === 'DRAFT');
            console.log("Approvals Page - Filtered Pending:", pending);
            setTimetables(pending);
        } catch (error) {
            console.error("Failed to fetch timetables", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        showConfirm({
            title: "Approve Timetable?",
            message: "This will finalize the timetable for the selected department and semester. It will be moved to the official records.",
            type: "info",
            onConfirm: async () => {
                try {
                    await timetableApi.approve(id, 'APPROVED', 'Approved by HOD');
                    addNotification("Timetable approved successfully", "success");
                    fetchPendingTimetables();
                } catch (error) {
                    addNotification("Failed to approve timetable", "error");
                }
            }
        });
    };

    const handleReject = async (id) => {
        showConfirm({
            title: "Reject Timetable?",
            message: "Are you sure you want to reject this timetable? This action will mark it as rejected and you will need to generate a new one.",
            type: "danger",
            onConfirm: async () => {
                try {
                    await timetableApi.approve(id, 'REJECTED', 'Rejected by HOD');
                    addNotification("Timetable rejected", "warning");
                    fetchPendingTimetables();
                } catch (error) {
                    addNotification("Failed to reject timetable", "error");
                }
            }
        });
    };

    const handleView = async (timetable) => {
        setIsViewModalOpen(true);
        setFetchingDetail(true);
        try {
            const detail = await timetableApi.getById(timetable.id);
            setSelectedTimetable(detail);
        } catch (error) {
            console.error("Failed to fetch detail", error);
        } finally {
            setFetchingDetail(false);
        }
    };

    const columns = [
        {
            key: 'department',
            header: 'Department',
            render: (val, row) => row.department?.name || `Dept ${row.departmentId}`
        },
        { key: 'semester', header: 'Semester' },
        {
            key: 'createdAt',
            header: 'Generated On',
            render: (val) => new Date(val).toLocaleDateString()
        },
        {
            key: 'status',
            header: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    val === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {val}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (val, row) => (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => handleView(row)} title="View">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(row.id)} title="Approve">
                        <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(row.id)} title="Reject">
                        <XCircle className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Timetable Approvals</h1>
                <p className="text-gray-600">Review and approve generated timetables</p>
            </div>

            <TableView
                columns={columns}
                data={timetables}
                actions={false}
            />

            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Timetable Preview"
                maxWidth="6xl"
                footer={
                    <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
                }
            >
                {fetchingDetail ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                        <Loader />
                        <p className="mt-4 text-slate-500">Fetching schedule detail...</p>
                    </div>
                ) : selectedTimetable ? (
                    <div className="space-y-6">
                        {/* Enhanced Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex flex-wrap gap-4">
                                <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Department</span>
                                    <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        {selectedTimetable.department?.name}
                                    </span>
                                </div>
                                <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Semester</span>
                                    <span className="text-sm font-black text-slate-800">
                                        Phase {selectedTimetable.semester}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pr-4">
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Load Status</span>
                                    <span className="text-lg font-black text-blue-600 tabular-nums">
                                        {selectedTimetable.slots?.length || 0} <span className="text-[10px] text-slate-400">Slots</span>
                                    </span>
                                </div>
                                <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                                <div className="hidden md:flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Security</span>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase">Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Grid Container with clean background */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                            <TimetableGrid slots={selectedTimetable.slots || []} />
                        </div>
                    </div>
                ) : (
                    <p>No data selected</p>
                )}
            </Modal>
        </div>
    );
};

export default ApprovalPage;
