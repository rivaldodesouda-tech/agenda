console.log("app.js carregado");

// ========== CORES VIBRANTES ==========
var COLORS = [
    '#FF0000', '#FF6B00', '#FFD700', '#00D000', '#00B8D4',
    '#0066FF', '#6600FF', '#FF00FF', '#FF1493', '#00FF7F',
    '#FF4500', '#1E90FF', '#DC143C', '#00CED1', '#FFB6C1',
    '#32CD32', '#FF8C00', '#00FF00', '#FF69B4',
    '#000000', '#808080', '#FFFFFF'
];

var FERIADOS_BRASIL = [
    '01-01', '02-13', '04-21', '05-01', '09-07', '10-12', '11-02', '11-20', '12-25'
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
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded disparado");
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
        try {
            appState.days = JSON.parse(stored);
            console.log("Dados carregados:", appState.days);
        } catch (e) {
            console.error("Erro ao carregar dados:", e);
            appState.days = {};
        }
    }
}

// ========== EVENT LISTENERS ==========
function initializeEventListeners() {
    console.log("Inicializando event listeners");
    document.getElementById('prevNav').addEventListener('click', function() {
        if (appState.view === 'week') {
            appState.currentDate.setDate(appState.currentDate.getDate() - 7);
            renderWeekView();
        } else {
            appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
            renderMonthView();
        }
    });

    document.getElementById('nextNav').addEventListener('click', function() {
        if (appState.view === 'week') {
            appState.currentDate.setDate(appState.currentDate.getDate() + 7);
            renderWeekView();
        } else {
            appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
            renderMonthView();
        }
    });

    document.getElementById('viewWeekly').addEventListener('click', function() {
        if (appState.view !== 'week') {
            appState.view = 'week';
            renderWeekView();
            document.getElementById('exportPdfBtn').style.display = 'none';
        }
    });

    document.getElementById('viewMonthly').addEventListener('click', function() {
        if (appState.view !== 'month') {
            appState.view = 'month';
            renderMonthView();
            document.getElementById('exportPdfBtn').style.display = 'inline-block';
        }
    });

    document.getElementById('printWeekBtn').addEventListener('click', function() {
        var weekGrid = document.getElementById('weekGrid');
        weekGrid.classList.add('print-mode');
        window.print();
        // Pequeno delay para remover a classe após o diálogo de impressão abrir
        setTimeout(function() {
            weekGrid.classList.remove('print-mode');
        }, 1000);
    });

    document.getElementById('printDay').addEventListener('click', function() {
        window.print();
    });

    document.getElementById('printMonthBtn').addEventListener('click', function() {
        window.print();
    });

    document.getElementById('exportPdfBtn').addEventListener('click', function() {
        exportMonthToPdf();
    });

    document.getElementById('closeDayEdit').addEventListener('click', function() {
        closeDayEdit();
    });
}

// ========== NAVEGAÇÃO POR GESTO ==========
function setupGestureHandling() {
    var weekGrid = document.getElementById('weekGrid');
    if (!weekGrid) return;
    var touchStartX = 0;
    var touchStartY = 0;
    var isSwiping = false;

    weekGrid.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isSwiping = true;
        }
    }, { passive: true });

    weekGrid.addEventListener('touchend', function(e) {
        if (!isSwiping) return;
        var touchEndX = e.changedTouches[0].clientX;
        var touchEndY = e.changedTouches[0].clientY;
        var deltaX = touchEndX - touchStartX;
        var deltaY = touchEndY - touchStartY;
        isSwiping = false;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                appState.currentDate.setDate(appState.currentDate.getDate() - 7);
            } else {
                appState.currentDate.setDate(appState.currentDate.getDate() + 7);
            }
            renderWeekView();
        }
    }, { passive: true });
}

// ========== RENDERIZAÇÃO SEMANAL ==========
function renderWeekView() {
    console.log("Renderizando visão semanal");
    var weekGrid = document.getElementById('weekGrid');
    if (!weekGrid) {
        console.error("weekGrid não encontrado!");
        return;
    }
    weekGrid.innerHTML = '';

    var startDate = new Date(appState.currentDate);
    var dayOfWeek = appState.currentDate.getDay();
    var daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(appState.currentDate.getDate() - daysToSubtract);

    var headerTitle = document.getElementById('headerTitle');
    var monthName = startDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase();
    headerTitle.textContent = monthName;

    var leftColumn = document.createElement('div');
    leftColumn.className = 'week-column';
    for (var i = 0; i < 4; i++) {
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        leftColumn.appendChild(createDayCardGrid(date));
    }

    var rightColumn = document.createElement('div');
    rightColumn.className = 'week-column';
    for (var i = 4; i < 7; i++) {
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        rightColumn.appendChild(createDayCardGrid(date));
    }

    weekGrid.appendChild(leftColumn);
    weekGrid.appendChild(rightColumn);

    document.getElementById('viewWeekly').classList.add('active');
    document.getElementById('viewMonthly').classList.remove('active');
    document.getElementById('weekView').style.display = 'flex';
    document.getElementById('monthView').style.display = 'none';
    appState.view = 'week';
    console.log("Visão semanal renderizada com sucesso");
}

// ========== RENDERIZAÇÃO MENSAL ==========
function renderMonthView() {
    console.log("Renderizando visão mensal");
    var monthCalendar = document.getElementById('monthCalendar');
    if (!monthCalendar) return;
    monthCalendar.innerHTML = '';

    var headerTitle = document.getElementById('headerTitle');
    var monthName = appState.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    headerTitle.textContent = monthName;

    var grid = document.createElement('div');
    grid.className = 'month-grid';

    var dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    dayNames.forEach(function(day) {
        var dayHeader = document.createElement('div');
        dayHeader.className = 'month-day-header';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });

    var firstDay = new Date(appState.currentDate.getFullYear(), appState.currentDate.getMonth(), 1);
    var startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    var currentDate = new Date(startDate);
    for (var i = 0; i < 42; i++) {
        var cell = createMonthDayCell(new Date(currentDate));
        grid.appendChild(cell);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    monthCalendar.appendChild(grid);
    document.getElementById('weekView').style.display = 'none';
    document.getElementById('monthView').style.display = 'flex';
    appState.view = 'month';
    document.getElementById('viewWeekly').classList.remove('active');
    document.getElementById('viewMonthly').classList.add('active');
}

function createDayCardGrid(date) {
    var card = document.createElement('div');
    card.className = 'day-card-grid';
    var dateStr = getDateString(date);
    var dayOfWeek = date.getDay();
    var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    var isHoliday = isHolidayDate(date);

    if (isWeekend || isHoliday) {
        card.classList.add(isHoliday ? 'holiday' : 'weekend');
    }

    var header = document.createElement('div');
    header.className = 'day-card-header' + (isWeekend || isHoliday ? ' weekend' : '');
    header.textContent = getDayName(dayOfWeek).split('-')[0] + ' ' + date.getDate();

    var content = document.createElement('div');
    content.className = 'day-card-content';

    var dayData = appState.days[dateStr] || { lines: [] };
    if (!dayData.lines || dayData.lines.length === 0) {
        dayData.lines = Array(30).fill(null).map(function() { return { text: '', spans: [] }; });
    }
    
    for (var i = 0; i < 30; i++) {
        var line = dayData.lines[i] || { text: '', spans: [] };
        var lineWrapper = document.createElement('div');
        lineWrapper.className = 'day-line-wrapper';
        var lineNum = document.createElement('div');
        lineNum.className = 'line-number-preview';
        lineNum.textContent = (i + 1) + '.';
        var lineDiv = document.createElement('div');
        lineDiv.className = 'day-line-preview';
        if (line && (line.text || line.html)) {
            lineDiv.innerHTML = renderLineWithColors(line);
        } else {
            lineDiv.innerHTML = '&nbsp;';
        }
        lineWrapper.appendChild(lineNum);
        lineWrapper.appendChild(lineDiv);
        content.appendChild(lineWrapper);
    }

    card.appendChild(header);
    card.appendChild(content);
    card.addEventListener('click', function() {
        openDayEdit(date);
    });
    return card;
}

function createMonthDayCell(date) {
    var cell = document.createElement('div');
    var isOtherMonth = date.getMonth() !== appState.currentDate.getMonth();
    var isSpecial = date.getDay() === 0 || date.getDay() === 6 || isHolidayDate(date);
    cell.className = 'month-day-cell' + (isOtherMonth ? ' other-month' : '') + (isSpecial ? ' special' : '');
    if (isOtherMonth) cell.style.visibility = 'hidden';
    
    var dateStr = getDateString(date);
    var dayData = appState.days[dateStr];
    var html = '<div class="month-day-num">' + date.getDate() + '</div>';
    html += '<div class="month-cell-content">';
    var lines = (dayData && dayData.lines) ? dayData.lines : [];
    for (var col = 0; col < 3; col++) {
        html += '<div class="month-column-part">';
        for (var row = 0; row < 10; row++) {
            var i = col * 10 + row;
            var line = lines[i];
            var content = (line && (line.text || line.html)) ? renderLineWithColors(line) : '';
            if (content.replace(/<[^>]*>/g, '').trim().length > 0) {
                html += '<div class="month-line-rich">' + (i+1) + '. ' + content + '</div>';
            }
        }
        html += '</div>';
    }
    html += '</div>';
    cell.innerHTML = html;
    cell.addEventListener('click', function() {
        appState.currentDate = new Date(date);
        appState.view = 'week';
        renderWeekView();
    });
    return cell;
}

function openDayEdit(date) {
    appState.selectedDay = (typeof date === 'string') ? date : getDateString(date);
    var dateObj = (typeof date === 'string') ? new Date(date + 'T00:00:00') : date;
    var dayData = appState.days[appState.selectedDay] || { lines: [] };
    if (!dayData.lines || dayData.lines.length === 0) {
        dayData.lines = Array(30).fill(null).map(function() { return { text: '', spans: [] }; });
    }

    var editView = document.getElementById('dayEditView');
    var info = document.getElementById('editDayInfo');
    info.textContent = getDayName(dateObj.getDay()) + ', ' + dateObj.getDate() + ' de ' + dateObj.toLocaleDateString('pt-BR', { month: 'long' });
    
    var notebook = document.getElementById('notebookLines');
    notebook.innerHTML = '';
    
    dayData.lines.forEach(function(line, index) {
        var lineWrapper = document.createElement('div');
        lineWrapper.className = 'notebook-line-wrapper';
        var lineNum = document.createElement('div');
        lineNum.className = 'line-number';
        lineNum.textContent = (index + 1) + '.';
        var lineDiv = document.createElement('div');
        lineDiv.className = 'notebook-line';
        lineDiv.contentEditable = true;
        lineDiv.setAttribute('data-index', index);
        if (line && (line.html || line.text)) {
            lineDiv.innerHTML = line.html || line.text;
        }
        lineDiv.addEventListener('input', function() {
            updateLineData(index, this);
        });
        lineDiv.addEventListener('focus', function() {
            appState.selectedLineIndex = index;
        });
        lineWrapper.appendChild(lineNum);
        lineWrapper.appendChild(lineDiv);
        notebook.appendChild(lineWrapper);
    });

    editView.style.display = 'flex';
    document.getElementById('mainView').style.display = 'none';
}

function closeDayEdit() {
    document.getElementById('dayEditView').style.display = 'none';
    document.getElementById('mainView').style.display = 'flex';
    saveDataToStorage();
    renderWeekView();
}

function updateLineData(index, element) {
    if (!appState.selectedDay) return;
    if (!appState.days[appState.selectedDay]) {
        appState.days[appState.selectedDay] = { lines: Array(30).fill(null).map(function() { return { text: '', spans: [] }; }) };
    }
    appState.days[appState.selectedDay].lines[index] = {
        text: element.innerText,
        html: element.innerHTML
    };
    saveDataToStorage();
}

function renderColorPalette() {
    var palette = document.getElementById('colorPalette');
    if (!palette) return;
    palette.innerHTML = '';
    COLORS.forEach(function(color, index) {
        var btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color;
        if (index === appState.selectedColor) btn.classList.add('active');
        btn.addEventListener('click', function() {
            appState.selectedColor = index;
            document.querySelectorAll('.color-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            applyHighlightToSelection(color);
        });
        palette.appendChild(btn);
    });
}

function applyHighlightToSelection(color) {
    var selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
        document.execCommand('hiliteColor', false, color);
        if (isDarkColor(color)) {
            document.execCommand('foreColor', false, '#FFFFFF');
        } else {
            document.execCommand('foreColor', false, '#333333');
        }
    } else if (appState.selectedLineIndex !== null) {
        var element = document.querySelector('[data-index="' + appState.selectedLineIndex + '"]');
        if (element) {
            element.style.backgroundColor = color;
            element.style.color = isDarkColor(color) ? '#FFFFFF' : '#333333';
            updateLineData(appState.selectedLineIndex, element);
        }
    }
}

function isDarkColor(color) {
    var r, g, b;
    if (color.startsWith('#')) {
        r = parseInt(color.substring(1, 3), 16);
        g = parseInt(color.substring(3, 5), 16);
        b = parseInt(color.substring(5, 7), 16);
    } else {
        return false;
    }
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

function getDateString(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function getDayName(dayIndex) {
    var days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[dayIndex];
}

function isHolidayDate(date) {
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return FERIADOS_BRASIL.indexOf(m + '-' + d) !== -1;
}

function renderLineWithColors(lineData) {
    if (!lineData) return '';
    if (lineData.html) return lineData.html;
    if (lineData.text) return lineData.text;
    return '';
}

function exportMonthToPdf() {
    var element = document.getElementById('monthView');
    var monthTitle = document.getElementById('headerTitle').textContent;
    
    // Preparar para exportação
    var printHeader = document.getElementById('monthPrintHeader');
    var printTitle = document.getElementById('monthPrintTitle');
    printHeader.style.display = 'block';
    printTitle.textContent = monthTitle;
    
    // Injetar estilos temporários para o PDF ocupar a página inteira
    var style = document.createElement('style');
    style.id = 'pdf-temp-style';
    style.innerHTML = `
        .month-view.print-mode {
            width: 297mm !important;
            height: 210mm !important;
            padding: 5mm !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            background: white !important;
        }
        .month-view.print-mode .month-calendar {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
        }
        .month-view.print-mode .month-grid {
            flex: 1 !important;
            display: grid !important;
            grid-template-columns: repeat(7, 1fr) !important;
            grid-auto-rows: 1fr !important;
            height: 100% !important;
            border: 1px solid #000 !important;
        }
        .month-view.print-mode .month-day-cell {
            height: 100% !important;
            min-height: 0 !important;
            border: 1px solid #000 !important;
        }
        .month-view.print-mode .month-day-cell.empty-cell {
            display: none !important; /* Remove semanas vazias no final */
        }
    `;
    document.head.appendChild(style);
    
    element.classList.add('print-mode');
    
    var opt = {
        margin: 0,
        filename: 'Agenda_Mensal_' + monthTitle.replace(' ', '_') + '.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            letterRendering: true,
            width: 1122,
            height: 794
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(function() {
        printHeader.style.display = 'none';
        element.classList.remove('print-mode');
        var tempStyle = document.getElementById('pdf-temp-style');
        if (tempStyle) tempStyle.remove();
    }).catch(function(err) {
        console.error("Erro na geração do PDF:", err);
        printHeader.style.display = 'none';
        element.classList.remove('print-mode');
        var tempStyle = document.getElementById('pdf-temp-style');
        if (tempStyle) tempStyle.remove();
    });
}
