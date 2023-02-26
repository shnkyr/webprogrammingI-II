// First i will get all the details from the form in html page

const form = document.querySelector('form');
const titleInput = document.getElementById('title');
const messageInput = document.getElementById('message');
const dateInput = document.getElementById('date');
const daysremainInput = document.getElementById('daysremain');

const pendingTasksList = document.querySelector('#pending-tasks ul');
const completedTasksList = document.querySelector('#completed-tasks ul'); //here i am getting pending and completed task list

// i am creating function that will show the task from pending or completed
function loadTasks() {
  const savedTasks = getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    displayPendingTasks();
    displayCompletedTasks();
  }
}

function addTask(title, message, date, daysremain) {
  const task = { title, message, date, daysremain, status: 'pending' };
  tasks.push(task);
  setItem('tasks', JSON.stringify(tasks));
  displayPendingTasks();  // i am calling function that will look for pending task list
  return task;
}

// this is a function that will show the pendign task list
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

// this is a function that will show the completed task list
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

// adding the  event listener to form submit button 
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

// again adding the event listener to done buttons after the task in displayed in pending state
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('done-button')) {
    const index = event.target.dataset.index;
    markTaskAsCompleted(index);
    displayPendingTasks();
    displayCompletedTasks();
  }
});

