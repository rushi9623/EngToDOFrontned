const API_BASE_URL = 'http://localhost:5000/api';

// mapping betn frontend and backend words

const STATUS_MAP = {
  // Frontend -> Backendc
  'Not Started': 'pending',
  'In Progress': 'in-progress', 
  'Completed': 'completed',
  // Backend -> Frontend
  'pending': 'Not Started',
  'in-progress': 'In Progress',
  'completed': 'Completed'
};

const PRIORITY_MAP = {
    // FRONT -> BACKEND
    'Low' : 'low',
    'Normal' : 'medium',
    'High' : 'high',
    // BACK -> FRONT
    'low' : 'Low',
    'medium' : 'Normal',
    'high' : 'High'
};

 const transformTaskFromBackend = (backendTask) => {
  return {
    id: backendTask._id,
    assignedTo: backendTask.assignedTo || 'Unassigned',
    status: STATUS_MAP[backendTask.status] || backendTask.status,
    dueDate: new Date(backendTask.createdAt).toLocaleDateString('en-GB'),
    priority: PRIORITY_MAP[backendTask.priority] || backendTask.priority,
    comments: backendTask.description || backendTask.title || 'No description',
    title: backendTask.title,
    description: backendTask.description,
    createdAt: backendTask.createdAt,
    updatedAt: backendTask.updatedAt
  };
};

// transform frontend task to backend task
 const transformTaskToBackend = (frontendTask) => {
  return {
    title: frontendTask.title || `Task for ${frontendTask.assignedTo}`,
    assignedTo: frontendTask.assignedTo,
    description: frontendTask.description || frontendTask.comments || '',
    status: STATUS_MAP[frontendTask.status] || frontendTask.status,
    priority: PRIORITY_MAP[frontendTask.priority] || frontendTask.priority
  };
};


// api fun 
export const taskService = {
    // Get all tasks
    async getAllTasks() {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`);
            const data = await response.json();
            if(!response.ok){
                throw new Error(data.message || 'Failed to fetch tasks');
            }
            return {
                success: true,
                tasks: data.data.map(transformTaskFromBackend),
                count: data.count
            };
        
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return{
                success: false,
                error: error.message 
            }
        }
    },
    // Create a new task
    async createTask(taskData){
        try {
            const response = await fetch(`${API_BASE_URL}/task`,{ // Fixed typo: respones -> response
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transformTaskToBackend(taskData))
            });
             const data = await response.json();
        
        if(!response.ok){
            throw new Error(data.message || 'Failed to create task');
        }
        return{
            success: true,
            task: transformTaskFromBackend(data.data)
        };
        
    }catch (error) {
            console.error('Error creating task:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    // Update a task by ID
     async updateTask(taskId, taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformTaskToBackend(taskData))
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task');
      }
      
      return {
        success: true,
        task: transformTaskFromBackend(data.data)
      };
    } catch (error) {
      console.error('Error updating task:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Delete a task by ID
   async deleteTask(taskId) {
    try {
      const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete task');
      }
      
      return {
        success: true,
        task: data.data
      };
    } catch (error) {
      console.error('Error deleting task:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};
