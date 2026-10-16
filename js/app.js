const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const pendingTasksCount = document.getElementById('pending-tasks-count')

const searchInput = document.getElementById('search-input');
const filterButtons = document.getElementById('filter-buttons');

const resetStoragebtn=document.getElementById('reset-storage-btn');

const STORAGE_KEY = 'edudash_student_tasks';

const defaultTasks = [
    { id: 1, title: 'Review Lesson 3 JavaScript concepts', completed: false},
    { id: 2, title: 'Complete HTML/CSS layout adjustments', completed: true}
];

let tasks=loadTasksFromStorage();

let currentFilter="all";
let searchQuery = '';

function loadTasksFromStorage(){
    try{
        const savedData=localStorage.getItem(STORAGE_KEY)
        if (savedData !== null) {
            return JSON.parse(savedData);
        }
    }catch(error){
        console.error('Failed to retrive or parse data from LocalStorage:', error);
    }
    return defaultTasks;
}

function saveTasksToStorage(){
    try{
        localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks));
    }catch(error){
        console.error('Failed to save data to LocalStorage', error);
    }
}

function renderTasks(){
    taskList.innerHTML = '';
    let filteredTasks=tasks.filter(task=>{
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    })
    if (searchQuery.trim() !== ''){
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li class="list-group-item text-muted text-center py-3">No tasks found. Add a task above!</li>`;
    } else {
        filteredTasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center py-2';

            listItem.innerHTML = `
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input mt-0" type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                    <span class="${task.completed ? 'text-decoration-line-through text-muted' : ''}">${task.title}</span>
                </div>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
            `;
            taskList.appendChild(listItem);
        });
    }
    updateMetrics();
}

taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (title === '') return;

    if (title === '' || title.length < 3){
        taskInput.classList.add('is-invalid');
        return;
    }
    taskInput.classList.remove('is-invalid')

    const newTask = {
        id: Date.now(),
        title: title,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = '';
    saveTasksToStorage();
    renderTasks();
});

taskInput.addEventListener('input',function (){
    if (taskInput.value.trim().length >= 3){
        taskInput.classList.remove('is-invalid');
    }
})

searchInput.addEventListener('input',function(e){
    searchQuery = e.target.value;
    renderTasks();
})

filterButtons.addEventListener('click', function(e){
    if (e.target.tagName === 'BUTTON'){
        Array.from(filterButtons.children).forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderTasks();
    }
})

resetStoragebtn.addEventListener('click',function(){
    if (confirm('Are you sure you want to reset all tasks back to initial defaults')) {
        localStorage.removeItem(STORAGE_KEY)
        tasks = [...defaultTasks];
        saveTasksToStorage();
        renderTasks();
    }
})

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasksToStorage();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
    renderTasks();
}

function updateMetrics() {
    const pendingCount = tasks.filter(task => !task.completed).length;
    pendingTasksCount.textContent = pendingCount;
}

renderTasks();
