// DOM Elements
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const filterSelect = document.getElementById('filterSelect');
const prioritySelect = document.getElementById('prioritySelect');
const sortSelect = document.getElementById('sortSelect');
const taskCount = document.getElementById('taskCount');
const clearCompleted = document.getElementById('clearCompleted');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const priorityInput = document.getElementById('priorityInput');
const dueDateInput = document.getElementById('dueDateInput');
const categoryInput = document.getElementById('categoryInput');
const taskNotes = document.getElementById('taskNotes');
const highPriorityCount = document.getElementById('highPriorityCount');
const overdueCount = document.getElementById('overdueCount');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const tagInput = document.getElementById('tagInput');
const tagColors = document.getElementById('tagColors');
const subtaskInput = document.getElementById('subtaskInput');
const addSubtaskBtn = document.getElementById('addSubtaskBtn');
const subtasksList = document.getElementById('subtasksList');
const statsChart = document.getElementById('statsChart');
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const categoriesModal = document.getElementById('categoriesModal');
const categoriesList = document.getElementById('categoriesList');
const newCategoryInput = document.getElementById('newCategoryInput');
const categoryColor = document.getElementById('categoryColor');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const taskDetailsModal = document.getElementById('taskDetailsModal');
const taskDetailsContent = document.getElementById('taskDetailsContent');
const shortcutsModal = document.getElementById('shortcutsModal');
const statsModal = document.getElementById('statsModal');
const completionRate = document.getElementById('completionRate');
const avgTasksPerDay = document.getElementById('avgTasksPerDay');
const mostProductiveDay = document.getElementById('mostProductiveDay');
const taskStreak = document.getElementById('taskStreak');
const completionChart = document.getElementById('completionChart');

// Task array to store all tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentSubtasks = [];
let selectedTagColor = '#ff0000';

// Theme management
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

// Add categories management
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { name: 'Work', color: '#667eea' },
    { name: 'Personal', color: '#48bb78' },
    { name: 'Shopping', color: '#ed8936' }
];

// Initialize the app
function init() {
    renderTasks();
    updateTaskCount();
    updateStats();
    setMinDate();
    setupDragAndDrop();
    setupChart();
    setupNotifications();
    initNewFeatures();
}

// Set minimum date for due date input
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.min = today;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Create a new task
function createTask(text, priority = 'medium', dueDate = null, category = '', notes = '', tags = [], subtasks = []) {
    const task = {
        id: Date.now(),
        text,
        completed: false,
        priority,
        dueDate,
        category,
        notes,
        tags,
        subtasks,
        createdAt: new Date()
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
    updateTaskCount();
    updateStats();
    updateChart();
    clearInputs();
    checkReminders();
}

// Clear input fields after adding a task
function clearInputs() {
    taskInput.value = '';
    priorityInput.value = 'medium';
    dueDateInput.value = '';
    categoryInput.value = '';
    taskNotes.value = '';
    tagInput.value = '';
    currentSubtasks = [];
    renderSubtasks();
}

// Add subtask
function addSubtask(text) {
    if (text.trim()) {
        currentSubtasks.push({
            id: Date.now(),
            text: text.trim(),
            completed: false
        });
        renderSubtasks();
        subtaskInput.value = '';
    }
}

// Render subtasks
function renderSubtasks() {
    subtasksList.innerHTML = currentSubtasks.map(subtask => `
        <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
            <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
            <span class="subtask-text">${subtask.text}</span>
            <button class="delete-subtask" data-id="${subtask.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    // Add event listeners
    subtasksList.querySelectorAll('input[type="checkbox"]').forEach((checkbox, index) => {
        checkbox.addEventListener('change', () => toggleSubtask(index));
    });

    subtasksList.querySelectorAll('.delete-subtask').forEach(btn => {
        btn.addEventListener('click', (e) => deleteSubtask(e.target.closest('.delete-subtask').dataset.id));
    });
}

// Toggle subtask
function toggleSubtask(index) {
    currentSubtasks[index].completed = !currentSubtasks[index].completed;
    renderSubtasks();
}

// Delete subtask
function deleteSubtask(id) {
    currentSubtasks = currentSubtasks.filter(subtask => subttask.id !== parseInt(id));
    renderSubtasks();
}

// Setup tag color selection
tagColors.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedTagColor = btn.dataset.color;
        tagColors.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

// Parse tags from input
function parseTags(input) {
    return input.split(',').map(tag => ({
        text: tag.trim(),
        color: selectedTagColor
    })).filter(tag => tag.text);
}

// Setup drag and drop
function setupDragAndDrop() {
    taskList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.dataset.id);
        }
    });

    taskList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.classList.remove('dragging');
            taskList.querySelectorAll('.task-item').forEach(item => {
                item.classList.remove('drag-over');
            });
        }
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = taskList.querySelector('.dragging');
        if (!draggingItem) return;

        const afterElement = getDragAfterElement(taskList, e.clientY);
        const draggable = document.querySelector('.dragging');

        if (afterElement) {
            taskList.insertBefore(draggable, afterElement);
        } else {
            taskList.appendChild(draggable);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Setup chart
function setupChart() {
    const ctx = statsChart.getContext('2d');
    window.taskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                label: 'Tasks by Priority',
                data: [0, 0, 0],
                backgroundColor: [
                    '#f56565',
                    '#ed8936',
                    '#48bb78'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Update chart
function updateChart() {
    const highPriority = tasks.filter(task => task.priority === 'high' && !task.completed).length;
    const mediumPriority = tasks.filter(task => task.priority === 'medium' && !task.completed).length;
    const lowPriority = tasks.filter(task => task.priority === 'low' && !task.completed).length;

    window.taskChart.data.datasets[0].data = [highPriority, mediumPriority, lowPriority];
    window.taskChart.update();
}

// Setup notifications
function setupNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}

// Check reminders
function checkReminders() {
    const now = new Date();
    tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate - now;
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            if (hoursDiff <= 24 && hoursDiff > 0) {
                showNotification(`Task "${task.text}" is due in ${Math.round(hoursDiff)} hours!`);
            }
        }
    });
}

// Show notification
function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('Task Reminder', {
            body: message,
            icon: '/path/to/icon.png'
        });
    }
}

// Export tasks
function exportTasks() {
    const dataStr = JSON.stringify(tasks);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'tasks.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import tasks
function importTasks(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            tasks = importedTasks;
            saveTasks();
            renderTasks();
            updateTaskCount();
            updateStats();
            updateChart();
            showNotification('Tasks imported successfully!');
        } catch (error) {
            showNotification('Error importing tasks. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

// Render tasks based on filters
function renderTasks() {
    const filterValue = filterSelect.value;
    const priorityValue = prioritySelect.value;
    const sortValue = sortSelect.value;
    const searchValue = searchInput.value.toLowerCase();

    let filteredTasks = tasks;

    // Apply filters
    if (filterValue === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (filterValue === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (priorityValue !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityValue);
    }

    // Apply search
    if (searchValue) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchValue) ||
            task.category.toLowerCase().includes(searchValue) ||
            task.notes.toLowerCase().includes(searchValue) ||
            task.tags.some(tag => tag.text.toLowerCase().includes(searchValue))
        );
    }

    // Sort tasks
    filteredTasks.sort((a, b) => {
        switch (sortValue) {
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'dueDate':
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'created':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'progress':
                const progressA = a.subtasks.length ? 
                    a.subtasks.filter(st => st.completed).length / a.subtasks.length : 0;
                const progressB = b.subtasks.length ? 
                    b.subtasks.filter(st => st.completed).length / b.subtasks.length : 0;
                return progressB - progressA;
            default:
                return 0;
        }
    });

    taskList.innerHTML = '';
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.draggable = true;
        li.dataset.id = task.id;
        
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const progress = task.subtasks.length ? 
            task.subtasks.filter(st => st.completed).length / task.subtasks.length : 0;
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
                    ${task.dueDate ? `
                        <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    ` : ''}
                </div>
                ${task.tags.length ? `
                    <div class="task-tags">
                        ${task.tags.map(tag => `
                            <span class="task-tag" style="background: ${tag.color}">${tag.text}</span>
                        `).join('')}
                    </div>
                ` : ''}
                ${task.subtasks.length ? `
                    <div class="task-progress">
                        <div class="task-progress-bar" style="width: ${progress * 100}%"></div>
                    </div>
                    <div class="subtasks-list">
                        ${task.subtasks.map(subtask => `
                            <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                                <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                                <span class="subtask-text">${subtask.text}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="details-btn" title="View details"><i class="fas fa-info-circle"></i></button>
                <button class="edit-btn" title="Edit task"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Delete task"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Add event listeners
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => editTask(task.id));

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Add subtask event listeners
        li.querySelectorAll('.subtask-item input[type="checkbox"]').forEach((checkbox, index) => {
            checkbox.addEventListener('change', () => toggleTaskSubtask(task.id, index));
        });

        const detailsBtn = li.querySelector('.details-btn');
        detailsBtn.addEventListener('click', () => showTaskDetails(task.id));

        taskList.appendChild(li);
    });
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateTaskCount();
        updateStats();
        updateChart();
        checkReminders();
    }
}

// Toggle subtask completion
function toggleTaskSubtask(taskId, subtaskIndex) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subtasks[subtaskIndex]) {
        task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
        saveTasks();
        renderTasks();
        updateTaskCount();
        updateStats();
        updateChart();
    }
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }
}

// Delete task
function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (!taskElement) return;

    // Add delete animation class
    taskElement.classList.add('deleting');

    // Create and show confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'delete-dialog';
    dialog.innerHTML = `
        <div class="delete-dialog-content">
            <h3>Delete Task</h3>
            <p>Are you sure you want to delete "${task.text}"?</p>
            <div class="delete-dialog-actions">
                <button class="cancel-delete">Cancel</button>
                <button class="confirm-delete">Delete</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // Add event listeners for dialog buttons
    dialog.querySelector('.cancel-delete').addEventListener('click', () => {
        taskElement.classList.remove('deleting');
        dialog.remove();
    });

    dialog.querySelector('.confirm-delete').addEventListener('click', () => {
        // Remove task from array
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        
        // Add fade out animation
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'translateX(100%)';
        
        // Remove task after animation
        setTimeout(() => {
            renderTasks();
            updateTaskCount();
            updateStats();
            updateChart();
            showNotification('Task deleted successfully!');
        }, 300);
        
        dialog.remove();
    });
}

// Update task count
function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} remaining`;
}

// Update statistics
function updateStats() {
    const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed).length;
    const overdueTasks = tasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < new Date() && 
        !task.completed
    ).length;

    highPriorityCount.textContent = `${highPriorityTasks} high priority`;
    overdueCount.textContent = `${overdueTasks} overdue`;
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Event Listeners
addButton.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text) {
        createTask(
            text,
            priorityInput.value,
            dueDateInput.value || null,
            categoryInput.value.trim(),
            taskNotes.value.trim(),
            parseTags(tagInput.value),
            [...currentSubtasks]
        );
    }
});

addSubtaskBtn.addEventListener('click', () => {
    addSubtask(subtaskInput.value);
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = taskInput.value.trim();
        if (text) {
            createTask(
                text,
                priorityInput.value,
                dueDateInput.value || null,
                categoryInput.value.trim(),
                taskNotes.value.trim(),
                parseTags(tagInput.value),
                [...currentSubtasks]
            );
        }
    }
});

filterSelect.addEventListener('change', renderTasks);
prioritySelect.addEventListener('change', renderTasks);
sortSelect.addEventListener('change', renderTasks);
searchInput.addEventListener('input', renderTasks);

exportBtn.addEventListener('click', exportTasks);

importBtn.addEventListener('click', () => {
    importFile.click();
});

importFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        importTasks(e.target.files[0]);
        e.target.value = '';
    }
});

clearCompleted.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all completed tasks?')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateTaskCount();
        updateStats();
        updateChart();
    }
});

// Add categories management
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

function renderCategories() {
    categoriesList.innerHTML = categories.map((category, index) => `
        <div class="category-item">
            <div class="category-info">
                <div class="category-color" style="background: ${category.color}"></div>
                <span>${category.name}</span>
            </div>
            <div class="category-actions">
                <button class="edit-category" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-category" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    categoriesList.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', (e) => editCategory(e.target.closest('.edit-category').dataset.index));
    });

    categoriesList.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', (e) => deleteCategory(e.target.closest('.delete-category').dataset.index));
    });
}

function addCategory() {
    const name = newCategoryInput.value.trim();
    const color = categoryColor.value;
    
    if (name && !categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        categories.push({ name, color });
        saveCategories();
        renderCategories();
        newCategoryInput.value = '';
        updateCategorySelect();
    }
}

function editCategory(index) {
    const category = categories[index];
    const newName = prompt('Edit category name:', category.name);
    if (newName && newName.trim()) {
        categories[index].name = newName.trim();
        saveCategories();
        renderCategories();
        updateCategorySelect();
    }
}

function deleteCategory(index) {
    if (confirm('Are you sure you want to delete this category? This will remove the category from all tasks.')) {
        categories.splice(index, 1);
        saveCategories();
        renderCategories();
        updateCategorySelect();
        
        // Remove category from all tasks
        tasks = tasks.map(task => ({
            ...task,
            category: task.category === categories[index].name ? '' : task.category
        }));
        saveTasks();
        renderTasks();
    }
}

function updateCategorySelect() {
    categoryInput.innerHTML = `
        <option value="">Select Category</option>
        ${categories.map(category => `
            <option value="${category.name}">${category.name}</option>
        `).join('')}
    `;
}

// Modal management
function showModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Task details
function showTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    const progress = task.subtasks.length ? 
        task.subtasks.filter(st => st.completed).length / task.subtasks.length : 0;

    taskDetailsContent.innerHTML = `
        <div class="task-details-header">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <h3 class="task-details-title">${task.text}</h3>
        </div>
        <div class="task-details-meta">
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
            ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
            ${task.dueDate ? `
                <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    <i class="fas fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString()}
                </span>
            ` : ''}
        </div>
        ${task.tags.length ? `
            <div class="task-details-section">
                <h3>Tags</h3>
                <div class="task-tags">
                    ${task.tags.map(tag => `
                        <span class="task-tag" style="background: ${tag.color}">${tag.text}</span>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        ${task.subtasks.length ? `
            <div class="task-details-section">
                <h3>Subtasks</h3>
                <div class="task-progress">
                    <div class="task-progress-bar" style="width: ${progress * 100}%"></div>
                </div>
                <div class="subtasks-list">
                    ${task.subtasks.map(subtask => `
                        <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                            <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                            <span class="subtask-text">${subtask.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        ${task.notes ? `
            <div class="task-details-section">
                <h3>Notes</h3>
                <div class="task-notes">${task.notes}</div>
            </div>
        ` : ''}
    `;

    // Add event listeners
    const checkbox = taskDetailsContent.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => {
        toggleTask(task.id);
        hideModal(taskDetailsModal);
    });

    taskDetailsContent.querySelectorAll('.subtask-item input[type="checkbox"]').forEach((checkbox, index) => {
        checkbox.addEventListener('change', () => toggleTaskSubtask(task.id, index));
    });

    showModal(taskDetailsModal);
}

// Statistics
function updateStatistics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRateValue = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate average tasks per day
    const taskDates = tasks.map(task => new Date(task.createdAt).toLocaleDateString());
    const uniqueDates = [...new Set(taskDates)];
    const avgTasksPerDayValue = uniqueDates.length ? 
        Math.round(totalTasks / uniqueDates.length) : 0;

    // Find most productive day
    const dateCounts = taskDates.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    
    const mostProductiveDayValue = Object.entries(dateCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '-';

    // Calculate task streak
    const today = new Date().toLocaleDateString();
    let streak = 0;
    let currentDate = new Date();
    
    while (taskDates.includes(currentDate.toLocaleDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    // Update UI
    completionRate.textContent = `${completionRateValue}%`;
    avgTasksPerDay.textContent = avgTasksPerDayValue;
    mostProductiveDay.textContent = mostProductiveDayValue;
    taskStreak.textContent = `${streak} days`;

    // Update completion chart
    const ctx = completionChart.getContext('2d');
    if (window.completionChart) {
        window.completionChart.destroy();
    }

    window.completionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: uniqueDates,
            datasets: [{
                label: 'Tasks Completed',
                data: uniqueDates.map(date => dateCounts[date] || 0),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N: Add new task
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            taskInput.focus();
        }
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
        // Ctrl/Cmd + D: Toggle dark mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            themeToggle.click();
        }
        // Ctrl/Cmd + H: Show/hide shortcuts
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            shortcutsModal.classList.toggle('active');
        }
    });
}

// Event listeners for modals
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        hideModal(modal);
    });
});

manageCategoriesBtn.addEventListener('click', () => {
    renderCategories();
    showModal(categoriesModal);
});

addCategoryBtn.addEventListener('click', addCategory);

// Initialize new features
function initNewFeatures() {
    updateCategorySelect();
    setupKeyboardShortcuts();
    updateStatistics();
}

// Initialize the app when the page loads
init(); 