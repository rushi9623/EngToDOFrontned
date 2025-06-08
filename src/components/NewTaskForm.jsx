import React, { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

const NewTaskForm = ({ isOpen, onClose, onSave, taskToEdit = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    status: 'Not Started',
    dueDate: '',
    priority: 'Normal',
    description: ''
  });

  // Initialize form data when editing a task
  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        assignedTo: taskToEdit.assignedTo || '',
        status: taskToEdit.status || 'Not Started',
        dueDate: taskToEdit.dueDate ? formatDateForInput(taskToEdit.dueDate) : '',
        priority: taskToEdit.priority || 'Normal',
        description: taskToEdit.description || taskToEdit.comments || ''
      });
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        assignedTo: '',
        status: 'Not Started',
        dueDate: '',
        priority: 'Normal',
        description: ''
      });
    }
  }, [taskToEdit, isOpen]);

  // Convert date from display format (DD/MM/YYYY) to input format (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (dateString.includes('-') && dateString.length === 10) {
      return dateString;
    }
    
    // If it's in DD/MM/YYYY format, convert it
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    if (!formData.assignedTo.trim()) {
      alert('Please enter who this task is assigned to');
      return;
    }
    
    // Pass the task data along with the task ID if editing
    const taskData = {
      ...formData,
      ...(taskToEdit && { id: taskToEdit.id }) // Include ID for updates
    };
    
    onSave(taskData, taskToEdit ? 'edit' : 'create');
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      assignedTo: '',
      status: 'Not Started', 
      dueDate: '',
      priority: 'Normal',
      description: ''
    });
  };

  // Get current date in YYYY-MM-DD format for date input
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  const isEditing = !!taskToEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-700">
              {isEditing ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Title Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Assigned To
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter assignee name"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  min={getCurrentDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Enter task description..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-yellow-200 hover:bg-yellow-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              {isEditing ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTaskForm;