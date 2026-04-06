/* ═══════════════════════════════════════════════════════════════════════════
   charts.js — Chart.js visualizations
═══════════════════════════════════════════════════════════════════════════ */

let budgetChartInstance = null;

function renderBudgetChart(budgetSplit) {
  const ctx = document.getElementById('budgetChart');
  if (!ctx) return;

  const labels = ['Transport', 'Accommodation', 'Food', 'Activities', 'Shopping'];
  const values = [
    budgetSplit.transport || 0,
    budgetSplit.accommodation || 0,
    budgetSplit.food || 0,
    budgetSplit.activities || 0,
    budgetSplit.shopping || 0,
  ];

  const colors = [
    '#4a40e0',  // primary indigo
    '#00675e',  // secondary teal
    '#702ae1',  // tertiary violet
    '#e06540',  // warm orange
    '#40a0e0',  // sky blue
  ];

  if (budgetChartInstance) {
    budgetChartInstance.destroy();
  }

  budgetChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 12,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed;
              const total = values.reduce((s, v) => s + v, 0);
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return ` ₹${val.toLocaleString('en-IN')} (${pct}%)`;
            },
          },
          backgroundColor: 'white',
          titleColor: '#252f3d',
          bodyColor: '#525c6c',
          borderColor: '#dce9ff',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          boxShadow: '0 8px 32px rgba(74,64,224,0.08)',
        },
      },
      animation: {
        animateRotate: true,
        duration: 1000,
        easing: 'easeInOutQuart',
      },
    },
  });

  // Render custom legend
  const legend = document.getElementById('budgetLegend');
  if (legend) {
    legend.innerHTML = labels.map((label, i) => `
      <div class="budget-legend-item">
        <div class="legend-dot" style="background:${colors[i]};"></div>
        <span style="flex:1;font-size:0.8125rem;">${label}</span>
        <span style="font-weight:700;font-size:0.8125rem;">₹${values[i].toLocaleString('en-IN')}</span>
      </div>
    `).join('');
  }
}

function renderBudgetBreakdown(budgetSplit, totalBudget) {
  const container = document.getElementById('budgetBreakdown');
  if (!container) return;

  const total = totalBudget || budgetSplit.total || 1;
  const items = [
    { label: 'Transport',     value: budgetSplit.transport,     icon: '✈️' },
    { label: 'Accommodation', value: budgetSplit.accommodation,  icon: '🏨' },
    { label: 'Food',          value: budgetSplit.food,            icon: '🍽️' },
    { label: 'Activities',    value: budgetSplit.activities,      icon: '🎯' },
    { label: 'Shopping',      value: budgetSplit.shopping,        icon: '🛍️' },
  ];

  const lineColors = ['#4a40e0','#00675e','#702ae1','#e06540','#40a0e0'];

  container.innerHTML = items.map((item, i) => {
    const pct = Math.round((item.value / total) * 100);
    return `
      <div style="margin-bottom:0.875rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
          <span style="font-size:0.875rem;">${item.icon} ${item.label}</span>
          <div style="text-align:right;">
            <span style="font-weight:700;font-size:0.875rem;">₹${(item.value||0).toLocaleString('en-IN')}</span>
            <span class="body-md" style="font-size:0.75rem;margin-left:0.375rem;">${pct}%</span>
          </div>
        </div>
        <div class="progress-bar" style="height:6px;">
          <div class="progress-fill" style="width:${pct}%;background:${lineColors[i]};animation-duration:${0.8+i*0.1}s;"></div>
        </div>
      </div>
    `;
  }).join('') + `
    <div style="margin-top:var(--space-md);padding-top:var(--space-md);border-top:1px solid rgba(163,174,192,0.15);display:flex;justify-content:space-between;">
      <span style="font-weight:600;">Total Estimated</span>
      <span style="font-family:var(--font-display);font-size:1rem;font-weight:800;color:var(--primary);">₹${(budgetSplit.total||0).toLocaleString('en-IN')}</span>
    </div>
  `;
}
