// ========== CORES VIBRANTES ==========
var COLORS = [
    '#FF0000', '#FF6B00', '#FFD700', '#00D000', '#00B8D4',
    '#0066FF', '#6600FF', '#FF00FF', '#FF1493', '#00FF7F',
    '#FF4500', '#1E90FF', '#DC143C', '#00CED1', '#FFB6C1',
    '#32CD32', '#FF8C00', '#00FF00', '#FF69B4',
    '#000000', '#808080'
];

var FERIADOS_BRASIL = [
    '01-01', '02-13', '04-21', '05-01', '09-07', '10-12', '11-02', '11-20', '12-25'
];

// ========== ESTADO ==========
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

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', function () {
    loadDataFromStorage();
    initializeEventListeners();
    setTimeout(function () {
        renderWeekView();
        renderColorPalette();
        setupGestureHandling();
    }, 300);
});

// ========== STORAGE ==========
function saveDataToStorage() {
    localStorage.setItem('plannerData', JSON.stringify(appState.days));
}
function loadDataFromStorage() {
    var stored = localStorage.getItem('plannerData');
    if (stored) appState.days = JSON.parse(stored);
}

// ========== EVENTOS ==========
function initializeEventListeners() {

    document.getElementById('prevNav').onclick = function () {
        if (appState.view === 'week') {
            appState.currentDate.setDate(appState.currentDate.getDate() - 7);
            renderWeekView();
        } else {
            appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
            renderMonthView();
        }
    };

    document.getElementById('nextNav').onclick = function () {
        if (appState.view === 'week') {
            appState.currentDate.setDate(appState.currentDate.getDate() + 7);
            renderWeekView();
        } else {
            appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
            renderMonthView();
        }
    };

    document.getElementById('viewWeekly').onclick = function () {
        appState.view = 'week';
        renderWeekView();
    };

    document.getElementById('viewMonthly').onclick = function () {
        appState.view = 'month';
        renderMonthView();
    };

    document.getElementById('printMonthBtn').onclick = printMonth;
    document.getElementById('printWeekBtn').onclick = printWeek;
    document.getElementById('printDay').onclick = printDay;
    document.getElementById('closeDayEdit').onclick = closeDayEdit;
}

// ========== IMPRESSÃO ==========
function printMonth() {
    var printType = document.getElementById('printTypeSelector').value;
    if (printType === 'plotter') {
        printMonthPlotterREAL();
    } else {
        printMonthA4();
    }
}

function printMonthPlotterREAL() {

    var year = appState.currentDate.getFullYear();
    var month = appState.currentDate.getMonth();
    var monthName = appState.currentDate
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .toUpperCase();

    var win = window.open('', '_blank');

    var firstDay = new Date(year, month, 1);
    var startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - startDate.getDay());

    var cells = '';
    var d = new Date(startDate);

    for (let i = 0; i < 42; i++) {

        let isOther = d.getMonth() !== month;
        let isSpecial = d.getDay() === 0 || d.getDay() === 6 || isHolidayDate(d);

        let lines = '';
        if (!isOther) {
            for (let l = 0; l < 18; l++) {
                lines += `
                    <div class="line">
                        <span>${l + 1}.</span>&nbsp;
                    </div>`;
            }
        }

        cells += `
            <div class="day ${isOther ? 'other' : ''} ${isSpecial ? 'special' : ''}">
                <div class="num">${isOther ? '' : d.getDate()}</div>
                <div class="content">${lines}</div>
            </div>`;

        d.setDate(d.getDate() + 1);
    }

    win.document.write(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Plotter</title>
<style>

@page {
    size: 60cm 60cm;
    margin: 0;
}

html, body {
    width: 60cm;
    height: 60cm;
    margin: 0;
    padding: 0;
}

#calendar {
    position: absolute;
    left: 2.5cm;
    top: 2.5cm;
    width: 55cm;
    height: 55cm;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: 1fr;
    border: 5px solid black;
    box-sizing: border-box;
}

.header {
    grid-column: span 7;
    font-size: 2.4cm;
    font-weight: bold;
    text-align: center;
    padding: 0.8cm 0;
    border-bottom: 5px solid black;
}

.day {
    border-right: 3px solid black;
    border-bottom: 3px solid black;
}

.day.special .num {
    color: red;
}

.num {
    font-size: 1.6cm;
    font-weight: bold;
    padding: 0.4cm;
}

.line {
    height: 0.9cm;
    border-bottom: 1.5px solid black;
    display: flex;
    align-items: center;
    font-size: 0.9cm;
}

.line span {
    width: 1.2cm;
    font-weight: bold;
}

@media print {
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}

</style>
</head>
<body>

<div id="calendar">
    <div class="header">PLANEJADOR MENSAL – ${monthName}</div>
    ${cells}
</div>

<script>
window.onload = function () {
    document.body.style.zoom = "100%";
    setTimeout(function(){ window.print(); }, 600);
};
window.onafterprint = function(){ window.close(); };
</script>

</body>
</html>
    `);

    win.document.close();
}
