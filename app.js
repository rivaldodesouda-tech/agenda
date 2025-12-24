// ==========================================================
// CORES
// ==========================================================
var COLORS = [
    '#FF0000', '#FF6B00', '#FFD700', '#00D000', '#00B8D4',
    '#0066FF', '#6600FF', '#FF00FF', '#FF1493', '#00FF7F',
    '#FF4500', '#1E90FF', '#DC143C', '#00CED1', '#FFB6C1',
    '#32CD32', '#FF8C00', '#00FF00', '#FF69B4',
    '#000000', '#808080'
];

var FERIADOS_BRASIL = [
    '01-01','02-13','04-21','05-01','09-07','10-12','11-02','11-20','12-25'
];

// ==========================================================
// ESTADO
// ==========================================================
var appState = {
    currentDate: new Date(),
    selectedDay: null,
    selectedColor: 0,
    selectedLineIndex: null,
    days: {},
    view: 'week'
};

// ==========================================================
// INIT
// ==========================================================
document.addEventListener('DOMContentLoaded', function () {
    loadDataFromStorage();
    initializeEventListeners();
    renderWeekView();
    renderColorPalette();
});

// ==========================================================
// STORAGE
// ==========================================================
function saveDataToStorage() {
    localStorage.setItem('plannerData', JSON.stringify(appState.days));
}

function loadDataFromStorage() {
    var data = localStorage.getItem('plannerData');
    if (data) appState.days = JSON.parse(data);
}

// ==========================================================
// EVENTOS
// ==========================================================
function initializeEventListeners() {

    document.getElementById('prevNav').onclick = function () {
        appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
        renderMonthView();
    };

    document.getElementById('nextNav').onclick = function () {
        appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
        renderMonthView();
    };

    document.getElementById('viewWeekly').onclick = function () {
        appState.view = 'week';
        renderWeekView();
    };

    document.getElementById('viewMonthly').onclick = function () {
        appState.view = 'month';
        renderMonthView();
    };

    document.getElementById('printMonthBtn').onclick = function () {
        printMonth();
    };

    document.getElementById('pdfMonthBtn').onclick = function () {
        exportMonthToPdf();
    };
}

// ==========================================================
// UTIL
// ==========================================================
function getDateString(d) {
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function isHolidayDate(d) {
    return FERIADOS_BRASIL.includes(
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0')
    );
}

function renderLineWithColors(line) {
    return line.html || line.text || '';
}

// ==========================================================
// VISÃO SEMANAL (inalterada)
// ==========================================================
function renderWeekView() {
    document.getElementById('weekView').style.display = 'flex';
    document.getElementById('monthView').style.display = 'none';
}

// ==========================================================
// VISÃO MENSAL (somente dias do mês)
// ==========================================================
function renderMonthView() {
    var container = document.getElementById('monthCalendar');
    container.innerHTML = '';

    var year = appState.currentDate.getFullYear();
    var month = appState.currentDate.getMonth();

    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);

    for (let d = 1; d <= lastDay.getDate(); d++) {
        let date = new Date(year, month, d);
        let cell = document.createElement('div');
        cell.className = 'month-day-cell';
        cell.innerHTML = `<strong>${d}</strong>`;
        container.appendChild(cell);
    }

    document.getElementById('weekView').style.display = 'none';
    document.getElementById('monthView').style.display = 'flex';
}

// ==========================================================
// IMPRESSÃO MENSAL (CORRIGIDA)
// ==========================================================
function printMonth() {
    exportMonthToPdf();
}

// ==========================================================
// PDF MENSAL — DEFINITIVO
// ==========================================================
async function exportMonthToPdf() {

    const { jsPDF } = window.jspdf;

    const year = appState.currentDate.getFullYear();
    const month = appState.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalCells = startOffset + totalDays;
    const totalWeeks = Math.ceil(totalCells / 7);

    let currentDay = 1;

    const wrapper = document.createElement('div');
    wrapper.style.width = '297mm';
    wrapper.style.padding = '10mm';
    wrapper.style.background = '#fff';
    wrapper.style.fontFamily = 'Arial';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';

    let html = `
        <h1 style="text-align:center">PLANEJADOR MENSAL</h1>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);font-weight:bold">
            <div>SEG</div><div>TER</div><div>QUA</div>
            <div>QUI</div><div>SEX</div><div>SAB</div><div>DOM</div>
        </div>
    `;

    for (let w = 0; w < totalWeeks; w++) {
        html += `<div style="display:grid;grid-template-columns:repeat(7,1fr)">`;

        for (let d = 0; d < 7; d++) {
            const idx = w * 7 + d;

            if (idx < startOffset || currentDay > totalDays) {
                html += `<div style="border:1px solid #000;height:360px"></div>`;
                continue;
            }

            const date = new Date(year, month, currentDay);
            const data = appState.days[getDateString(date)];

            let lines = '';
            for (let i = 0; i < 17; i++) {
                const l = data?.lines?.[i];
                lines += `
                    <div style="display:flex;border-bottom:1px solid #ddd;height:18px">
                        <span style="width:22px;color:#999">${i + 1}.</span>
                        <div>${l ? renderLineWithColors(l) : '&nbsp;'}</div>
                    </div>
                `;
            }

            html += `
                <div style="border:1px solid #000;height:360px">
                    <div style="
                        height:36px;
                        margin:4px;
                        background:#e0e0e0;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:22px;
                        font-weight:bold;
                    ">${currentDay}</div>
                    ${lines}
                </div>
            `;

            currentDay++;
        }

        html += `</div>`;
    }

    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, { scale: 2 });

    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const w = pdf.internal.pageSize.getWidth();
    const h = canvas.height * w / canvas.width;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
    pdf.save('planner-mensal.pdf');

    document.body.removeChild(wrapper);
}

// ==========================================================
// PALETA (inalterada)
// ==========================================================
function renderColorPalette() {}
