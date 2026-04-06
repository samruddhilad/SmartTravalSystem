/* ═══════════════════════════════════════════════════════════════════════════
   app.js — Main form logic for index.html
═══════════════════════════════════════════════════════════════════════════ */

const INTERESTS = [
  'beaches', 'trekking', 'temples', 'water_sports', 'nightlife',
  'food', 'culture', 'history', 'nature', 'photography',
  'yoga', 'adventure', 'wildlife', 'heritage', 'camping',
  'backwaters', 'monasteries', 'ayurveda', 'cycling', 'birdwatching',
];

const INTEREST_ICONS = {
  beaches: '🏖️', trekking: '🥾', temples: '🛕', water_sports: '🤿', nightlife: '🎶',
  food: '🍜', culture: '🎭', history: '🏛️', nature: '🌿', photography: '📷',
  yoga: '🧘', adventure: '⚡', wildlife: '🦁', heritage: '🏯', camping: '⛺',
  backwaters: '🛶', monasteries: '🔔', ayurveda: '💆', cycling: '🚴', birdwatching: '🦜',
};

let currentStep = 1;
let selectedMood = '';
let selectedInterests = [];
let selectedWeather = '';

// ─── Init ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  buildInterestChips();
  initScrollReveal();
  initNavbarScroll();
  setDefaultDates();

  // Check for existing results
  if (localStorage.getItem('travelItinerary')) {
    const btn = document.getElementById('viewResultsBtn');
    if (btn) btn.style.display = 'inline-flex';
  }

  // Form submit
  document.getElementById('plannerForm').addEventListener('submit', handleSubmit);
});

function setDefaultDates() {
  const today = new Date();
  const next = new Date(today);
  next.setDate(next.getDate() + 7);
  const sd = document.getElementById('start_date');
  const ed = document.getElementById('end_date');
  if (sd) sd.value = today.toISOString().split('T')[0];
  if (ed) ed.value = next.toISOString().split('T')[0];
}

// ─── Interest Chips ──────────────────────────────────────────────────────

function buildInterestChips() {
  const container = document.getElementById('interestChips');
  if (!container) return;
  container.innerHTML = INTERESTS.map(i => `
    <div class="chip" data-interest="${i}" onclick="toggleInterest(this,'${i}')">
      ${INTEREST_ICONS[i] || '⭐'} ${i.replace(/_/g,' ')}
    </div>
  `).join('');
}

function toggleInterest(el, interest) {
  if (selectedInterests.includes(interest)) {
    selectedInterests = selectedInterests.filter(i => i !== interest);
    el.classList.remove('selected');
  } else {
    selectedInterests.push(interest);
    el.classList.add('selected');
  }
}

// ─── Mood Chips ──────────────────────────────────────────────────────────

document.addEventListener('click', (e) => {
  const chip = e.target.closest('.mood-chip');
  if (!chip) return;
  document.querySelectorAll('.mood-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
  selectedMood = chip.dataset.mood;
  document.getElementById('mood').value = selectedMood;
});

// ─── Weather Selection ───────────────────────────────────────────────────

function selectWeather(el, weather) {
  document.querySelectorAll('.weather-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedWeather = weather;
  document.getElementById('weather').value = weather;
  updateSummaryCard();
}

// ─── Budget Display ──────────────────────────────────────────────────────

function updateBudgetDisplay(value) {
  const display = document.getElementById('budgetDisplay');
  if (display) {
    display.textContent = `₹${parseInt(value).toLocaleString('en-IN')}`;
  }
}

// ─── Step Navigation ─────────────────────────────────────────────────────

function nextStep(fromStep) {
  if (!validateStep(fromStep)) return;
  goToStep(fromStep + 1);
}

function prevStep(fromStep) {
  goToStep(fromStep - 1);
}

function goToStep(step) {
  // Hide current
  const current = document.getElementById(`step-${currentStep}`);
  const next    = document.getElementById(`step-${step}`);
  if (!next) return;

  current.classList.remove('active');
  current.classList.add('leaving');
  setTimeout(() => { current.classList.remove('leaving'); }, 400);

  next.classList.add('active', 'entering');
  setTimeout(() => { next.classList.remove('entering'); }, 400);

  currentStep = step;
  updateStepper(step);

  if (step === 4) updateSummaryCard();

  window.scrollTo({ top: document.getElementById('planner')?.offsetTop - 80 || 0, behavior: 'smooth' });
}

function updateStepper(active) {
  for (let i = 1; i <= 4; i++) {
    const ind = document.getElementById(`step-indicator-${i}`);
    const con = document.getElementById(`connector-${i}`);
    if (!ind) continue;
    ind.classList.remove('active', 'done');
    if (i < active)       ind.classList.add('done');
    else if (i === active) ind.classList.add('active');
    if (con) con.classList.toggle('done', i < active);
  }
}

// ─── Validation ──────────────────────────────────────────────────────────

function validateStep(step) {
  if (step === 1) {
    if (!selectedMood) { showToast('⚠️ Please select your travel mood.', 'warn'); return false; }
    const gt = document.getElementById('group_type').value;
    const dd = document.getElementById('duration_days').value;
    if (!gt) { showToast('⚠️ Please select your travel group.', 'warn'); return false; }
    if (!dd) { showToast('⚠️ Please select trip duration.', 'warn'); return false; }
  }
  if (step === 2) {
    const tr = document.getElementById('transport').value;
    const ac = document.getElementById('accommodation').value;
    if (!tr) { showToast('⚠️ Please select your transport mode.', 'warn'); return false; }
    if (!ac) { showToast('⚠️ Please select accommodation type.', 'warn'); return false; }
  }
  return true;
}

// ─── Summary Card ────────────────────────────────────────────────────────

function updateSummaryCard() {
  const el = document.getElementById('summaryContent');
  if (!el) return;
  const data = collectFormData();
  const items = [
    ['🎭 Mood',         data.mood ? data.mood.charAt(0).toUpperCase() + data.mood.slice(1) : '—'],
    ['👥 Group',        data.group_type ? data.group_type.charAt(0).toUpperCase() + data.group_type.slice(1) : '—'],
    ['📅 Duration',     data.duration_days ? `${data.duration_days} days` : '—'],
    ['💰 Budget',       data.budget ? `₹${parseInt(data.budget).toLocaleString('en-IN')}` : '—'],
    ['✈️ Transport',    data.transport ? data.transport.charAt(0).toUpperCase() + data.transport.slice(1) : '—'],
    ['🏨 Stay',         data.accommodation ? data.accommodation.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase()) : '—'],
    ['🌤️ Weather',      data.weather ? data.weather.charAt(0).toUpperCase() + data.weather.slice(1) : '—'],
    ['🎯 Interests',    selectedInterests.length ? selectedInterests.slice(0,3).join(', ') + (selectedInterests.length > 3 ? ` +${selectedInterests.length-3}` : '') : '—'],
  ];
  el.innerHTML = items.map(([label, value]) => `
    <div class="info-row" style="padding:0.375rem 0;">
      <span style="font-size:0.8rem;color:var(--on-surface-variant);">${label}</span>
      <span style="font-size:0.8rem;font-weight:600;">${value}</span>
    </div>
  `).join('');
}

// ─── Form Submission ─────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();

  if (!selectedWeather) { showToast('⚠️ Please select expected weather conditions.', 'warn'); return; }

  const prefs = collectFormData();
  const loading = document.getElementById('loadingOverlay');
  const messages = [
    'Running Bayesian inference across destinations...',
    'Computing P(destination | mood, budget, weather)...',
    'Scoring activities by P(activity | interest, weather)...',
    'Computing compatibility score...',
    'Generating day-by-day itinerary...',
    'Finding hidden gems...',
    'Preparing your travel plan...',
  ];

  loading.classList.add('show');
  let msgIdx = 0;
  const msgEl = document.getElementById('loadingSubtext');
  const msgInterval = setInterval(() => {
    if (msgEl && msgIdx < messages.length) {
      msgEl.textContent = messages[msgIdx++];
    }
  }, 800);

  try {
    const result = await fetchItinerary(prefs);
    clearInterval(msgInterval);
    localStorage.setItem('travelItinerary', JSON.stringify(result));
    localStorage.setItem('travelPreferences', JSON.stringify(prefs));

    // Redirect to results
    setTimeout(() => { window.location.href = 'results.html'; }, 400);
  } catch (err) {
    clearInterval(msgInterval);
    loading.classList.remove('show');
    showToast('❌ Something went wrong. Please try again.', 'error');
    console.error(err);
  }
}

function collectFormData() {
  return {
    mood:          selectedMood,
    group_type:    document.getElementById('group_type')?.value || '',
    duration_days: document.getElementById('duration_days')?.value || 5,
    budget:        document.getElementById('budget')?.value || 30000,
    start_date:    document.getElementById('start_date')?.value || '',
    end_date:      document.getElementById('end_date')?.value || '',
    transport:     document.getElementById('transport')?.value || '',
    accommodation: document.getElementById('accommodation')?.value || '',
    interests:     selectedInterests,
    weather:       selectedWeather,
  };
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ─── Navbar scroll shrink ─────────────────────────────────────────────────

function initNavbarScroll() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    if (window.scrollY > 50) {
      nav.style.padding = '0.625rem 1.5rem';
    } else {
      nav.style.padding = '1rem 1.5rem';
    }
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMsg');
  const icon = document.getElementById('toastIcon');
  if (!toast || !msg) return;

  msg.textContent = message;
  icon.textContent = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
  toast.style.borderLeft = `4px solid ${type==='error'?'var(--error)':type==='warn'?'#e65c00':'var(--primary)'}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}
