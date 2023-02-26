// get the form and input elements
const form = document.querySelector('form');
const titleInput = document.getElementById('title');
const messageInput = document.getElementById('message');
const dateInput = document.getElementById('date');
const daysremainInput = document.getElementById('daysremain');

// get the pending tasks and completed tasks lists
const pendingTasksList = document.querySelector('#pending-tasks ul');
const completedTasksList = document.querySelector('#completed-tasks ul');

// check local storage for saved tasks
let tasks = [];

function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    displayPendingTasks();
    displayCompletedTasks();
  }
}

function addTask(title, message, date, daysremain) {
  const task = { title, message, date, daysremain, status: 'pending' };
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  displayPendingTasks(); // call the function to update the pending tasks list
  return task;
}

// function to display pending tasks
function displayPendingTasks() {
  pendingTasksList.innerHTML = '';
  tasks.forEach((task, index) => {
    if (task.status === 'pending') {
      const li = document.createElement('li');
      li.innerHTML = `<b> ${task.title}</b> ${task.message} <br> ${task.date} <br> ${task.daysremain} <br>
        <button class="done-button" data-index="${index}">Done</button>`;
      pendingTasksList.appendChild(li);
    }
  });
}

// function to display all completed tasks
function displayCompletedTasks() {
  completedTasksList.innerHTML = '';
  tasks.forEach((task, index) => {
    if (task.status === 'completed') {
      const li = document.createElement('li');
      li.innerHTML = `<b>${task.title}</b> ${task.message} <br> ${task.date} <br> ${task.daysremain} <br>
        <button class="remove-button" data-index="${index}">Remove</button>`;
      completedTasksList.appendChild(li);
    }
  });
}

// function to mark a task as completed
function markTaskAsCompleted(index) {
  tasks[index].status = 'completed';
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// function to remove a completed task
function removeCompletedTask(index) {
tasks.splice(index, 1);
localStorage.setItem('tasks', JSON.stringify(tasks));
displayCompletedTasks();
}

// add event listener to remove buttons
document.addEventListener('click', (event) => {
if (event.target.classList.contains('remove-button')) {
const index = event.target.dataset.index;
removeCompletedTask(index);
}
});


// add event listener to form submit button
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value;
  const message = messageInput.value;
  const date = dateInput.value;
  const daysremain = daysremainInput.value;
  const task = addTask(title, message, date, daysremain);
  const li = document.createElement('li');
  li.innerHTML = `<b>${task.title}</b> <br> ${task.message} <br> ${task.date} <br> ${task.date} <br>
    <button class="done-button" data-index="${tasks.length - 1}">Done</button>`;
  pendingTasksList.appendChild(li);
  titleInput.value = '';
  messageInput.value = '';
  dateInput.value = '';
});

// add event listener to done buttons
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('done-button')) {
    const index = event.target.dataset.index;
    markTaskAsCompleted(index);
    displayPendingTasks();
    displayCompletedTasks();
  }
});

// load saved tasks on page load
loadTasks();
