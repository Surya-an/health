
  // Navigation tabs logic
  const navButtons = document.querySelectorAll('nav button');
  const sections = document.querySelectorAll('main section');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-target');
      sections.forEach(sec => {
        if (sec.id === target) sec.classList.add('active');
        else sec.classList.remove('active');
      });
    });
  });

  // =================== Mood Tracker ===================
  const moodButtons = document.querySelectorAll('#mood-buttons button');
  const moodCalendar = document.getElementById('mood-calendar');
  const moods = ['happy', 'sad', 'angry', 'neutral', 'excited'];

  // Save moods in localStorage keyed by 'mood-yyyy-mm-dd'
  function getMoodKey(date) {
    return 'mood-' + date.toISOString().slice(0,10);
  }

  function loadMood(date) {
    return localStorage.getItem(getMoodKey(date));
  }
  function saveMood(date, mood) {
    localStorage.setItem(getMoodKey(date), mood);
  }

  // Build calendar for current month
  function buildMoodCalendar() {
    moodCalendar.innerHTML = '';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // Get first day of month weekday
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayWeekday = firstDayOfMonth.getDay(); // 0-6 Sun-Sat
    // Get days in month
    const daysInMonth = new Date(year, month+1, 0).getDate();

    // Fill grid with blank days to align weekdays (Sunday start)
    for (let i=0; i<firstDayWeekday; i++) {
      const blankDiv = document.createElement('div');
      blankDiv.style.background = 'transparent';
      blankDiv.style.cursor = 'default';
      blankDiv.setAttribute('aria-hidden', 'true');
      moodCalendar.appendChild(blankDiv);
    }

    for (let day=1; day <= daysInMonth; day++) {
      const div = document.createElement('div');
      div.textContent = day;
      div.setAttribute('tabindex', '0');
      const date = new Date(year, month, day);
      const savedMood = loadMood(date);
      if (savedMood && moods.includes(savedMood)) {
        div.dataset.mood = savedMood;
      }

      div.addEventListener('click', () => {
        if (!selectedMood) {
          alert('Please select a mood above first.');
          return;
        }
        div.dataset.mood = selectedMood;
        saveMood(date, selectedMood);
      });
      div.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          div.click();
        }
      });

      moodCalendar.appendChild(div);
    }
  }

  // Mood selection logic
  let selectedMood = null;
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      moodButtons.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      selectedMood = btn.dataset.mood;
    });
  });

  buildMoodCalendar();

  // =================== Water Intake Tracker ===================
  const waterGoalInput = document.getElementById('water-goal-input');
  const waterCupsDiv = document.getElementById('water-cups');
  const waterStatus = document.getElementById('water-status');

  let waterGoal = parseInt(waterGoalInput.value) || 8;
  let waterDrank = 0;

  function saveWaterIntake() {
    const key = 'water-intake-' + new Date().toISOString().slice(0,10);
    localStorage.setItem(key, waterDrank);
  }
  function loadWaterIntake() {
    const key = 'water-intake-' + new Date().toISOString().slice(0,10);
    const val = localStorage.getItem(key);
    return val ? parseInt(val) : 0;
  }

  function renderWaterCups() {
    waterCupsDiv.innerHTML = '';
    for (let i = 1; i <= waterGoal; i++) {
      const btn = document.createElement('button');
      btn.setAttribute('aria-pressed', i <= waterDrank ? 'true' : 'false');
      if (i <= waterDrank) btn.classList.add('filled');
      btn.addEventListener('click', () => {
        waterDrank = i;
        updateWaterDisplay();
        saveWaterIntake();
        renderWaterCups();
      });
      waterCupsDiv.appendChild(btn);
    }
    updateWaterDisplay();
  }
  function updateWaterDisplay() {
    waterStatus.textContent = `${waterDrank} / ${waterGoal} cups consumed`;
  }

  waterGoalInput.addEventListener('change', () => {
    waterGoal = Math.min(20, Math.max(1, parseInt(waterGoalInput.value) || 8));
    waterGoalInput.value = waterGoal;
    // Reset cups if needed
    if (waterDrank > waterGoal) waterDrank = waterGoal;
    renderWaterCups();
    saveWaterIntake();
  });

  waterDrank = loadWaterIntake();
  renderWaterCups();

  // =================== Breathing Animation ===================
  const breathingCircle = document.getElementById('breathing-circle');
  const breathingText = document.getElementById('breathing-text');

  let breathPhase = 0;
  const inhalingText = "Inhale";
  const exhalingText = "Exhale";

  // Animate text with alternate cycle 4s inhale 4s exhale
  function breatheLoop() {
    breathPhase = (breathPhase + 1) % 2;
    breathingText.textContent = breathPhase === 0 ? inhalingText : exhalingText;
    setTimeout(breatheLoop, 4000);
  }
  breatheLoop();

  // =================== Meal Log ===================
  const mealForm = document.getElementById('meal-log-form');
  const mealList = document.getElementById('meal-list');
  const mealTotal = document.getElementById('meal-total');

  let meals = JSON.parse(localStorage.getItem('meal-log')) || [];

  function saveMeals() {
    localStorage.setItem('meal-log', JSON.stringify(meals));
  }
  function renderMeals() {
    mealList.innerHTML = '';
    let total = 0;
    meals.forEach((meal, idx) => {
      total += meal.calories;
      const li = document.createElement('li');
      li.textContent = `${meal.name}`;
      const cals = document.createElement('span');
      cals.textContent = `${meal.calories} cal`;
      li.appendChild(cals);
      mealList.appendChild(li);
    });
    mealTotal.textContent = `Total calories today: ${total}`;
  }
  mealForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('meal-name').value.trim();
    const calories = parseInt(document.getElementById('meal-calories').value);
    if (name && calories >= 0) {
      meals.push({ name, calories });
      saveMeals();
      renderMeals();
      mealForm.reset();
    }
  });
  renderMeals();

  // =================== Sleep Tracker ===================
  const sleepForm = document.getElementById('sleep-log-form');
  const sleepChartCtx = document.getElementById('sleep-chart').getContext('2d');

  let sleepLogs = JSON.parse(localStorage.getItem('sleep-logs')) || [];
  
  // Sort by date asc
  sleepLogs.sort((a,b) => new Date(a.date) - new Date(b.date));

  function saveSleepLogs() {
    localStorage.setItem('sleep-logs', JSON.stringify(sleepLogs));
  }

  let sleepChart = new Chart(sleepChartCtx, {
    type: 'line',
    data: {
      labels: sleepLogs.map(e => e.date),
      datasets: [{
        label: 'Hours Slept',
        data: sleepLogs.map(e => e.hours),
        backgroundColor: '#74b9ff88',
        borderColor: '#0984e3',
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        pointRadius: 4
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 24 }
      },
      responsive: true,
      plugins: {
        legend: { display: true }
      }
    }
  });

  sleepForm.addEventListener('submit', e => {
    e.preventDefault();
    const date = document.getElementById('sleep-date').value;
    const hours = parseFloat(document.getElementById('sleep-hours').value);
    if (date && hours >= 0 && hours <= 24) {
      // Update existing or add new
      const idx = sleepLogs.findIndex(e => e.date === date);
      if (idx >= 0) sleepLogs[idx].hours = hours;
      else sleepLogs.push({ date, hours });
      // Keep sorted
      sleepLogs.sort((a,b) => new Date(a.date) - new Date(b.date));
      saveSleepLogs();
      updateSleepChart();
      sleepForm.reset();
    }
  });

  function updateSleepChart() {
    sleepChart.data.labels = sleepLogs.map(e => e.date);
    sleepChart.data.datasets[0].data = sleepLogs.map(e => e.hours);
    sleepChart.update();
  }
  updateSleepChart();

  // Set max date for input to today
  const sleepDateInput = document.getElementById('sleep-date');
  sleepDateInput.max = new Date().toISOString().split('T')[0];

  // =================== Fitness Routine Timers ===================
  const fitnessButtons = document.querySelectorAll('#fitness-checklist .timer-btn');
  const timers = {};

  fitnessButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const exercise = btn.dataset.exercise;
      const display = document.getElementById(`timer-${exercise}`);

      if (timers[exercise]) {
        // Stop timer
        clearInterval(timers[exercise].interval);
        timers[exercise] = null;
        btn.textContent = 'Start';
      } else {
        // Start timer
        let seconds = 0;
        btn.textContent = 'Stop';
        timers[exercise] = {};
        timers[exercise].interval = setInterval(() => {
          seconds++;
          display.textContent = formatTime(seconds);
        }, 1000);
      }
    });
  });

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  // =================== Stretch Sequence Drag & Timer ===================
  const stretchList = document.getElementById('stretch-list');
  let draggedElem = null;
  let dragIndex = null;

  // Drag and drop reorder
  stretchList.addEventListener('dragstart', e => {
    draggedElem = e.target;
    dragIndex = [...stretchList.children].indexOf(draggedElem);
    e.dataTransfer.effectAllowed = 'move';
    draggedElem.classList.add('dragging');
  });
  stretchList.addEventListener('dragend', e => {
    draggedElem.classList.remove('dragging');
    draggedElem = null;
    dragIndex = null;
  });
  stretchList.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(stretchList, e.clientY);
    if (afterElement == null) {
      stretchList.appendChild(draggedElem);
    } else {
      stretchList.insertBefore(draggedElem, afterElement);
    }
  });
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // Clicking stretch to start timer animation
  stretchList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      if (li.classList.contains('active-timer')) return; // already running timer
      li.classList.add('active-timer');
      const duration = parseInt(li.dataset.duration);
      const bar = li.querySelector('.visual-timer > div');
      bar.style.width = '0%';

      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed++;
        bar.style.width = (elapsed/duration)*100 + '%';
        if (elapsed >= duration) {
          clearInterval(interval);
          li.classList.remove('active-timer');
          bar.style.width = '0%';
        }
      }, 1000);
    });
  });

  // =================== Mental Health Journal ===================
  const journalForm = document.getElementById('journal-entry-form');
  const journalText = document.getElementById('journal-text');
  const journalTagsInput = document.getElementById('journal-tags');
  const journalEntriesDiv = document.getElementById('journal-entries');
  const journalMoodChartCtx = document.getElementById('journal-mood-chart').getContext('2d');

  let journalEntries = JSON.parse(localStorage.getItem('mental-journal')) || [];

  function saveJournalEntries() {
    localStorage.setItem('mental-journal', JSON.stringify(journalEntries));
  }
  function renderJournalEntries() {
    journalEntriesDiv.innerHTML = '';
    journalEntries.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'entry';
      const dateStr = new Date(entry.date).toLocaleDateString();
      div.innerHTML = `<div><strong>${dateStr}</strong></div><div>${entry.text}</div>`;
      if (entry.tags && entry.tags.length > 0) {
        div.innerHTML += `<div class="tags">Tags: ${entry.tags.join(', ')}</div>`;
      }
      journalEntriesDiv.appendChild(div);
    });
  }

  let journalMoodChart;
  function updateJournalMoodChart() {
    // Mood chart by counting tags related to moods per day (simple)
    const moodCounts = {};
    const dateLabels = [];
    journalEntries.forEach(entry => {
      // Check tags for mood keywords
      let moodTagFound = null;
      const moodTags = ['happy', 'sad', 'angry', 'neutral', 'excited'];
      for (const mt of moodTags) {
        if (entry.tags && entry.tags.includes(mt)) {
          moodTagFound = mt;
          break;
        }
      }
      if (!moodTagFound) return;
      const d = entry.date;
      if (!moodCounts[d]) {
        moodCounts[d] = {};
        moodTags.forEach(m => moodCounts[d][m] = 0);
      }
      moodCounts[d][moodTagFound]++;
    });

    const days = Object.keys(moodCounts).sort();

    const dataObj = {
      happy: [],
      sad: [],
      angry: [],
      neutral: [],
      excited: []
    };

    days.forEach(day => {
      dateLabels.push(day);
      const counts = moodCounts[day] || {};
      ['happy', 'sad', 'angry', 'neutral', 'excited'].forEach(m => {
        dataObj[m].push(counts[m] || 0);
      });
    });

    if (journalMoodChart) {
      journalMoodChart.data.labels = dateLabels;
      journalMoodChart.data.datasets.forEach((ds) => {
        ds.data = dataObj[ds.label];
      });
      journalMoodChart.update();
    } else {
      journalMoodChart = new Chart(journalMoodChartCtx, {
        type: 'bar',
        data: {
          labels: dateLabels,
          datasets: [
            { label: 'happy', backgroundColor: '#00b894', data: dataObj['happy'] },
            { label: 'sad', backgroundColor: '#0984e3', data: dataObj['sad'] },
            { label: 'angry', backgroundColor: '#d63031', data: dataObj['angry'] },
            { label: 'neutral', backgroundColor: '#b2bec3', data: dataObj['neutral'] },
            { label: 'excited', backgroundColor: '#fd79a8', data: dataObj['excited'] },
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      });
    }
  }

  journalForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = journalText.value.trim();
    const tagsRaw = journalTagsInput.value.trim();
    if (!text) return;
    const tags = tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    const date = (new Date()).toISOString().slice(0,10);

    journalEntries.push({ text, tags, date });
    saveJournalEntries();
    renderJournalEntries();
    updateJournalMoodChart();
    journalForm.reset();
  });

  renderJournalEntries();
  updateJournalMoodChart();

  // =================== Weight Tracker ===================
  const weightForm = document.getElementById('weight-tracker-form');
  const weightDateInput = document.getElementById('weight-date');
  const weightValueInput = document.getElementById('weight-value');
  const weightChartCtx = document.getElementById('weight-chart').getContext('2d');

  let weightData = JSON.parse(localStorage.getItem('weight-data')) || [];

  weightData.sort((a,b) => new Date(a.date) - new Date(b.date));

  const weightChart = new Chart(weightChartCtx, {
    type: 'line',
    data: {
      labels: weightData.map(e => e.date),
      datasets: [{
        label: 'Weight (kg)',
        data: weightData.map(e => e.weight),
        backgroundColor: 'rgba(108, 92, 231, 0.4)',
        borderColor: '#6c5ce7',
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 5,
        fill: true,
        cubicInterpolationMode: 'monotone'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: false }
      }
    }
  });

  weightForm.addEventListener('submit', e => {
    e.preventDefault();
    const date = weightDateInput.value;
    const weight = parseFloat(weightValueInput.value);
    if (!date || isNaN(weight) || weight <= 0) return;
    const idx = weightData.findIndex(w => w.date === date);
    if (idx >= 0) weightData[idx].weight = weight;
    else weightData.push({ date, weight });
    weightData.sort((a,b) => new Date(a.date)-new Date(b.date));
    localStorage.setItem('weight-data', JSON.stringify(weightData));
    updateWeightChart();
    weightForm.reset();
  });

  function updateWeightChart() {
    weightChart.data.labels = weightData.map(w => w.date);
    weightChart.data.datasets[0].data = weightData.map(w => w.weight);
    weightChart.update();
  }
  updateWeightChart();

  // Prevent future dates selection in weight tracker
  weightDateInput.max = new Date().toISOString().split('T')[0];

  // =================== Health Dashboard - Wearable Sync Simulation ===================
  const syncButton = document.getElementById('sync-button');
  const syncStatus = document.getElementById('wearable-sync-status');

  const heartbeatCtx = document.getElementById('health-heartbeat-chart').getContext('2d');
  const stepsCtx = document.getElementById('health-steps-chart').getContext('2d');

  let heartRateData = [];
  let stepsData = [];

  // Create initial charts with empty data
  const heartbeatChart = new Chart(heartbeatCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Heart Rate (bpm)',
        data: [],
        borderColor: '#d63031',
        backgroundColor: '#d6303155',
        tension: 0.4,
        fill: true,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1000 },
      scales: {
        y: { min: 50, max: 150 }
      }
    }
  });
  const stepsChart = new Chart(stepsCtx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Steps per hour',
        data: [],
        backgroundColor: '#0984e3'
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1000 },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Simulate wearable sync process by generating random data
  syncButton.addEventListener('click', () => {
    syncStatus.textContent = 'Sync Status: Syncing...';
    syncButton.disabled = true;

    setTimeout(() => {
      generateWearableData();
      updateHealthCharts();
      syncStatus.textContent = 'Sync Status: Synced - Data Updated!';
      syncButton.disabled = false;
    }, 2000);
  });

  function generateWearableData() {
    const now = new Date();
    heartRateData = [];
    stepsData = [];
    const labels = [];
    for (let i = 0; i < 24; i++) {
      const hourLabel = String(i).padStart(2, '0') + ':00';
      labels.push(hourLabel);
      // Heartbeat random values fluctuating
      heartRateData.push(60 + Math.round(40 * Math.sin(i / 24 * Math.PI * 4) + Math.random() * 15));
      // Steps random between 0 and 1000
      stepsData.push(Math.floor(Math.random() * 1000));
    }
    heartbeatChart.data.labels = labels;
    stepsChart.data.labels = labels;
  }

  function updateHealthCharts() {
    heartbeatChart.data.datasets[0].data = heartRateData;
    heartbeatChart.update();
    stepsChart.data.datasets[0].data = stepsData;
    stepsChart.update();
  }

