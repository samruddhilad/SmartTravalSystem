/* ═══════════════════════════════════════════════════════════════════════════
   pdf-export.js — jsPDF itinerary download
═══════════════════════════════════════════════════════════════════════════ */

async function downloadPDF() {
  const data = JSON.parse(localStorage.getItem('travelItinerary') || 'null');
  if (!data) { showToast('⚠️ No itinerary data found.', 'warn'); return; }

  showToast('📄 Generating PDF...', 'info');

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, margin = 16;
    let y = margin;

    // ── Colors ──────────────────────────────────────────────────────────
    const PRIMARY   = [74, 64, 224];
    const SECONDARY = [0, 103, 94];
    const TEXT      = [37, 47, 61];
    const SUBTEXT   = [82, 92, 108];
    const SURFACE   = [244, 246, 255];
    const WHITE     = [255, 255, 255];

    // ── Header Band ──────────────────────────────────────────────────────
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, W, 52, 'F');

    // Accent strip
    doc.setFillColor(...SECONDARY);
    doc.rect(0, 48, W, 4, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...WHITE);
    doc.text('✈ Smart Travel Itinerary', margin, 22);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text(data.destination?.name || 'Your Destination', margin, 34);

    // Prob score badge
    doc.setFillColor(255, 255, 255, 0.2);
    doc.roundedRect(W - 60, 10, 44, 30, 4, 4, 'F');
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(`${data.probability_score || 0}%`, W - 44, 26, { align: 'center' });
    doc.setFontSize(7);
    doc.text('MATCH SCORE', W - 44, 34, { align: 'center' });

    y = 62;

    // ── Trip Summary Row ─────────────────────────────────────────────────
    const summaryItems = [
      ['Duration',       data.trip_summary?.duration || '—'],
      ['Budget',         data.trip_summary?.total_budget || '—'],
      ['Group',          data.trip_summary?.group_type || '—'],
      ['Transport',      data.trip_summary?.transport || '—'],
    ];

    const colW = (W - 2*margin) / 4;
    summaryItems.forEach(([label, value], i) => {
      const x = margin + i * colW;
      doc.setFillColor(...SURFACE);
      doc.roundedRect(x, y, colW - 3, 18, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SUBTEXT);
      doc.text(label.toUpperCase(), x + 4, y + 6);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT);
      doc.text(value, x + 4, y + 13);
    });
    y += 26;

    // ── Compatibility Score ──────────────────────────────────────────────
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SECONDARY);
    doc.text(`Compatibility Score: ${data.compatibility_score || 0}%`, margin, y);
    // Progress bar
    doc.setFillColor(220, 233, 255);
    doc.roundedRect(margin + 55, y-4, 100, 5, 2, 2, 'F');
    doc.setFillColor(...SECONDARY);
    doc.roundedRect(margin + 55, y-4, Math.max(0, Math.min(100, data.compatibility_score || 0)), 5, 2, 2, 'F');
    y += 10;

    // ── Separator ────────────────────────────────────────────────────────
    doc.setDrawColor(220, 233, 255);
    doc.setLineWidth(0.5);
    doc.line(margin, y, W - margin, y);
    y += 6;

    // ── Day-wise Itinerary ───────────────────────────────────────────────
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY);
    doc.text('📅 Day-by-Day Itinerary', margin, y);
    y += 7;

    const itinerary = data.itinerary || [];
    for (const day of itinerary) {
      // Check for page break
      if (y > 260) {
        doc.addPage();
        y = margin;
      }

      // Day header
      doc.setFillColor(...PRIMARY);
      doc.roundedRect(margin, y, W - 2*margin, 10, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...WHITE);
      doc.text(`Day ${day.day}: ${day.theme}`, margin + 4, y + 7);
      y += 14;

      // Budget indicator
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SUBTEXT);
      doc.text(`Day budget: ₹${(day.day_budget || 0).toLocaleString('en-IN')}`, W - margin, y - 4, { align: 'right' });

      // Morning / Afternoon / Evening slots
      const slots = [
        { time: '🌅 Morning',   slot: day.morning },
        { time: '🌞 Afternoon', slot: day.afternoon },
        { time: '🌆 Evening',   slot: day.evening },
      ];

      for (const { time, slot } of slots) {
        if (y > 270) { doc.addPage(); y = margin; }
        if (!slot || slot.activity === 'Free time / Leisure') continue;

        doc.setFillColor(234, 241, 255);
        doc.roundedRect(margin, y, W - 2*margin, 12, 2, 2, 'F');

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...TEXT);
        doc.text(time, margin + 3, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.text(slot.activity, margin + 35, y + 5);

        doc.setTextColor(...SUBTEXT);
        doc.text(slot.duration || '', W - margin - 28, y + 5);

        if (slot.cost > 0) {
          doc.setTextColor(...SECONDARY);
          doc.setFont('helvetica', 'bold');
          doc.text(`₹${slot.cost.toLocaleString('en-IN')}`, W - margin, y + 5, { align: 'right' });
        }
        y += 14;
      }
      y += 3;
    }

    // ── Budget Summary Page ──────────────────────────────────────────────
    if (y > 180) { doc.addPage(); y = margin; }
    else { y += 5; doc.setDrawColor(220, 233, 255); doc.line(margin, y, W-margin, y); y += 6; }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY);
    doc.text('💰 Budget Breakdown', margin, y);
    y += 7;

    const bs = data.budget_split || {};
    const budgetItems = [
      ['Transport',      bs.transport || 0],
      ['Accommodation',  bs.accommodation || 0],
      ['Food',           bs.food || 0],
      ['Activities',     bs.activities || 0],
      ['Shopping',       bs.shopping || 0],
    ];
    const totalBudget = bs.total || 1;

    for (const [label, val] of budgetItems) {
      if (y > 270) { doc.addPage(); y = margin; }
      const pct = Math.round((val / totalBudget) * 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT);
      doc.text(label, margin, y);
      doc.setTextColor(...SUBTEXT);
      doc.text(`${pct}%`, margin + 48, y);
      // bar
      doc.setFillColor(220, 233, 255);
      doc.roundedRect(margin + 58, y - 4, 80, 5, 2, 2, 'F');
      doc.setFillColor(...PRIMARY);
      doc.roundedRect(margin + 58, y - 4, Math.max(0, pct * 0.8), 5, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT);
      doc.text(`₹${val.toLocaleString('en-IN')}`, W - margin, y, { align: 'right' });
      y += 8;
    }

    // Total
    y += 2;
    doc.setFillColor(...PRIMARY);
    doc.roundedRect(margin, y, W - 2*margin, 12, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text('Total Estimated Spend', margin + 4, y + 8);
    doc.text(`₹${totalBudget.toLocaleString('en-IN')}`, W - margin - 4, y + 8, { align: 'right' });
    y += 16;

    // ── Footer ───────────────────────────────────────────────────────────
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFillColor(...SURFACE);
      doc.rect(0, 287, W, 10, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SUBTEXT);
      doc.text('Generated by Voyager AI — Smart Travel Itinerary Planner', margin, 292);
      doc.text(`Page ${p} of ${pages}`, W - margin, 292, { align: 'right' });
    }

    // ── Save ─────────────────────────────────────────────────────────────
    const destName = (data.destination?.name || 'Travel').replace(/\s+/g, '_');
    doc.save(`Voyager_AI_${destName}_Itinerary.pdf`);
    showToast('✅ PDF downloaded successfully!', 'info');

  } catch (err) {
    console.error('PDF generation error:', err);
    showToast('❌ PDF generation failed. Try printing instead.', 'error');
  }
}
