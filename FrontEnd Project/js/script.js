// Author: Shankar Sapkota
// Site: https://shankarsapkota.com.np
// email: shankarsapkota69@gmail.com
        //  contact@shankarsapkota.com.np


// Get the details from form first
const form = document.querySelector('form');
const titleInput = document.getElementById('title');
const messageInput = document.getElementById('message');
const dateInput = document.getElementById('date');
const daysremainInput = document.getElementById('daysremain');

// get the pending tasks and completed tasks lists
const pendingTasksList = document.querySelector('#pending-tasks ul');
const completedTasksList = document.querySelector('#completed-tasks ul');

// check for the local storage of browser for saved tasks
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

// This function is to display the pending tasks
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

// This function is to display all completed tasks
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

// Ths function will  mark a task as completed in pending state
function markTaskAsCompleted(index) {
  tasks[index].status = 'completed';
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// this function will remove a task from completed section
function removeCompletedTask(index) {
tasks.splice(index, 1);
localStorage.setItem('tasks', JSON.stringify(tasks));
displayCompletedTasks();
}

// Adding the event listener to remove buttons in completed task
document.addEventListener('click', (event) => {
if (event.target.classList.contains('remove-button')) {
const index = event.target.dataset.index;
removeCompletedTask(index);
}
});


// Adding the  event listener to form submit button that takes to Pending State
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

// This will add the event listener to done buttons in pending task
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('done-button')) {
    const index = event.target.dataset.index;
    markTaskAsCompleted(index);
    displayPendingTasks();
    displayCompletedTasks();
  }
});

// Finally, we are checking to load saved tasks on page load or reload form local storage 
loadTasks();


// Remember this is a simple project done for Front End Skills Subject.

// This project saves the task in sotrage file in your browser so, celaring the cahce or cookie will also remove the data
