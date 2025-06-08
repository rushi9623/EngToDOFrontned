import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Menu, ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { taskService } from '../services/taskService';
import NewTaskForm from './NewTaskForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const TaskTable = () => {
  const [showDropdown, setShowDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await taskService.getAllTasks();
      if (result.success) {
        setTasks(result.tasks);
      } else {
        setError(result.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchTasks();
  };

  // Handle delete task - show confirmation modal
  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
    setShowDropdown(null);
  };

  // Confirm and execute delete
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const result = await taskService.deleteTask(taskToDelete.id);
      if (result.success) {
        // Remove task from local state
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
        setShowDeleteModal(false);
        setTaskToDelete(null);
      } else {
        setError(result.error || 'Failed to delete task');
        setShowDeleteModal(false);
        setTaskToDelete(null);
      }
    } catch (err) {
      setError('An unexpected error occurred while deleting task');
      console.error('Error deleting task:', err);
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowNewTaskModal(true);
    setShowDropdown(null);
  };

  const toggleDropdown = (taskId) => {
    setShowDropdown(showDropdown === taskId ? null : taskId);
  };

  const handleTaskSave = async (taskData, action) => {
    try {
      if (action === 'edit') {
        // Update existing task
        const result = await taskService.updateTask(taskData.id, taskData);
        if (result.success) {
          // Update task in local state
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === taskData.id ? result.task : task
            )
          );
          setShowNewTaskModal(false);
          setTaskToEdit(null);
        } else {
          setError(result.error || 'Failed to update task');
        }
      } else {
        // Create new task
        const result = await taskService.createTask(taskData);
        if (result.success) {
          // Add new task to local state
          setTasks(prevTasks => [...prevTasks, result.task]);
          setShowNewTaskModal(false);
        } else {
          setError(result.error || 'Failed to create task');
        }
      }
    } catch (err) {
      setError(`An unexpected error occurred while ${action === 'edit' ? 'updating' : 'creating'} task`);
      console.error(`Error ${action === 'edit' ? 'updating' : 'creating'} task:`, err);
    }
  };

  const handleCloseModal = () => {
    setShowNewTaskModal(false);
    setTaskToEdit(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600';
      case 'In Progress':
        return 'text-blue-600';
      case 'Not Started':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Normal':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task =>
    task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.comments.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Title and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
              <Menu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
              <p className="text-sm text-gray-500">All Tasks</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowNewTaskModal(true)}
              className="px-4 py-2 bg-yellow-200 hover:bg-yellow-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              New Task
            </button>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-yellow-200 hover:bg-yellow-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Records Count */}
        <div className="mb-4">
          <span className="text-sm text-gray-600">
            {filteredTasks.length} of {tasks.length} records
          </span>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={fetchTasks}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 w-12">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Assigned To</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Comments</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-blue-600 font-medium">{task.assignedTo}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{task.dueDate}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 truncate max-w-xs" title={task.comments}>
                        {task.comments}
                      </span>
                      <button
                        onClick={() => toggleDropdown(task.id)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {showDropdown === task.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                          <button 
                            onClick={() => handleEditTask(task)}
                            className="w-full px-4 py-2 text-left hover:bg-yellow-50 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task)}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 text-sm font-medium text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* No tasks message */}
        {!loading && !error && filteredTasks.length === 0 && tasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks found. Create your first task!</p>
          </div>
        )}

        {/* No filtered results */}
        {!loading && !error && filteredTasks.length === 0 && tasks.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks match your search criteria.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>20</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</span>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Modal (for both new and edit) */}
      <NewTaskForm 
        isOpen={showNewTaskModal}
        onClose={handleCloseModal}
        onSave={handleTaskSave}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeleteTask}
        taskTitle={taskToDelete?.title || taskToDelete?.assignedTo}
      />
    </div>
  );
};

export default TaskTable;