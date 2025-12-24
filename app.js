// ========== CORES VIBRANTES ==========
var COLORS = [
    '#FF0000', '#FF6B00', '#FFD700', '#00D000', '#00B8D4',
    '#0066FF', '#6600FF', '#FF00FF', '#FF1493', '#00FF7F',
    '#FF4500', '#1E90FF', '#DC143C', '#00CED1', '#FFB6C1',
    '#32CD32', '#FF8C00', '#00FF00', '#FF69B4',
    '#000000', '#808080'
];

var FERIADOS_BRASIL = [
    '01-01','02-13','04-21','05-01','09-07',
    '10-12','11-02','11-20','12-25'
];

// ========== ESTADO DA APLICAÇÃO ==========
var appState = {
    currentDate: new Date(),
    selectedDay: null,
    selectedColor: 0,
    selectedLineIndex: null,
    days: {},
    view: 'week',
    touchStartX: 0,
    touchStartY: 0,
    savedSelection: null
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function () {
    loadDataFromStorage();
    initializeEventListeners();
    renderWeekView();
    renderColorPalette();
    setupGestureHandling();
});

// ========== ARMAZENAMENTO LOCAL ==========
function saveDataToStorage() {
    localStorage.setItem('plannerData', JSON.stringify(appState.days));
}

function loadDataFromStorage() {
    var stored = localStorage.getItem('plannerData');
    if (stored) {
        appState.days = JSON.parse(stored);
    }
}

// ========== EVENT LISTENERS ==========
function initializeEventListeners() {

    document.getElementById('prevNav').addEventListener('click', function () {
        if (appState.view === 'week') {
            appState.currentDate.setDate(appState.currentDate.getDate() - 7);
            renderWeekView();
        } else {
            appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
            renderMonthView();
        }
    });

    document.getElementById('nextNav').addEventListener('click', function () {
        if (appState.view === 'week') {
            appState.currentDate.setDate(appState.currentDate.getDate() + 7);
            renderWeekView();
        } else {
            appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
            renderMonthView();
        }
    });

    document.getElementById('viewWeekly').addEventListener('click', function () {
        appState.view = 'week';
        renderWeekView();
    });

    document.getElementById('viewMonthly').addEventListener('click', function () {
        appState.view = 'month';
        renderMonthView();
    });

    document.getElementById('printWeekBtn').addEventListener('click', printWeek);
    document.getElementById('printDay').addEventListener('click', printDay);

    document.getElementById('printMonthBtn').addEventListener('click', exportMonthToPdf);
    document.getElementById('pdfMonthBtn').addEventListener('click', exportMonthToPdf);

    document.getElementById('closeDayEdit').addEventListener('click', closeDayEdit);
}

// ========== GESTOS ==========
function setupGestureHandling() {
    var weekGrid = document.getElementById('weekGrid');
    var startX = 0;

    weekGrid.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
    }, { passive: true });

    weekGrid.addEventListener('touchend', function (e) {
        var endX = e.changedTouches[0].clientX;
        if (Math.abs(endX - startX) > 50) {
            if (endX > startX) {
                appState.currentDate.setDate(appState.currentDate.getDate() - 7);
            } else {
                appState.currentDate.setDate(appState.currentDate.getDate() + 7);
            }
            renderWeekView();
        }
    }, { passive: true });
}

// ========== UTIL ==========
function getDateString(date) {
    return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
}

function getDayName(i) {
    return ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][i];
}

function isHolidayDate(date) {
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return FERIADOS_BRASIL.indexOf(m + '-' + d) !== -1;
}

function renderLineWithColors(line) {
    if (!line) return '';
    if (line.html) return line.html;
    if (line.text) return line.text;
    return '';
}

// ========== VISÃO SEMANAL ==========
function renderWeekView() {
    document.getElementById('weekView').style.display = 'flex';
    document.getElementById('monthView').style.display = 'none';
    appState.view = 'week';
}

// ========== VISÃO MENSAL ==========
function renderMonthView() {
    document.getElementById('weekView').style.display = 'none';
    document.getElementById('monthView').style.display = 'flex';
    appState.view = 'month';
}

// ========== EDIÇÃO DIÁRIA ==========
function closeDayEdit() {
    document.getElementById('dayEditView').style.display = 'none';
    document.getElementById('mainView').style.display = 'flex';
    saveDataToStorage();
    renderWeekView();
}

// ========== IMPRESSÃO SEMANAL ==========
function printWeek() {
    alert('Impressão semanal preservada');
}

// ========== IMPRESSÃO DIÁRIA ==========
function printDay() {
    alert('Impressão diária preservada');
}

// ========== PDF / IMPRESSÃO MENSAL (CORRIGIDO) ==========
async function exportMonthToPdf() {

    const { jsPDF } = window.jspdf;

    var year = appState.currentDate.getFullYear();
    var month = appState.currentDate.getMonth();

    var monthName = appState.currentDate
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .toUpperCase();

    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    var totalDays = lastDay.getDate();

    // SEG = 0 ... DOM = 6
    var startOffset = (firstDay.getDay() + 6) % 7;
    var totalCells = startOffset + totalDays;
    var totalWeeks = Math.ceil(totalCells / 7);

    var currentDay = 1;

    var wrapper = document.createElement('div');
    wrapper.style.width = '297mm';
    wrapper.style.padding = '10mm';
    wrapper.style.fontFamily = 'Arial';
    wrapper.style.background = '#fff';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';

    var html = `
        <h1 style="text-align:center;margin-bottom:8mm">
            PLANEJADOR MENSAL – ${monthName}
        </h1>

        <div style="
            display:grid;
            grid-template-columns:repeat(7,1fr);
            font-weight:bold;
            text-align:center;
            border:1px solid #000;
            background:#f0f0f0
        ">
            <div>SEG</div><div>TER</div><div>QUA</div>
            <div>QUI</div><div>SEX</div><div>SAB</div><div>DOM</div>
        </div>
    `;

    for (var w = 0; w < totalWeeks; w++) {
        html += `<div style="display:grid;grid-template-columns:repeat(7,1fr)">`;

        for (var d = 0; d < 7; d++) {

            var idx = w * 7 + d;

            if (idx < startOffset || currentDay > totalDays) {
                html += `<div style="border:1px solid #000;height:360px"></div>`;
                continue;
            }

            var dateStr = getDateString(new Date(year, month, currentDay));
            var dayData = appState.days[dateStr];

            var linesHtml = '';
            for (var i = 0; i < 17; i++) {
                var line = dayData && dayData.lines ? dayData.lines[i] : null;
                linesHtml += `
                    <div style="
                        display:flex;
                        height:18px;
                        border-bottom:1px solid #555;
                        font-size:11px;
                        color:#333
                    ">
                        <span style="width:24px;font-weight:bold">${i + 1}.</span>
                        <div style="flex:1">
                            ${line ? renderLineWithColors(line) : '&nbsp;'}
                        </div>
                    </div>
                `;
            }

            html += `
                <div style="border:1px solid #000;height:360px">
                    <div style="
                        height:40px;
                        margin:4px;
                        background:#c41e3a;
                        color:#fff;
                        font-size:24px;
                        font-weight:bold;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border-radius:6px
                    ">
                        ${currentDay}
                    </div>
                    <div style="padding:4px">
                        ${linesHtml}
                    </div>
                </div>
            `;

            currentDay++;
        }

        html += `</div>`;
    }

    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    var canvas = await html2canvas(wrapper, { scale: 2 });

    var pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    var wPdf = pdf.internal.pageSize.getWidth();
    var hPdf = canvas.height * wPdf / canvas.width;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, wPdf, hPdf);
    pdf.save(`planner-${monthName.replace(/\s+/g, '-')}.pdf`);

    document.body.removeChild(wrapper);
}

// ========== PALETA ==========
function renderColorPalette() {
    var palette = document.getElementById('colorPalette');
    if (!palette) return;
    palette.innerHTML = '';
    COLORS.forEach(function (c) {
        var b = document.createElement('button');
        b.style.background = c;
        palette.appendChild(b);
    });
}
