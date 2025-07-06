// Script para gestionar tareas en el Gestor de Tareas
// Este script maneja la creación, actualización y eliminación de tareas

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado, inicializando gestor de tareas...');

  // Establecer fecha actual como valor predeterminado para los campos de fecha
  setDefaultDates();

  // Capturar el formulario de tareas
  const taskForm = document.getElementById('taskForm');

  if (taskForm) {
    console.log('Formulario encontrado, configurando event listener...');
    taskForm.addEventListener('submit', handleTaskSubmit);
  } else {
    console.error('No se encontró el formulario de tareas');
  }

  // Configurar botones de acción en tareas existentes
  setupTaskButtons();

  // Inicializar el calendario si existe
  initializeCalendar();

  // Configurar cierre de sesión por inactividad
  setupInactivityTimeout();

  // Cargar las tareas al iniciar
  loadTasks();
});

// Función para establecer fechas predeterminadas en los campos de fecha
function setDefaultDates() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  if (startDateInput && endDateInput) {
    // Formatear fechas para input type="date" (YYYY-MM-DD)
    startDateInput.value = today.toISOString().split('T')[0];
    endDateInput.value = tomorrow.toISOString().split('T')[0];

    // Validar que la fecha de fin no sea anterior a la de inicio
    startDateInput.addEventListener('change', function () {
      if (startDateInput.value > endDateInput.value) {
        endDateInput.value = startDateInput.value;
      }
    });
  }
}

// Función para manejar el envío del formulario de tareas
function handleTaskSubmit(e) {
  e.preventDefault();
  console.log('Formulario enviado, procesando...');

  // Obtener los valores del formulario
  const taskName = document.getElementById('task').value.trim();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const status = document.getElementById('state').value;

  // Obtener el token (si existe)
  const tokenInput = document.querySelector('input[name="token"]');
  const token = tokenInput ? tokenInput.value : '';

  // Validar campos requeridos
  if (!taskName || !startDate || !endDate) {
    alert('Por favor, completa todos los campos requeridos.');
    return;
  }

  // Validar fechas (fecha de inicio debe ser anterior o igual a fecha de fin)
  if (new Date(startDate) > new Date(endDate)) {
    alert('La fecha de inicio debe ser anterior o igual a la fecha de fin.');
    return;
  }

  // Preparar los datos para enviar al servidor
  const taskData = new URLSearchParams();
  taskData.append('name_task', taskName);
  taskData.append('start_task', startDate);
  taskData.append('end_task', endDate);
  taskData.append('status_task', mapStatusToDatabase(status));
  taskData.append('priority_task', 'Media'); // Valor predeterminado

  // Añadir token si existe
  if (token) {
    taskData.append('token', token);
    taskData.append('web', ''); // Campo para detectar bots
  }

  console.log('Enviando datos al servidor...');

  // Enviar datos al servidor
  fetch('../models/task_actions.php?action=create', {
    method: 'POST',
    body: taskData.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      console.log('Respuesta del servidor:', data);

      // Si la tarea se creó correctamente, actualizar la interfaz
      if (data.includes('SUCCESS')) {
        // Limpiar solo el campo de nombre de tarea, mantener las fechas
        document.getElementById('task').value = '';

        // Mostrar notificación de éxito
        showNotification('Tarea creada correctamente', 'success');

        // Recargar las tareas
        loadTasks();

        // Si tenemos calendario inicializado, actualizarlo
        if (window.calendar) {
          updateCalendarEvents();
        }
      } else {
        console.error('Error al crear la tarea:', data);
        showNotification('Hubo un problema al crear la tarea: ' + data, 'error');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      showNotification('Error de conexión. Por favor, verifica tu conexión a internet.', 'error');
    });
}

// Función para cargar todas las tareas del usuario
function loadTasks() {
  console.log('Cargando tareas...');

  fetch('../models/task_actions.php?action=list')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Tareas cargadas:', data);

      // Limpiar las listas actuales
      document.getElementById('pendingTasks').innerHTML = '';
      document.getElementById('inProgressTasks').innerHTML = '';
      document.getElementById('completedTasks').innerHTML = '';

      // Si no hay tareas, mostrar mensaje
      if (data.length === 0 || !Array.isArray(data)) {
        const emptyMsg = document.createElement('li');
        emptyMsg.className = 'empty-task';
        emptyMsg.textContent = 'No hay tareas. ¡Crea una nueva!';
        document.getElementById('pendingTasks').appendChild(emptyMsg);
        return;
      }

      // Distribuir las tareas según su estado
      data.forEach((task) => {
        const taskElement = createTaskElement(task);

        switch (task.status_task) {
          case 'Pendiente':
            document.getElementById('pendingTasks').appendChild(taskElement);
            break;
          case 'En Proceso':
            document.getElementById('inProgressTasks').appendChild(taskElement);
            break;
          case 'Completa':
            document.getElementById('completedTasks').appendChild(taskElement);
            break;
          default:
            // Si el estado no es reconocido, lo ponemos en pendientes
            document.getElementById('pendingTasks').appendChild(taskElement);
        }
      });

      // Verificar si hay secciones vacías y mostrar mensaje
      ['pendingTasks', 'inProgressTasks', 'completedTasks'].forEach((listId) => {
        const list = document.getElementById(listId);
        if (list.children.length === 0) {
          const emptyMsg = document.createElement('li');
          emptyMsg.className = 'empty-task';
          emptyMsg.textContent = 'No hay tareas en esta sección';
          list.appendChild(emptyMsg);
        }
      });

      // Volver a configurar los botones para las nuevas tareas
      setupTaskButtons();
    })
    .catch((error) => {
      console.error('Error al cargar las tareas:', error);
      showNotification('Error al cargar las tareas', 'error');
    });
}

// Función para crear el elemento HTML de una tarea
function createTaskElement(task) {
  const li = document.createElement('li');
  li.dataset.taskId = task.id_task;

  const taskContent = document.createElement('div');
  taskContent.className = 'task-content';

  const taskName = document.createElement('p');
  taskName.className = 'task-name';
  taskName.textContent = task.name_task;
  taskContent.appendChild(taskName);

  // Añadir fechas
  const taskDates = document.createElement('small');
  taskDates.className = 'task-dates';
  taskDates.textContent = `${formatDate(task.start_task)} - ${formatDate(task.end_task)}`;
  taskContent.appendChild(taskDates);

  // Añadir descripción si existe
  if (task.description_task) {
    const taskDescription = document.createElement('p');
    taskDescription.className = 'task-description';
    taskDescription.textContent = task.description_task;
    taskContent.appendChild(taskDescription);
  }

  // Añadir prioridad
  const taskPriority = document.createElement('span');
  taskPriority.className = `task-priority priority-${task.priority_task ? task.priority_task.toLowerCase() : 'media'}`;
  taskPriority.textContent = task.priority_task || 'Media';
  taskContent.appendChild(taskPriority);

  li.appendChild(taskContent);

  // Añadir botones según el estado
  const taskButtons = document.createElement('div');
  taskButtons.className = 'task-buttons';

  switch (task.status_task) {
    case 'Pendiente':
      // Botón para mover a "En Proceso"
      const moveToProgressBtn = document.createElement('button');
      moveToProgressBtn.type = 'button';
      moveToProgressBtn.title = 'Mover a en ejecución';
      moveToProgressBtn.dataset.action = 'moveToProgress';
      moveToProgressBtn.dataset.taskId = task.id_task;
      moveToProgressBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
      taskButtons.appendChild(moveToProgressBtn);
      break;

    case 'En Proceso':
      // Botón para completar
      const completeBtn = document.createElement('button');
      completeBtn.type = 'button';
      completeBtn.title = 'Mover a completadas';
      completeBtn.dataset.action = 'complete';
      completeBtn.dataset.taskId = task.id_task;
      completeBtn.innerHTML = '<i class="fas fa-check"></i>';
      taskButtons.appendChild(completeBtn);

      // Botón para volver a pendiente
      const moveToPendingBtn = document.createElement('button');
      moveToPendingBtn.type = 'button';
      moveToPendingBtn.title = 'Mover a pendientes';
      moveToPendingBtn.dataset.action = 'moveToPending';
      moveToPendingBtn.dataset.taskId = task.id_task;
      moveToPendingBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
      taskButtons.appendChild(moveToPendingBtn);
      break;

    case 'Completa':
      // Botón para volver a en proceso
      const moveToProgressFromCompleteBtn = document.createElement('button');
      moveToProgressFromCompleteBtn.type = 'button';
      moveToProgressFromCompleteBtn.title = 'Mover a en ejecución';
      moveToProgressFromCompleteBtn.dataset.action = 'moveToProgressFromComplete';
      moveToProgressFromCompleteBtn.dataset.taskId = task.id_task;
      moveToProgressFromCompleteBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
      taskButtons.appendChild(moveToProgressFromCompleteBtn);
      break;
  }

  // Botón para eliminar (común a todos los estados)
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.title = 'Eliminar tarea';
  deleteBtn.dataset.action = 'delete';
  deleteBtn.dataset.taskId = task.id_task;
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  taskButtons.appendChild(deleteBtn);

  li.appendChild(taskButtons);

  return li;
}

// Función para configurar los botones de acción en las tareas
function setupTaskButtons() {
  console.log('Configurando botones de tareas...');

  document.querySelectorAll('.task-buttons button').forEach((button) => {
    // Eliminamos el event listener anterior para evitar duplicados
    button.removeEventListener('click', handleTaskAction);
    // Añadimos el nuevo event listener
    button.addEventListener('click', handleTaskAction);
  });
}

// Función para manejar las acciones en las tareas (eliminar, mover)
function handleTaskAction(e) {
  const button = e.currentTarget;
  const action = button.dataset.action;
  const taskId = button.dataset.taskId;

  console.log(`Acción: ${action}, ID de tarea: ${taskId}`);

  if (!taskId) {
    console.error('No se pudo encontrar el ID de la tarea');
    return;
  }

  let newStatus;
  let serverAction = 'update';

  switch (action) {
    case 'moveToProgress':
      newStatus = 'En Proceso';
      break;
    case 'complete':
      newStatus = 'Completa';
      break;
    case 'moveToPending':
      newStatus = 'Pendiente';
      break;
    case 'moveToProgressFromComplete':
      newStatus = 'En Proceso';
      break;
    case 'delete':
      if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        serverAction = 'delete';
      } else {
        return;
      }
      break;
    default:
      console.error('Acción no reconocida:', action);
      return;
  }

  // Preparar los datos según la acción
  const taskData = new URLSearchParams();
  taskData.append('id_task', taskId);

  if (serverAction === 'update') {
    taskData.append('status_task', newStatus);
  }

  console.log(`Enviando acción ${serverAction} al servidor...`);

  // Enviar la acción al servidor
  fetch(`../models/task_actions.php?action=${serverAction}`, {
    method: 'POST',
    body: taskData.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      console.log('Respuesta del servidor:', data);

      if (data.includes('SUCCESS')) {
        // Mostrar notificación
        if (serverAction === 'delete') {
          showNotification('Tarea eliminada correctamente', 'success');
        } else {
          showNotification('Estado de la tarea actualizado correctamente', 'success');
        }

        // Recargar las tareas para reflejar los cambios
        loadTasks();

        // Si tenemos calendario inicializado, actualizarlo
        if (window.calendar) {
          updateCalendarEvents();
        }
      } else {
        console.error('Error al procesar la acción:', data);
        showNotification('Hubo un problema al procesar tu solicitud', 'error');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      showNotification('Error de conexión', 'error');
    });
}

// Función para inicializar el calendario
function initializeCalendar() {
  const calendarEl = document.getElementById('calendar');

  if (!calendarEl) {
    console.log('No se encontró el elemento del calendario');
    return;
  }

  // Verificar si FullCalendar está disponible
  if (typeof FullCalendar === 'undefined') {
    console.error('FullCalendar no está disponible');
    return;
  }

  console.log('Inicializando calendario...');

  try {
    window.calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth',
      },
      locale: document.documentElement.lang || 'es',
      buttonText: {
        today: 'Hoy',
        month: 'Mes',
      },
      events: [], // Inicialmente vacío
      eventClick: function (info) {
        alert(
          `Tarea: ${info.event.title}\nFecha inicio: ${formatDate(info.event.start)}\nFecha fin: ${formatDate(info.event.end || info.event.start)}`
        );
      },
      eventClassNames: function (arg) {
        // Añadir clases CSS según el estado de la tarea
        return [arg.event.classNames];
      },
    });

    window.calendar.render();
    console.log('Calendario renderizado');

    // Cargar eventos del calendario
    updateCalendarEvents();
  } catch (error) {
    console.error('Error al inicializar el calendario:', error);
  }
}

// Función para actualizar los eventos del calendario
function updateCalendarEvents() {
  if (!window.calendar) {
    console.log('No se encontró el calendario inicializado');
    return;
  }

  console.log('Actualizando eventos del calendario...');

  fetch('../models/task_actions.php?action=list')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Remover todos los eventos actuales
      window.calendar.removeAllEvents();

      if (!Array.isArray(data)) {
        console.error('Los datos recibidos no son un array:', data);
        return;
      }

      // Agregar las tareas como eventos
      data.forEach((task) => {
        try {
          let statusClass;
          switch (task.status_task) {
            case 'Pendiente':
              statusClass = 'task-pending';
              break;
            case 'En Proceso':
              statusClass = 'task-in_progress';
              break;
            case 'Completa':
              statusClass = 'task-completed';
              break;
            default:
              statusClass = 'task-pending';
          }

          window.calendar.addEvent({
            id: task.id_task,
            title: task.name_task,
            start: task.start_task,
            end: task.end_task,
            allDay: true,
            classNames: statusClass,
          });
        } catch (error) {
          console.error('Error al añadir evento al calendario:', error, task);
        }
      });

      console.log('Eventos del calendario actualizados');
    })
    .catch((error) => {
      console.error('Error al cargar eventos para el calendario:', error);
    });
}

// Función para formatear fechas
function formatDate(dateString) {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    // Formatear como DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error, dateString);
    return 'Error de fecha';
  }
}

// Función para mapear estados del formulario a valores de la base de datos
function mapStatusToDatabase(status) {
  const statusMap = {
    pending: 'Pendiente',
    in_progress: 'En Proceso',
    completed: 'Completa',
  };

  return statusMap[status] || 'Pendiente';
}

// Función para configurar el cierre de sesión por inactividad
function setupInactivityTimeout() {
  const tiempoInactividad = 300000; // 5 minutos (en milisegundos)
  let temporizador;

  function redirigir() {
    window.location.href = '../control/logout.php';
  }

  function resetearTemporizador() {
    clearTimeout(temporizador);
    temporizador = setTimeout(redirigir, tiempoInactividad);
  }

  // Eventos para resetear el temporizador
  window.addEventListener('keydown', resetearTemporizador);
  window.addEventListener('mousemove', resetearTemporizador);
  window.addEventListener('scroll', resetearTemporizador);
  window.addEventListener('click', resetearTemporizador);
  window.addEventListener('touchstart', resetearTemporizador);

  // Iniciar el temporizador
  resetearTemporizador();
  console.log('Temporizador de inactividad configurado');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  console.log(`Notificación (${type}): ${message}`);

  // Verificar si ya existe una notificación
  let notification = document.querySelector('.notification');

  if (notification) {
    // Si existe, eliminarla para mostrar la nueva
    notification.remove();
  }

  // Crear la notificación
  notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

  // Estilos para la notificación
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '15px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '9999';
  notification.style.maxWidth = '300px';
  notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

  // Estilos según el tipo
  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#f44336';
    notification.style.color = 'white';
  } else {
    notification.style.backgroundColor = '#2196F3';
    notification.style.color = 'white';
  }

  // Añadir la notificación al DOM
  document.body.appendChild(notification);

  // Configurar el botón de cierre
  const closeButton = notification.querySelector('.notification-close');
  closeButton.style.marginLeft = '10px';
  closeButton.style.border = 'none';
  closeButton.style.background = 'transparent';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';

  closeButton.addEventListener('click', () => {
    notification.remove();
  });

  // Configurar el cierre automático después de 5 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}
