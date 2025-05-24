import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "@/contexts/AuthContext"
import { UsersRound, Copy, Check, Trash2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"

interface Student {
  _id: string;
  name: string;
  email: string;
  status: string;
}

interface BatchStudent {
  student: Student;
  status: string;
  _id: string;
}

interface Batch {
  _id: string;
  name: string;
  batchCode: string;
  students: BatchStudent[];
  createdAt: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
  const [batchName, setBatchName] = useState('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isLoadingBatchDetails, setIsLoadingBatchDetails] = useState(false);
  const [copiedBatchCode, setCopiedBatchCode] = useState<string | null>(null);
  const { admin, isLoggedIn, signout } = useAuth()

  const adminId = admin?._id || '682ed16498401f9e9bbbb43a';

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setIsLoadingBatches(true);
      const response = await axios.post(`${BACKEND_URL}/api/batch/all`, {
        adminId
      });
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const handleCreateBatch = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/batch/create`, {
        name: batchName,
        adminId
      });
      setBatches([...batches, response.data.batch]);
      setIsModalOpen(false);
      setBatchName('');
      toast.success('Batch created successfully');
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchClick = async (batchId: string) => {
    try {
      setIsLoadingBatchDetails(true);
      const response = await axios.get(`${BACKEND_URL}/api/batch/${batchId}`);
      setSelectedBatch(response.data);
    } catch (error) {
      console.error('Error fetching batch details:', error);
      toast.error('Failed to fetch batch details');
    } finally {
      setIsLoadingBatchDetails(false);
    }
  };

  const handleUpdateStatus = async (batchId: string, studentId: string, status: string) => {
    try {
      setUpdatingStatus(studentId);
      await axios.put(`${BACKEND_URL}/api/batch/update-status`, {
        batchId,
        studentId,
        status,
        adminId
      });
      
      // Update the local state to reflect the change
      if (selectedBatch) {
        const updatedStudents = selectedBatch.students.map(student => {
          if (student.student._id === studentId) {
            return {
              ...student,
              status,
              student: {
                ...student.student,
                status
              }
            };
          }
          return student;
        });
        
        setSelectedBatch({
          ...selectedBatch,
          students: updatedStudents
        });
      }
      toast.success(`Student status updated to ${status}`);
    } catch (error) {
      console.error('Error updating student status:', error);
      toast.error('Failed to update student status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCopyBatchCode = async (batchCode: string) => {
    try {
      await navigator.clipboard.writeText(batchCode);
      setCopiedBatchCode(batchCode);
      toast.success('Batch code copied to clipboard');
      setTimeout(() => setCopiedBatchCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy batch code:', error);
      toast.error('Failed to copy batch code');
    }
  };

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/api/batch/delete`, {
        data: {
          batchId: batchToDelete._id,
          adminId
        }
      });
      
      // Remove the deleted batch from the list
      setBatches(batches.filter(batch => batch._id !== batchToDelete._id));
      
      // If the deleted batch was selected, clear the selection
      if (selectedBatch?._id === batchToDelete._id) {
        setSelectedBatch(null);
      }
      
      setIsDeleteModalOpen(false);
      setBatchToDelete(null);
      toast.success('Batch deleted successfully');
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    } finally {
      setLoading(false);
    }
  };

  const BatchListSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  const BatchDetailsSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3 mb-6" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/4 mb-4" />
        {[1, 2].map((i) => (
          <div key={i} className="p-4 border rounded-lg dark:border-gray-700">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 p-6 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
          <UsersRound className='h-5 w-5' />
          Batches</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Batch
        </button>
      </div>

      {/* Create Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Batch</h2>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Enter batch name"
              className="w-full p-2 border rounded-lg mb-4 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBatch}
                disabled={loading || !batchName}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && batchToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Delete Batch</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the batch "{batchToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setBatchToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBatch}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch List and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Batch List */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">All Batches</h2>
          {isLoadingBatches ? (
            <BatchListSkeleton />
          ) : (
            <div className="space-y-2">
              {batches.map((batch) => (
                <div
                  key={batch._id}
                  onClick={() => handleBatchClick(batch._id)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedBatch?._id === batch._id
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{batch.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Code: {batch.batchCode}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyBatchCode(batch.batchCode);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          {copiedBatchCode === batch.batchCode ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBatchToDelete(batch);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Batch Details */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          {isLoadingBatchDetails ? (
            <BatchDetailsSkeleton />
          ) : selectedBatch ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedBatch.name}
                </h2>
                <button
                  onClick={() => {
                    setBatchToDelete(selectedBatch);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Batch Code</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedBatch.batchCode}</p>
                    <button
                      onClick={() => handleCopyBatchCode(selectedBatch.batchCode)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      {copiedBatchCode === selectedBatch.batchCode ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Created At</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedBatch.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Students List */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Students</h3>
                  {selectedBatch.students.length > 0 ? (
                    <div className="space-y-3">
                      {selectedBatch.students.map((batchStudent) => (
                        <div
                          key={batchStudent._id}
                          className="p-4 border rounded-lg dark:border-gray-700"
                        >
                          <div className="flex justify-between flex-col md:flex-row items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {batchStudent.student.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {batchStudent.student.email}
                              </p>
                              <p className={`text-sm ${
                                batchStudent.status === 'Accepted' 
                                  ? 'text-green-600 dark:text-green-400'
                                  : batchStudent.status === 'Rejected'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-yellow-600 dark:text-yellow-400'
                              }`}>
                                Status: {batchStudent.status}
                              </p>
                            </div>
                            {batchStudent.status === 'Pending' && (
                              <div className="flex gap-2 mt-2 md:mt-0">
                                <button
                                  onClick={() => handleUpdateStatus(selectedBatch._id, batchStudent.student._id, 'Accepted')}
                                  disabled={updatingStatus === batchStudent.student._id}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  {updatingStatus === batchStudent.student._id ? 'Updating...' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(selectedBatch._id, batchStudent.student._id, 'Rejected')}
                                  disabled={updatingStatus === batchStudent.student._id}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                  {updatingStatus === batchStudent.student._id ? 'Updating...' : 'Reject'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No students in this batch yet</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Select a batch to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
