const State = { plan: null, subjects: [] };

const els = {
    // Navigation & Views
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.view-section'),
    
    // Header
    greetingTitle: document.getElementById('greeting-title'),
    headerDate: document.getElementById('header-date'),
    themeToggle: document.getElementById('theme-toggle'),
    
    // Setup Form
    setupForm: document.getElementById('setup-form'),
    subjectInput: document.getElementById('subject-input'),
    btnAddSubject: document.getElementById('btn-add-subject'),
    subjectsList: document.getElementById('subjects-list'),
    subjectsEmptyMsg: document.getElementById('subjects-empty-msg'),
    examDate: document.getElementById('exam-date'),
    dailyHours: document.getElementById('daily-hours'),
    btnResetPlan: document.getElementById('btn-reset-plan'),
    
    // Dashboard Stats
    dashPercentage: document.getElementById('dash-percentage'),
    dashProgressFill: document.getElementById('dash-progress-fill'),
    dashTasksCount: document.getElementById('dash-tasks-count'),
    dashHoursCount: document.getElementById('dash-hours-count'),
    dashExamCount: document.getElementById('dash-exam-count'),
    examDaysLeft: document.getElementById('exam-days-left'),
    examTargetDate: document.getElementById('exam-target-date'),
    dashboardTodayTasks: document.getElementById('dashboard-today-tasks'),
    
    // Study Plan & Analytics
    studyPlanContainer: document.getElementById('study-plan-container'),
    subjectProgressList: document.getElementById('subject-progress-list'),
    
    // Utilities
    loaderOverlay: document.getElementById('loader-overlay'),
    toastContainer: document.getElementById('toast-container')
};

function getLocalYMD(dateObj = new Date()) {
    const d = new Date(dateObj);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
}

function init() {
    initTheme();
    loadData();
    setupEventListeners();
    updateHeaderDate();
    updateGreeting();
    
    if (State.plan) {
        window.appRouter('view-dashboard');
    } else {
        window.appRouter('view-settings');
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('studyflow-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        els.themeToggle.innerHTML = '<i class="ph ph-sun"></i>';
    } else {
        els.themeToggle.innerHTML = '<i class="ph ph-moon"></i>';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('studyflow-theme', 'light');
        els.themeToggle.innerHTML = '<i class="ph ph-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('studyflow-theme', 'dark');
        els.themeToggle.innerHTML = '<i class="ph ph-sun"></i>';
    }
}

function updateHeaderDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    els.headerDate.textContent = new Date().toLocaleDateString('en-US', options);
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    els.greetingTitle.innerHTML = `${greeting}, Hacker <span class="text-xl">👋</span>`;
}

function loadData() {
    const saved = localStorage.getItem('studyPlan');
    if (saved) State.plan = JSON.parse(saved);
}

function saveData() {
    localStorage.setItem('studyPlan', JSON.stringify(State.plan));
}

function setupEventListeners() {
    els.themeToggle.addEventListener('click', toggleTheme);
    
    els.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            window.appRouter(target);
        });
    });

    els.btnResetPlan.addEventListener('click', () => {
        if(confirm("Are you sure you want to delete your current study plan? This cannot be undone.")) {
            localStorage.removeItem('studyPlan');
            State.plan = null;
            showToast("Plan reset successfully", "success");
            window.appRouter('view-settings');
        }
    });

    els.btnAddSubject.addEventListener('click', addSubject);
    els.subjectInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') { e.preventDefault(); addSubject(); }
    });

    els.setupForm.addEventListener('submit', handleGeneratePlan);
}

window.appRouter = function(viewId) {
    els.sections.forEach(sec => sec.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    
    els.navItems.forEach(item => {
        if(item.getAttribute('data-target') === viewId) item.classList.add('active');
        else item.classList.remove('active');
    });

    if(viewId === 'view-settings') renderSettingsView();
    if(State.plan) {
        if(viewId === 'view-dashboard') renderDashboard();
        if(viewId === 'view-study-plan') renderStudyPlan();
        if(viewId === 'view-progress') renderProgress();
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
    toast.innerHTML = `<i class="ph ${icon}"></i> <span>${message}</span>`;
    els.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease-in reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleLoader(show) {
    if (show) els.loaderOverlay.classList.remove('hidden');
    else els.loaderOverlay.classList.add('hidden');
}

/* Settings View Logic */
function renderSettingsView() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    els.examDate.min = getLocalYMD(tomorrow);
    
    if(State.plan) {
        els.btnResetPlan.classList.remove('hidden');
        State.subjects = [...State.plan.settings.subjects];
        els.examDate.value = State.plan.settings.examDate;
        els.dailyHours.value = State.plan.settings.dailyHours;
    } else {
        els.btnResetPlan.classList.add('hidden');
        State.subjects = [];
        els.setupForm.reset();
    }
    renderSubjectsList();
}

function addSubject() {
    const val = els.subjectInput.value.trim();
    if(val) {
        if(!State.subjects.includes(val)) {
            State.subjects.push(val);
            els.subjectInput.value = '';
            renderSubjectsList();
        } else showToast("Subject already added!", "error");
    }
}

function removeSubject(subject) {
    State.subjects = State.subjects.filter(s => s !== subject);
    renderSubjectsList();
}

function renderSubjectsList() {
    els.subjectsList.innerHTML = '';
    if(State.subjects.length === 0) {
        els.subjectsEmptyMsg.style.display = 'block';
        els.subjectsList.appendChild(els.subjectsEmptyMsg);
        return;
    }
    els.subjectsEmptyMsg.style.display = 'none';
    State.subjects.forEach(subject => {
        const span = document.createElement('span');
        span.className = 'subject-pill';
        span.innerHTML = `${subject} <button type="button" aria-label="Remove"><i class="ph ph-x"></i></button>`;
        span.querySelector('button').addEventListener('click', () => removeSubject(subject));
        els.subjectsList.appendChild(span);
    });
}

/* Generation Logic */
function handleGeneratePlan(e) {
    e.preventDefault();
    if(State.subjects.length === 0) { showToast("Please add at least one subject.", "error"); return; }

    const examDateStr = els.examDate.value;
    const dailyHours = parseInt(els.dailyHours.value);
    
    const [y, m, d] = examDateStr.split('-');
    const examDateLocal = new Date(y, m - 1, d);
    const today = new Date(); today.setHours(0,0,0,0);
    
    const diffTime = examDateLocal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if(diffDays <= 0) { showToast("Exam date must be in the future.", "error"); return; }

    toggleLoader(true);
    setTimeout(() => {
        generatePlan(diffDays, examDateStr, dailyHours);
        toggleLoader(false);
        showToast("Study plan optimized! 🪄");
        window.appRouter('view-dashboard');
    }, 1500);
}

function generatePlan(daysAvailable, examDateStr, dailyHours) {
    const plan = { settings: { days: daysAvailable, examDate: examDateStr, dailyHours: dailyHours, subjects: [...State.subjects] }, tasks: [] };
    
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    const totalHoursAvailable = daysAvailable * dailyHours;
    const hoursPerSubject = Math.floor(totalHoursAvailable / State.subjects.length);
    let subjectQueue = [];
    
    if (hoursPerSubject >= 1) {
        State.subjects.forEach(sub => {
            for(let i=0; i<hoursPerSubject; i++) subjectQueue.push({ subject: sub, title: `Focus Module: ${sub}` });
        });
        const remaining = totalHoursAvailable - subjectQueue.length;
        for(let i=0; i<remaining; i++) {
            const rSub = State.subjects[i % State.subjects.length];
            subjectQueue.push({ subject: rSub, title: `Bonus Practice: ${rSub}` });
        }
    } else {
        for(let i=0; i<totalHoursAvailable; i++) {
            const rSub = State.subjects[i % State.subjects.length];
            subjectQueue.push({ subject: rSub, title: `Rapid Review: ${rSub}` });
        }
    }
    
    let qIndex = 0;
    for(let d = 0; d < daysAvailable; d++) {
        const dateForTask = new Date(currentDate);
        dateForTask.setDate(currentDate.getDate() + d);
        const dateStr = getLocalYMD(dateForTask);

        for(let h = 0; h < dailyHours; h++) {
            if(qIndex < subjectQueue.length) {
                const item = subjectQueue[qIndex++];
                plan.tasks.push({
                    id: `task_${Date.now()}_${d}_${h}`,
                    date: dateStr,
                    subject: item.subject,
                    title: item.title,
                    duration: "1 hour",
                    completed: false
                });
            }
        }
    }
    State.plan = plan; saveData();
}

/* Rendering logic */
function createTaskElement(task, callbackRender) {
    const el = document.createElement('div');
    el.className = `task-item ${task.completed ? 'completed' : ''}`;
    el.innerHTML = `
        <div class="task-checkbox"><i class="ph ph-check"></i></div>
        <div class="task-content">
            <h4 class="task-title">${task.subject}</h4>
            <div class="text-sm text-muted flex gap-2">
                <span><i class="ph ph-book-open"></i> ${task.title}</span>
                <span>•</span>
                <span><i class="ph ph-clock"></i> ${task.duration}</span>
            </div>
        </div>
    `;
    el.addEventListener('click', () => {
        task.completed = !task.completed;
        saveData();
        
        // animate
        if(task.completed) {
            el.classList.add('completed');
            const checkbox = el.querySelector('.task-checkbox');
            checkbox.style.transform = 'rotate(360deg) scale(1.1)';
            setTimeout(() => checkbox.style.transform = 'rotate(360deg) scale(1)', 200);
        } else {
            el.classList.remove('completed');
            const checkbox = el.querySelector('.task-checkbox');
            checkbox.style.transform = 'rotate(0deg)';
        }
        
        // Re-render other views if necessary
        callbackRender();
    });
    return el;
}

function renderDashboard() {
    const total = State.plan.tasks.length;
    const completed = State.plan.tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    els.dashProgressFill.style.width = `${percentage}%`;
    els.dashPercentage.textContent = `${percentage}%`;
    els.dashTasksCount.textContent = `${completed}/${total}`;
    
    const today = new Date(); today.setHours(0,0,0,0);
    const [y, m, d] = State.plan.settings.examDate.split('-');
    const examDateLocal = new Date(y, m - 1, d);
    const diffD = Math.ceil((examDateLocal - today) / (1000 * 60 * 60 * 24));
    
    els.examDaysLeft.textContent = diffD > 0 ? diffD : "0";
    els.examTargetDate.textContent = `Target: ${new Date(examDateLocal).toLocaleDateString('en-US', {month:'short', day:'numeric'})}`;
    els.dashHoursCount.textContent = `${State.plan.settings.dailyHours}h`;

    // Today Tasks
    const todayStr = getLocalYMD();
    const todayTasks = State.plan.tasks.filter(t => t.date === todayStr);
    
    els.dashboardTodayTasks.innerHTML = '';
    if(todayTasks.length === 0) {
        els.dashboardTodayTasks.innerHTML = `<div class="empty-state-mini"><i class="ph ph-wind"></i><p>No tasks mapped for today.</p></div>`;
    } else {
        todayTasks.forEach(task => els.dashboardTodayTasks.appendChild(createTaskElement(task, renderDashboard)));
    }
}

function renderStudyPlan() {
    const groups = {};
    State.plan.tasks.forEach(t => { if(!groups[t.date]) groups[t.date] = []; groups[t.date].push(t); });
    
    els.studyPlanContainer.innerHTML = '';
    const allDates = Object.keys(groups).sort();
    
    if(allDates.length === 0) return;

    allDates.forEach(dStr => {
        const [y, m, d] = dStr.split('-');
        const dateObj = new Date(y, m - 1, d);
        const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        
        const dayHeader = document.createElement('h3');
        dayHeader.className = 'date-header';
        dayHeader.textContent = dateFormatted;
        
        els.studyPlanContainer.appendChild(dayHeader);
        
        groups[dStr].forEach(task => {
            els.studyPlanContainer.appendChild(createTaskElement(task, () => {})); // passing empty as we don't need cascade updates for study plan
        });
    });
}

function renderProgress() {
    els.subjectProgressList.innerHTML = '';
    const subjStats = {};
    State.plan.settings.subjects.forEach(s => subjStats[s] = { total: 0, comp: 0 });
    
    State.plan.tasks.forEach(t => {
        if(subjStats[t.subject]) {
            subjStats[t.subject].total++;
            if(t.completed) subjStats[t.subject].comp++;
        }
    });

    for(const [sub, stats] of Object.entries(subjStats)) {
        const pct = stats.total === 0 ? 0 : Math.round((stats.comp / stats.total) * 100);
        
        const item = document.createElement('div');
        item.className = 'progress-list-item';
        item.innerHTML = `
            <div class="progress-list-item-header">
                <span>${sub}</span>
                <span>${pct}%</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${pct}%"></div>
            </div>
        `;
        els.subjectProgressList.appendChild(item);
    }
}

document.addEventListener('DOMContentLoaded', init);