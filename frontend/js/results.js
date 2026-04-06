/* ═══════════════════════════════════════════════════════════════════════════
   results.js — Renders the itinerary results page
═══════════════════════════════════════════════════════════════════════════ */

const TYPE_EMOJI = {
  outdoor: '🌿', cultural: '🎭', wellness: '🧘', culinary: '🍜',
  leisure: '😌', spiritual: '🙏', heritage: '🏛️',
};

const TYPE_COLORS = {
  outdoor: '#4a40e0', cultural: '#702ae1', wellness: '#00675e',
  culinary: '#e06540', leisure: '#6d7788', spiritual: '#ff9800', heritage: '#009688',
};

// ─── Init ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const data = JSON.parse(localStorage.getItem('travelItinerary') || 'null');

  if (!data) {
    showNoData();
    return;
  }

  hideLoading();
  renderAll(data);
});

function showNoData() {
  document.getElementById('noDataState').style.display = '';
  document.getElementById('resultsLayout').style.display = 'none';
  hideLoading();
}

function hideLoading() {
  const ov = document.getElementById('loadingOverlay');
  if (ov) ov.classList.remove('show');
}

function showLoading(text = 'Loading...') {
  const ov = document.getElementById('loadingOverlay');
  const t  = document.getElementById('loadingText');
  if (ov) ov.classList.add('show');
  if (t)  t.textContent = text;
}

// ─── Master Render ────────────────────────────────────────────────────────

function renderAll(data) {
  renderHero(data);
  renderSidebar(data);
  renderItinerary(data.itinerary || [], 'planAContent', data);
  renderAltPlan(data.alternative_plan);
  renderBudgetTab(data);
  renderHiddenGems(data.hidden_gems || []);
  renderPackingList(data.packing_list || {});
  initScrollAnimations();
}

// ─── Hero ─────────────────────────────────────────────────────────────────

function renderHero(data) {
  const dest = data.destination || {};
  const prob = data.probability_score || 0;
  const summary = data.trip_summary || {};

  // Text
  el('destName').textContent  = dest.name || 'Your Destination';
  el('destDescription').textContent = dest.description || '';

  // Tags
  const tagsEl = el('destTags');
  if (tagsEl && dest.tags) {
    tagsEl.innerHTML = dest.tags.slice(0, 4).map(t =>
      `<span class="tag" style="background:rgba(255,255,255,0.15);color:white;font-size:0.75rem;">${t.replace(/_/g,' ')}</span>`
    ).join('');
  }

  // Probability score ring
  el('probScore').textContent = `${prob}%`;
  const circle = el('scoreCircle');
  if (circle) {
    const circumference = 326.73;
    const offset = circumference * (1 - prob / 100);
    setTimeout(() => { circle.style.strokeDashoffset = offset; }, 200);
  }

  // Download bar meta
  const dlDest = el('dlDestName');
  const dlMeta = el('dlMeta');
  if (dlDest) dlDest.textContent = `${dest.name || 'Your'} Itinerary`;
  if (dlMeta) dlMeta.textContent = `${summary.duration} · ${summary.total_budget}`;

  // Map text
  const mapText = el('mapText');
  if (mapText) mapText.textContent = dest.name || 'Your Destination';

  // Meta cards
  const metas = [
    { icon: '📅', label: 'Duration',   value: summary.duration   || '—' },
    { icon: '💰', label: 'Budget',     value: summary.total_budget || '—' },
    { icon: '👥', label: 'Group',      value: summary.group_type  || '—' },
    { icon: '✈️', label: 'Transport',  value: summary.transport   || '—' },
    { icon: '🏨', label: 'Stay',       value: summary.accommodation || '—' },
  ];
  const metaEl = el('metaCards');
  if (metaEl) {
    metaEl.innerHTML = metas.map(m => `
      <div style="background:rgba(255,255,255,0.12);backdrop-filter:blur(10px);border-radius:var(--radius-md);padding:0.875rem 1rem;color:white;">
        <div style="font-size:1.25rem;">${m.icon}</div>
        <div style="font-size:0.7rem;opacity:0.7;margin:0.25rem 0;">${m.label}</div>
        <div style="font-weight:700;font-size:0.9rem;">${m.value}</div>
      </div>
    `).join('');
  }
}

// ─── Sidebar ──────────────────────────────────────────────────────────────

function renderSidebar(data) {
  renderTripDetails(data.trip_summary || {});
  renderCompatibility(data.compatibility_score || 0);
  renderDestRanking(data.dest_ranking || []);
}

function renderTripDetails(summary) {
  const el_ = el('tripDetails');
  if (!el_) return;
  const rows = [
    ['📍 Destination', summary.destination  || '—'],
    ['📅 Duration',    summary.duration      || '—'],
    ['💰 Budget',      summary.total_budget  || '—'],
    ['💸 Est. Spend',  summary.estimated_spend || '—'],
    ['📆 Start',       summary.start_date    || '—'],
    ['📆 End',         summary.end_date      || '—'],
    ['✈️ Transport',   summary.transport     || '—'],
    ['🏨 Stay',        summary.accommodation || '—'],
  ];
  el_.innerHTML = rows.map(([label, value]) => `
    <div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-value" style="text-align:right;max-width:60%;">${value}</span>
    </div>
  `).join('');
}

function renderCompatibility(score) {
  const scoreEl = el('compatScore');
  const barEl   = el('compatBar');
  const labelEl = el('compatLabel');

  if (scoreEl) scoreEl.textContent = `${score}%`;
  if (barEl)   setTimeout(() => { barEl.style.width = `${score}%`; }, 300);

  const label =
    score >= 85 ? 'Excellent match! This itinerary aligns perfectly with your interests.' :
    score >= 70 ? 'Great match! Most activities align with your preferences.' :
    score >= 55 ? 'Good match with some variety to explore new experiences.' :
    'Moderate match — a great way to discover something new!';
  if (labelEl) labelEl.textContent = label;
}

function renderDestRanking(ranking) {
  const el_ = el('destRanking');
  if (!el_) return;

  el_.innerHTML = ranking.map((dest, i) => `
    <div class="dest-rank-item stagger-child" style="opacity:0;">
      <div style="font-size:0.75rem;font-weight:700;color:${i===0?'var(--primary)':'var(--on-surface-variant)'};min-width:20px;">#${i+1}</div>
      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
          <span style="font-size:0.8125rem;font-weight:${i===0?'700':'500'};">${dest.name}</span>
          <span style="font-size:0.75rem;color:var(--on-surface-variant);">${dest.probability}%</span>
        </div>
        <div class="dest-rank-bar">
          <div class="dest-rank-fill" data-width="${dest.probability}" style="width:0%;${i===0?'background:var(--grad-primary);':'background:var(--surface-container-highest);'}"></div>
        </div>
      </div>
    </div>
  `).join('');

  // Animate bars
  setTimeout(() => {
    el_.querySelectorAll('.dest-rank-fill').forEach(bar => {
      bar.style.width = `${bar.dataset.width}%`;
    });
    el_.querySelectorAll('.stagger-child').forEach((el, i) => {
      setTimeout(() => { el.style.opacity = '1'; el.style.transition = 'opacity 0.4s ease'; }, i*80);
    });
  }, 300);
}

// ─── Itinerary ────────────────────────────────────────────────────────────

function renderItinerary(itinerary, containerId, data) {
  const container = el(containerId);
  if (!container) return;

  if (!itinerary || itinerary.length === 0) {
    container.innerHTML = `<div class="no-data"><p class="body-md">No itinerary available.</p></div>`;
    return;
  }

  container.innerHTML = itinerary.map((day, idx) => `
    <div class="day-card stagger-child" data-day="${idx}">
      <div class="day-header" onclick="toggleDay(${idx})">
        <div style="display:flex;align-items:center;gap:var(--space-md);">
          <div class="day-badge">Day ${day.day}</div>
          <div>
            <div style="font-weight:700;font-size:0.9375rem;">${day.theme}</div>
            <div class="body-md" style="font-size:0.75rem;margin-top:0.125rem;">
              ₹${(day.day_budget||0).toLocaleString('en-IN')} budget · ${countActivities(day)} activities
            </div>
          </div>
        </div>
        <div style="font-size:1.25rem;transition:transform 0.3s ease;" id="chevron-${idx}">›</div>
      </div>
      <div class="day-content ${idx === 0 ? 'open' : ''}" id="day-content-${idx}">
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          ${renderSlot(day.morning,   '🌅', 'Morning')}
          ${renderSlot(day.afternoon, '🌞', 'Afternoon')}
          ${renderSlot(day.evening,   '🌆', 'Evening')}
        </div>
      </div>
    </div>
  `).join('');

  // Rotate chevron for open day
  const ch = document.getElementById('chevron-0');
  if (ch) ch.style.transform = 'rotate(90deg)';
}

function renderSlot(slot, timeEmoji, timeName) {
  if (!slot) return '';
  const type    = slot.type || 'leisure';
  const typeEmoji = TYPE_EMOJI[type] || '📍';
  const typeColor = TYPE_COLORS[type] || '#6d7788';

  return `
    <div class="activity-slot">
      <div class="slot-time">${timeEmoji} ${slot.time || ''}</div>
      <div class="slot-icon ${type}" style="background:${typeColor}20; color:${typeColor};">${typeEmoji}</div>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:0.875rem;">${slot.activity || 'Free time'}</div>
        <div style="display:flex;gap:var(--space-sm);margin-top:0.25rem;flex-wrap:wrap;">
          <span class="tag" style="font-size:0.7rem;">${slot.duration || ''}</span>
          ${slot.cost > 0 ? `<span class="tag tag-secondary" style="font-size:0.7rem;">₹${slot.cost.toLocaleString('en-IN')}</span>` : `<span class="tag" style="font-size:0.7rem;">Free</span>`}
          ${slot.energy ? `<span class="tag" style="font-size:0.7rem;">${slot.energy} energy</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function countActivities(day) {
  return [day.morning, day.afternoon, day.evening]
    .filter(s => s && s.activity !== 'Free time / Leisure').length;
}

function toggleDay(idx) {
  const content = el(`day-content-${idx}`);
  const chevron = el(`chevron-${idx}`);
  if (!content) return;
  const isOpen = content.classList.contains('open');
  content.classList.toggle('open', !isOpen);
  if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
}

// ─── Plan A / Plan B Toggle ───────────────────────────────────────────────

function showPlan(plan) {
  el('planAContent').style.display = plan === 'A' ? '' : 'none';
  el('planBContent').style.display = plan === 'B' ? '' : 'none';
  el('planABtn').classList.toggle('active', plan === 'A');
  el('planBBtn').classList.toggle('active', plan === 'B');
}

// ─── Alternative Plan ─────────────────────────────────────────────────────

function renderAltPlan(altPlan) {
  if (!altPlan) return;

  const reasonEl = el('altReason');
  if (reasonEl) {
    reasonEl.textContent = altPlan.note ||
      `Alternative plan: ${altPlan.destination?.name || 'Alternative Destination'}`;
  }

  // Render alt itinerary in Plan B tab
  const planBEl = el('planBContent');
  if (planBEl && altPlan.itinerary) {
    planBEl.innerHTML = `
      <div class="card" style="margin-bottom:var(--space-lg);background:rgba(112,42,225,0.05);border:1px solid rgba(112,42,225,0.15);">
        <div style="display:flex;align-items:center;gap:var(--space-md);">
          <div style="font-size:2rem;">🗺️</div>
          <div>
            <div style="font-weight:700;font-size:1rem;">${altPlan.destination?.name || 'Alternative'}</div>
            <div class="body-md">${altPlan.destination?.description || ''}</div>
          </div>
        </div>
      </div>
    `;
    altPlan.itinerary.forEach((day, idx) => {
      planBEl.innerHTML += `
        <div class="day-card" style="opacity:1;transform:none;">
          <div class="day-header" onclick="toggleAltDay(${idx})">
            <div style="display:flex;align-items:center;gap:var(--space-md);">
              <div class="day-badge" style="background:var(--grad-tertiary);">Day ${day.day}</div>
              <div style="font-weight:700;font-size:0.9rem;">${day.theme}</div>
            </div>
            <div id="alt-chevron-${idx}" style="font-size:1.25rem;transition:transform 0.3s ease;">›</div>
          </div>
          <div class="day-content ${idx===0?'open':''}" id="alt-day-${idx}">
            <div style="display:flex;flex-direction:column;gap:0.5rem;">
              ${renderSlot(day.morning,'🌅','Morning')}
              ${renderSlot(day.afternoon,'🌞','Afternoon')}
              ${renderSlot(day.evening,'🌆','Evening')}
            </div>
          </div>
        </div>
      `;
    });
    const ch = document.getElementById('alt-chevron-0');
    if (ch) ch.style.transform = 'rotate(90deg)';
  }

  // Alt details tab
  const altDetails = el('altDetails');
  if (altDetails && altPlan.destination) {
    altDetails.innerHTML = `
      <div class="grid-2">
        ${(altPlan.destination.tags || []).slice(0,4).map(t => `
          <div class="card card-flat" style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-md);">
            <span style="font-size:1.25rem;">${TYPE_EMOJI[t]||'📍'}</span>
            <span style="font-weight:600;font-size:0.875rem;">${t.replace(/_/g,' ')}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function toggleAltDay(idx) {
  const content = el(`alt-day-${idx}`);
  const chevron = el(`alt-chevron-${idx}`);
  if (!content) return;
  const isOpen = content.classList.contains('open');
  content.classList.toggle('open', !isOpen);
  if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
}

// ─── Budget Tab ───────────────────────────────────────────────────────────

function renderBudgetTab(data) {
  const budgetSplit = data.budget_split || {};
  const prefs       = data.user_preferences || {};
  const totalBudget = parseInt(prefs.budget) || budgetSplit.total || 30000;

  // Defer chart render until tab is shown (avoids hidden canvas issues)
  window._pendingBudgetData = { budgetSplit, totalBudget };

  // Budget tip
  const tipEl = el('budgetTip');
  if (tipEl) {
    const spent  = budgetSplit.total || 0;
    const budget = totalBudget;
    const leftover = budget - spent;
    if (leftover > 0) {
      tipEl.innerHTML = `You have <strong style="color:var(--secondary);">₹${leftover.toLocaleString('en-IN')}</strong> left in your budget. Consider upgrading your accommodation or adding a premium activity!`;
    } else {
      tipEl.innerHTML = `Your estimated spend is <strong style="color:var(--error);">₹${Math.abs(leftover).toLocaleString('en-IN')}</strong> over budget. Consider switching to a hostel or choosing budget transport.`;
    }
  }
}

// ─── Hidden Gems ──────────────────────────────────────────────────────────

function renderHiddenGems(gems) {
  const container = el('gemsGrid');
  if (!container) return;

  container.innerHTML = gems.map(gem => `
    <div class="gem-card card-hover-lift">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
        <div>
          <div style="font-weight:700;font-size:0.9375rem;">${gem.name}</div>
          <div class="body-md" style="font-size:0.75rem;">${gem.state || ''}</div>
        </div>
        <div class="crowd-badge crowd-${gem.crowd_level}">
          ${gem.crowd_level.replace('_',' ')} crowd
        </div>
      </div>
      <p class="body-md" style="font-size:0.8125rem;margin:0.5rem 0;">${gem.description}</p>
      <div style="display:flex;gap:0.375rem;flex-wrap:wrap;margin-top:0.75rem;">
        ${(gem.best_for || []).map(t => `<span class="tag tag-secondary" style="font-size:0.7rem;">${t.replace(/_/g,' ')}</span>`).join('')}
      </div>
      <div style="margin-top:0.75rem;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:0.75rem;color:var(--on-surface-variant);">
          Uniqueness: <strong style="color:var(--tertiary);">${Math.round(gem.uniqueness_value*100)}%</strong>
        </div>
        <div style="font-size:0.75rem;color:var(--on-surface-variant);">
          ~₹${(gem.avg_cost_per_day||0).toLocaleString('en-IN')}/day
        </div>
      </div>
    </div>
  `).join('');
}

// ─── Packing List ─────────────────────────────────────────────────────────

function renderPackingList(packing) {
  const container = el('packingLists');
  if (!container) return;

  const sections = [
    { key: 'essentials',  label: '🎒 Essentials',          color: '#4a40e0' },
    { key: 'destination', label: '📍 Destination-Specific', color: '#702ae1' },
    { key: 'weather',     label: '🌤️ Weather Gear',         color: '#00675e' },
    { key: 'activities',  label: '🎯 Activity Gear',         color: '#e06540' },
  ];

  container.innerHTML = sections.map(section => {
    const items = packing[section.key] || [];
    if (items.length === 0) return '';
    return `
      <div class="packing-section">
        <h4 style="color:${section.color};">${section.label}</h4>
        <div class="grid-2">
          ${items.map((item, i) => `
            <div class="checklist-item" onclick="toggleChecklistItem(this)" id="pack-${section.key}-${i}">
              <div class="checklist-checkbox">
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none" display="none">
                  <path d="M1 4L4.5 7.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span style="font-size:0.875rem;">${formatPackingItem(item)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function formatPackingItem(item) {
  return item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function toggleChecklistItem(el) {
  el.classList.toggle('checked');
  const checkbox = el.querySelector('.checklist-checkbox');
  const svg = checkbox?.querySelector('svg');
  if (el.classList.contains('checked')) {
    checkbox.style.background = 'var(--secondary)';
    checkbox.style.borderColor = 'var(--secondary)';
    if (svg) svg.removeAttribute('display');
  } else {
    checkbox.style.background = '';
    checkbox.style.borderColor = '';
    if (svg) svg.setAttribute('display', 'none');
  }
  checkbox.classList.add('checked-anim');
  setTimeout(() => checkbox.classList.remove('checked-anim'), 300);
}

// ─── Tab Switching ─────────────────────────────────────────────────────────

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const contentEl = el(`content-${tabId}`);
  if (contentEl) contentEl.classList.add('active');
  if (btn) btn.classList.add('active');

  // Lazy-render budget chart when tab becomes visible
  if (tabId === 'budget' && window._pendingBudgetData) {
    const { budgetSplit, totalBudget } = window._pendingBudgetData;
    setTimeout(() => {
      renderBudgetChart(budgetSplit);
      renderBudgetBreakdown(budgetSplit, totalBudget);
    }, 100);
    window._pendingBudgetData = null;
  }
}

// ─── Scroll Animations ────────────────────────────────────────────────────

function initScrollAnimations() {
  setTimeout(() => {
    const daycards = document.querySelectorAll('.day-card');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            e.target.classList.add('animated');
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }, parseInt(e.target.dataset.day || 0) * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    daycards.forEach(c => obs.observe(c));
  }, 100);
}

// ─── Regenerate ──────────────────────────────────────────────────────────

function regenerateItinerary() {
  window.location.href = 'index.html#planner';
}

// ─── Helper ──────────────────────────────────────────────────────────────

function el(id) { return document.getElementById(id); }

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msg   = document.getElementById('toastMsg');
  const icon  = document.getElementById('toastIcon');
  if (!toast || !msg) return;
  msg.textContent = message;
  icon.textContent = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
  toast.style.borderLeft = `4px solid ${type==='error'?'var(--error)':type==='warn'?'#e65c00':'var(--primary)'}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}
