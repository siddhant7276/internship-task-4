// Task Management System
let tasks = [];
let currentFilter = 'all';
let currentCategory = null;
let editingTaskId = null;
let categories = ['work', 'personal', 'shopping', 'health'];

// Category colors
const categoryColors = {
    work: '#3b82f6',
    personal: '#10b981',
    shopping: '#f59e0b',
    health: '#ef4444'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTasksFromStorage();
    loadThemeFromStorage();
    renderTasks();
    updateStats();
    updateCounts();
    console.log('✓ TaskMaster initialized successfully!');
});

// Add task (quick add)
function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    
    if (!title) {
        showToast('Please enter a task title');
        return;
    }
    
    const task = {
        id: Date.now(),
        title: title,
        description: '',
        completed: false,
        date: '',
        time: '',
        category: 'personal',
        priority: 'medium',
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    input.value = '';
    
    saveTasksToStorage();
    renderTasks();
    updateStats();
    updateCounts();
    showToast('Task added successfully! ✓');
}

// Handle Enter key in task input
function handleTaskInputKeypress(event) {
    if (event.key === 'Enter') {
        addTask();
    }
}

// Show advanced add modal
function showAdvancedAdd() {
    document.getElementById('advancedAddModal').classList.add('active');
    document.getElementById('advTaskTitle').focus();
}

// Close advanced add modal
function closeAdvancedAdd() {
    document.getElementById('advancedAddModal').classList.remove('active');
    clearAdvancedForm();
}

// Clear advanced form
function clearAdvancedForm() {
    document.getElementById('advTaskTitle').value = '';
    document.getElementById('advTaskDesc').value = '';
    document.getElementById('advTaskDate').value = '';
    document.getElementById('advTaskTime').value = '';
    document.getElementById('advTaskCategory').value = 'work';
    document.getElementById('advTaskPriority').value = 'medium';
}

// Add advanced task
function addAdvancedTask() {
    const title = document.getElementById('advTaskTitle').value.trim();
    const description = document.getElementById('advTaskDesc').value.trim();
    const date = document.getElementById('advTaskDate').value;
    const time = document.getElementById('advTaskTime').value;
    const category = document.getElementById('advTaskCategory').value;
    const priority = document.getElementById('advTaskPriority').value;
    
    if (!title) {
        showToast('Please enter a task title');
        return;
    }
    
    const task = {
        id: Date.now(),
        title: title,
        description: description,
        completed: false,
        date: date,
        time: time,
        category: category,
        priority: priority,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    
    saveTasksToStorage();
    renderTasks();
    updateStats();
    updateCounts();
    closeAdvancedAdd();
    showToast('Task added successfully! ✓');
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
        updateStats();
        updateCounts();
        
        if (task.completed) {
            showToast('Task completed! 🎉');
        }
    }
}

// Show edit modal
function editTask(id) {
    editingTaskId = id;
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDesc').value = task.description || '';
        document.getElementById('editTaskDate').value = task.date || '';
        document.getElementById('editTaskTime').value = task.time || '';
        document.getElementById('editTaskCategory').value = task.category;
        document.getElementById('editTaskPriority').value = task.priority;
        
        document.getElementById('editTaskModal').classList.add('active');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editTaskModal').classList.remove('active');
    editingTaskId = null;
}

// Save edited task
function saveEditedTask() {
    const task = tasks.find(t => t.id === editingTaskId);
    
    if (task) {
        task.title = document.getElementById('editTaskTitle').value.trim();
        task.description = document.getElementById('editTaskDesc').value.trim();
        task.date = document.getElementById('editTaskDate').value;
        task.time = document.getElementById('editTaskTime').value;
        task.category = document.getElementById('editTaskCategory').value;
        task.priority = document.getElementById('editTaskPriority').value;
        
        if (!task.title) {
            showToast('Please enter a task title');
            return;
        }
        
        saveTasksToStorage();
        renderTasks();
        updateStats();
        updateCounts();
        closeEditModal();
        showToast('Task updated successfully! ✓');
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasksToStorage();
        renderTasks();
        updateStats();
        updateCounts();
        showToast('Task deleted');
    }
}

// Filter by list
function filterByList(list) {
    currentFilter = list;
    currentCategory = null;
    
    // Update active state
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-list="${list}"]`).classList.add('active');
    
    // Remove active from categories
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Update view title
    const titles = {
        all: { title: 'All Tasks', desc: 'Showing all your tasks' },
        today: { title: 'Today', desc: 'Tasks due today' },
        upcoming: { title: 'Upcoming', desc: 'Tasks scheduled for later' },
        completed: { title: 'Completed', desc: 'All completed tasks' }
    };
    
    document.getElementById('currentViewTitle').textContent = titles[list].title;
    document.getElementById('currentViewDesc').textContent = titles[list].desc;
    
    renderTasks();
}

// Filter by category
function filterByCategory(category) {
    currentFilter = 'category';
    currentCategory = category;
    
    // Update active state
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Remove active from lists
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Update view title
    document.getElementById('currentViewTitle').textContent = category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('currentViewDesc').textContent = `Tasks in ${category} category`;
    
    renderTasks();
}

// Get filtered tasks
function getFilteredTasks() {
    let filtered = [...tasks];
    
    // Apply list filter
    if (currentFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(task => task.date === today);
    } else if (currentFilter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(task => task.date && task.date > today);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(task => task.completed);
    } else if (currentFilter === 'category' && currentCategory) {
        filtered = filtered.filter(task => task.category === currentCategory);
    }
    
    // Apply priority filter
    const priorityFilter = document.getElementById('filterPriority').value;
    if (priorityFilter !== 'all') {
        filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    return filtered;
}

// Sort tasks
function sortTasks() {
    const sortBy = document.getElementById('sortSelect').value;
    
    tasks.sort((a, b) => {
        switch(sortBy) {
            case 'date':
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(a.date) - new Date(b.date);
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'name':
                return a.title.localeCompare(b.title);
            case 'status':
                return a.completed - b.completed;
            default:
                return 0;
        }
    });
    
    renderTasks();
}

// Filter tasks
function filterTasks() {
    renderTasks();
}

// Render tasks
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');
    const filtered = getFilteredTasks();
    
    if (filtered.length === 0) {
        tasksList.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';
        
        tasksList.innerHTML = filtered.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                >
                <div class="task-content">
                    <div class="task-header">
                        <div class="task-title">${escapeHtml(task.title)}</div>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        <span class="task-category" style="background: ${categoryColors[task.category]}20; color: ${categoryColors[task.category]}">${task.category}</span>
                    </div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        ${task.date ? `<div class="task-date">📅 ${formatDate(task.date)}</div>` : ''}
                        ${task.time ? `<div class="task-time">🕐 ${task.time}</div>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit" onclick="editTask(${task.id})" title="Edit">
                        ✏️
                    </button>
                    <button class="task-btn delete" onclick="deleteTask(${task.id})" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
}

// Update counts
function updateCounts() {
    const today = new Date().toISOString().split('T')[0];
    
    // List counts
    document.getElementById('countAll').textContent = tasks.length;
    document.getElementById('countToday').textContent = tasks.filter(t => t.date === today).length;
    document.getElementById('countUpcoming').textContent = tasks.filter(t => t.date && t.date > today).length;
    document.getElementById('countCompleted').textContent = tasks.filter(t => t.completed).length;
    
    // Category counts
    document.getElementById('countWork').textContent = tasks.filter(t => t.category === 'work').length;
    document.getElementById('countPersonal').textContent = tasks.filter(t => t.category === 'personal').length;
    document.getElementById('countShopping').textContent = tasks.filter(t => t.category === 'shopping').length;
    document.getElementById('countHealth').textContent = tasks.filter(t => t.category === 'health').length;
}

// Clear completed tasks
function clearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        showToast('No completed tasks to clear');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasksToStorage();
        renderTasks();
        updateStats();
        updateCounts();
        showToast(`${completedCount} completed task(s) deleted`);
    }
}

// Export tasks
function exportTasks() {
    if (tasks.length === 0) {
        showToast('No tasks to export');
        return;
    }
    
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Tasks exported successfully! 📤');
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    document.getElementById('themeIcon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    localStorage.setItem('todoTheme', newTheme);
    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`);
}

// Load theme from storage
function loadThemeFromStorage() {
    const savedTheme = localStorage.getItem('todoTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeIcon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Save tasks to localStorage
function saveTasksToStorage() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasksFromStorage() {
    const saved = localStorage.getItem('todoTasks');
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading tasks:', e);
            tasks = [];
        }
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate.getTime() === today.getTime()) {
        return 'Today';
    } else if (compareDate.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
    } else {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show add category modal (placeholder)
function showAddCategoryModal() {
    showToast('Custom categories coming soon!');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + N - Advanced add
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        showAdvancedAdd();
    }
    
    // Escape - Close modals
    if (event.key === 'Escape') {
        closeAdvancedAdd();
        closeEditModal();
    }
    
    // Ctrl/Cmd + E - Export
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        exportTasks();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const advModal = document.getElementById('advancedAddModal');
    const editModal = document.getElementById('editTaskModal');
    
    if (event.target === advModal) {
        closeAdvancedAdd();
    }
    if (event.target === editModal) {
        closeEditModal();
    }
}

// Check for overdue tasks
function checkOverdueTasks() {
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => !t.completed && t.date && t.date < today);
    
    if (overdue.length > 0) {
        console.log(`⚠️ You have ${overdue.length} overdue task(s)`);
    }
}

// Run overdue check on load
checkOverdueTasks();

// Console info
console.log(`
✓ TaskMaster To-Do App
━━━━━━━━━━━━━━━━━━━━━━━━
Keyboard Shortcuts:
  Ctrl/Cmd + N - Advanced Add
  Ctrl/Cmd + E - Export Tasks
  ESC - Close Modal
  Enter - Quick Add Task
━━━━━━━━━━━━━━━━━━━━━━━━
Features:
  ✓ Add/Edit/Delete Tasks
  ✓ Set Due Dates & Times
  ✓ Categorize & Prioritize
  ✓ Filter & Sort
  ✓ Mark as Complete
  ✓ Export to JSON
  ✓ Dark/Light Theme
  ✓ LocalStorage Persistence
━━━━━━━━━━━━━━━━━━━━━━━━
`);