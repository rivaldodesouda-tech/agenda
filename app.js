// ========== CORES VIBRANTES ==========
var COLORS = [
    '#FF0000', '#FF6B00', '#FFD700', '#00D000', '#00B8D4',
    '#0066FF', '#6600FF', '#FF00FF', '#FF1493', '#00FF7F',
    '#FF4500', '#1E90FF', '#DC143C', '#00CED1', '#FFB6C1',
    '#32CD32', '#FF8C00', '#00FF00', '#FF69B4',
    '#000000', '#808080' // Preto e Cinza para background
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
    // Navegação
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

    // Toggle entre visões
    document.getElementById('viewWeekly').addEventListener('click', function() {
        if (appState.view !== 'week') {
            appState.view = 'week';
            renderWeekView();
        }
    });

    document.getElementById('viewMonthly').addEventListener('click', function() {
        if (appState.view !== 'month') {
            appState.view = 'month';
            renderMonthView();
        }
    });

    // Impressão
    document.getElementById('printWeekBtn').addEventListener('click', function() {
        printWeek();
    });

    document.getElementById('printDay').addEventListener('click', function() {
        printDay();
    });

    document.getElementById('printMonthBtn').addEventListener('click', function() {
        showPrintModeSelector();
    });

    // Fechar edição
    document.getElementById('closeDayEdit').addEventListener('click', function() {
        closeDayEdit();
    });
}

// ========== NAVEGAÇÃO POR GESTO ==========
function setupGestureHandling() {
    var weekGrid = document.getElementById('weekGrid');
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

    weekGrid.addEventListener('touchmove', function(e) {
        if (!isSwiping || e.touches.length !== 1) return;
        
        var currentX = e.touches[0].clientX;
        var currentY = e.touches[0].clientY;
        var deltaX = currentX - touchStartX;
        var deltaY = currentY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            // No iOS, preventDefault pode ser necessário para evitar scroll lateral indesejado
            if (e.cancelable) e.preventDefault();
        }
    }, { passive: false });

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
    var weekGrid = document.getElementById('weekGrid');
    weekGrid.innerHTML = '';

    var startDate = new Date(appState.currentDate);
    startDate.setDate(appState.currentDate.getDate() - appState.currentDate.getDay());

    var headerTitle = document.getElementById('headerTitle');
    var monthName = startDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase();
    headerTitle.textContent = monthName;

    // Coluna esquerda: 4 dias (Segunda a Quinta)
    var leftColumn = document.createElement('div');
    leftColumn.className = 'week-column';
    for (var i = 1; i < 5; i++) {
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        leftColumn.appendChild(createDayCardGrid(date));
    }

    // Coluna direita: 3 dias (Sexta, Sábado, Domingo)
    var rightColumn = document.createElement('div');
    rightColumn.className = 'week-column';
    for (var i = 5; i < 8; i++) {
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        rightColumn.appendChild(createDayCardGrid(date));
    }

    weekGrid.appendChild(leftColumn);
    weekGrid.appendChild(rightColumn);

    // Atualizar botões
    document.getElementById('viewWeekly').classList.add('active');
    document.getElementById('viewMonthly').classList.remove('active');
    
    // Mostrar visão semanal
    document.getElementById('weekView').style.display = 'flex';
    document.getElementById('monthView').style.display = 'none';
    appState.view = 'week';

    // Garantir que o scroll volte ao topo
    var weekContainer = document.getElementById('weekView');
    if (weekContainer) {
        weekContainer.scrollTop = 0;
    }
}

// ========== RENDERIZAÇÃO MENSAL ==========
function renderMonthView() {
    var monthCalendar = document.getElementById('monthCalendar');
    monthCalendar.innerHTML = '';

    var headerTitle = document.getElementById('headerTitle');
    var monthName = appState.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    headerTitle.textContent = monthName;

    var grid = document.createElement('div');
    grid.className = 'month-grid';

    // Cabeçalho com dias da semana
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

    // Mostrar visão mensal
    document.getElementById('weekView').style.display = 'none';
    document.getElementById('monthView').style.display = 'flex';
    appState.view = 'month';

    // Atualizar botões
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
            lineDiv.classList.add('empty');
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
    
    var dateStr = getDateString(date);
    var dayData = appState.days[dateStr];
    
    var html = '<div class="month-day-num">' + date.getDate() + '</div>';
    html += '<div class="month-day-content">';
    
    if (dayData && dayData.lines) {
        dayData.lines.forEach(function(line, idx) {
            if (line && (line.text || line.html) && (line.text || "").trim() !== '') {
                html += '<div class="month-line-preview">' + renderLineWithColors(line) + '</div>';
            }
        });
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

// ========== EDIÇÃO DIÁRIA ==========
function openDayEdit(date) {
    appState.selectedDay = getDateString(date);
    var dayData = appState.days[appState.selectedDay] || { lines: [] };
    
    if (!dayData.lines || dayData.lines.length === 0) {
        dayData.lines = Array(30).fill(null).map(function() { return { text: '', spans: [] }; });
    }

    var editView = document.getElementById('dayEditView');
    var info = document.getElementById('editDayInfo');
    info.textContent = getDayName(date.getDay()) + ', ' + date.getDate() + ' de ' + date.toLocaleDateString('pt-BR', { month: 'long' });
    
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
        
        // Compatibilidade iOS: garantir que o teclado apareça e o scroll funcione
        lineDiv.setAttribute('inputmode', 'text');
        
        if (line && (line.html || line.text)) {
            lineDiv.innerHTML = line.html || line.text;
        }

        lineDiv.addEventListener('input', function() {
            updateLineData(index, this);
        });

        lineDiv.addEventListener('focus', function() {
            appState.selectedLineIndex = index;
            // Scroll suave para a linha em foco no iOS
            setTimeout(function() {
                lineDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
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

// ========== PALETA DE CORES ==========
function renderColorPalette() {
    var palette = document.getElementById('colorPalette');
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
        // Usar hiliteColor para o fundo (highlight)
        // Compatibilidade: hiliteColor funciona melhor no Safari/iOS para background
        document.execCommand('hiliteColor', false, color);
        
        // Garantir que o texto seja visível (preto ou branco dependendo do fundo)
        // Para simplificar e manter visível, forçamos o texto para preto ou branco
        var textColor = isDarkColor(color) ? '#FFFFFF' : '#000000';
        document.execCommand('foreColor', false, textColor);
    } else if (appState.selectedLineIndex !== null) {
        // Se não houver seleção, aplica na linha inteira
        var element = document.querySelector('[data-index="' + appState.selectedLineIndex + '"]');
        if (element) {
            element.style.backgroundColor = color;
            element.style.color = isDarkColor(color) ? '#FFFFFF' : '#000000';
            updateLineData(appState.selectedLineIndex, element);
        }
    }
}

// Função auxiliar para verificar se a cor é escura
function isDarkColor(color) {
    var r, g, b;
    if (color.startsWith('#')) {
        r = parseInt(color.substring(1, 3), 16);
        g = parseInt(color.substring(3, 5), 16);
        b = parseInt(color.substring(5, 7), 16);
    } else {
        return false;
    }
    // Fórmula de luminosidade
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

// ========== UTILITÁRIOS ==========
function getDateString(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function formatDate(date) {
    return String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
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

// ========== IMPRESSÃO ==========
function showPrintModeSelector() {
    var modal = document.createElement('div');
    modal.id = 'printModeModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    var modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px;';
    
    var title = document.createElement('h2');
    title.textContent = 'Modo de Impressão';
    title.style.cssText = 'margin: 0 0 20px 0; color: #333;';
    
    var description = document.createElement('p');
    description.textContent = 'Escolha o modo de impressão mensal:';
    description.style.cssText = 'margin: 0 0 20px 0; color: #666;';
    
    var normalBtn = document.createElement('button');
    normalBtn.textContent = '📄 Impressão Normal';
    normalBtn.style.cssText = 'display: block; width: 100%; padding: 15px; margin: 10px 0; font-size: 16px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;';
    normalBtn.onclick = function() {
        document.body.removeChild(modal);
        printMonth('normal');
    };
    
    var largeBtn = document.createElement('button');
    largeBtn.textContent = '📋 Impressão Grande (17 linhas)';
    largeBtn.style.cssText = 'display: block; width: 100%; padding: 15px; margin: 10px 0; font-size: 16px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;';
    largeBtn.onclick = function() {
        document.body.removeChild(modal);
        printMonth('large');
    };
    
    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕ Cancelar';
    cancelBtn.style.cssText = 'display: block; width: 100%; padding: 15px; margin: 10px 0; font-size: 16px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;';
    cancelBtn.onclick = function() {
        document.body.removeChild(modal);
    };
    
    modalContent.appendChild(title);
    modalContent.appendChild(description);
    modalContent.appendChild(normalBtn);
    modalContent.appendChild(largeBtn);
    modalContent.appendChild(cancelBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function printMonth(mode) {
    mode = mode || 'normal';
    var year = appState.currentDate.getFullYear();
    var month = appState.currentDate.getMonth();
    var monthName = appState.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

    var printWindow = window.open('', '', 'width=800,height=600');
    
    var firstDay = new Date(year, month, 1);
    var startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    var gridHtml = '';
    var currentDate = new Date(startDate);
    
    for (var i = 0; i < 42; i++) {
        var isOtherMonth = currentDate.getMonth() !== month;
        
        if (!isOtherMonth) {
            var dateStr = getDateString(currentDate);
            var dayData = appState.days[dateStr];
            var isSpecial = currentDate.getDay() === 0 || currentDate.getDay() === 6 || isHolidayDate(currentDate);
            
            var linesHtml = '';
            if (mode === 'large') {
                for (var lineIdx = 0; lineIdx < 17; lineIdx++) {
                    var line = (dayData && dayData.lines && dayData.lines[lineIdx]) ? dayData.lines[lineIdx] : { text: '', spans: [] };
                    var lineContent = (line && (line.text || line.html) && (line.text || "").trim() !== '') ? renderLineWithColors(line) : '&nbsp;';
                    linesHtml += '<div class="print-month-line"><span class="print-line-num">' + (lineIdx + 1) + '.</span>' + lineContent + '</div>';
                }
            } else {
                if (dayData && dayData.lines) {
                    linesHtml = dayData.lines.map(function(l, idx) {
                        if (l && (l.text || l.html) && (l.text || "").trim() !== '') {
                            return '<div class="print-month-line"><span class="print-line-num">' + (idx + 1) + '.</span>' + renderLineWithColors(l) + '</div>';
                        }
                        return '';
                    }).join('');
                }
            }

            gridHtml += '<div class="print-month-day' + (isSpecial ? ' special' : '') + '">' +
                            '<div class="print-month-num">' + currentDate.getDate() + '</div>' +
                            '<div class="print-month-content">' + linesHtml + '</div>' +
                        '</div>';
        } else {
            gridHtml += '<div class="print-month-day other-month" style="border: none !important; background: none !important; visibility: hidden !important;"></div>';
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Calendário Mensal - ' + monthName + '</title>' +
        '<style>' +
        '@page { size: ' + (mode === 'large' ? '600mm 600mm' : 'A4 landscape') + '; margin: 5mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }' +
        '.print-month-header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 10px; height: 15mm; }' +
        '.print-month-grid { display: block; width: 100%; border-top: 1px solid #000; border-left: 1px solid #000; overflow: hidden; }' +
        '.print-month-day-header { float: left; width: 14.28%; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px; padding: 2px; background: #eee; box-sizing: border-box; }' +
        '.print-month-day { float: left; width: 14.28%; border-right: 1px solid #000; border-bottom: 1px solid #000; height: ' + (mode === 'large' ? '96.67mm' : '2.8cm') + '; position: relative; overflow: hidden; box-sizing: border-box; }' +
        '.print-month-num { font-weight: bold; font-size: 14px !important; padding: 4px; color: #000 !important; }' +
        '.print-month-day.special .print-month-num { color: #FF0000; }' +
        '.print-month-day.other-month { background: none !important; border: none !important; visibility: hidden !important; }' +
        '.print-month-content { font-size: ' + (mode === 'large' ? '10px' : '6px') + '; line-height: 1.1; padding: 0 2px; }' +
        '.print-month-line { border-bottom: ' + (mode === 'large' ? '1.5px solid #000' : '0.1px solid #eee') + ' !important; padding: 1px 0; word-break: break-word; display: flex; align-items: flex-start; height: ' + (mode === 'large' ? '5.2mm' : 'auto') + '; box-sizing: border-box; }' +
        '.print-line-num { min-width: ' + (mode === 'large' ? '18px' : '12px') + '; font-weight: bold !important; margin-right: 4px; font-size: ' + (mode === 'large' ? '10px' : '5px') + ' !important; color: #000 !important; display: inline-block; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>window.onafterprint = function() { window.close(); };</script></head><body>' +
        '<div class="print-month-header">PLANEJADOR MENSAL - ' + monthName + '</div>' +
        '<div class="print-month-grid">' +
        '<div class="print-month-day-header">DOM</div><div class="print-month-day-header">SEG</div><div class="print-month-day-header">TER</div>' +
        '<div class="print-month-day-header">QUA</div><div class="print-month-day-header">QUI</div><div class="print-month-day-header">SEX</div><div class="print-month-day-header">SAB</div>' +
        gridHtml + '<div style="clear: both;"></div></div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}

function printDay() {
    if (!appState.selectedDay) return;
    var dateParts = appState.selectedDay.split('-');
    var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    var dayData = appState.days[appState.selectedDay];
    var dayName = getDayName(date.getDay());
    var isSpecial = date.getDay() === 0 || date.getDay() === 6 || isHolidayDate(date);

    var printWindow = window.open('', '', 'width=800,height=600');
    var linesHtml = dayData.lines.map(function(l, idx) {
        if (l && (l.text || l.html) && (l.text || "").trim() !== '') {
            return '<div class="print-line"><span class="print-line-num">' + (idx + 1) + '.</span><div class="print-line-content">' + renderLineWithColors(l) + '</div></div>';
        }
        return '';
    }).join('');

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Impressão - ' + dayName + '</title>' +
        '<style>' +
        '@page { size: A4 portrait; margin: 5mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }' +
        '.print-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }' +
        '.print-date { font-size: 24px; font-weight: bold; }' +
        '.print-day-name { font-size: 18px; color: #666; }' +
        '.print-content { padding: 0 10px; }' +
        '.print-line { border-bottom: 1px solid #eee; padding: 8px 0; display: flex; align-items: flex-start; }' +
        '.print-line-num { min-width: 30px; font-weight: bold; color: #999; }' +
        '.print-line-content { flex: 1; }' +
        '.special .print-date { color: #FF0000; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>window.onafterprint = function() { window.close(); };</script></head><body class="' + (isSpecial ? 'special' : '') + '">' +
        '<div class="print-header"><div class="print-date">' + date.toLocaleDateString('pt-BR') + '</div><div class="print-day-name">' + dayName + '</div></div>' +
        '<div class="print-content">' + linesHtml + '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}

function printWeek() {
    var startDate = new Date(appState.currentDate);
    startDate.setDate(appState.currentDate.getDate() - appState.currentDate.getDay());
    var monthName = startDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

    var printWindow = window.open('', '', 'width=800,height=600');
    
    var daysHtml = '';
    for (var i = 1; i < 8; i++) {
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        var dateStr = getDateString(date);
        var dayData = appState.days[dateStr] || { lines: [] };
        var isSpecial = date.getDay() === 0 || date.getDay() === 6 || isHolidayDate(date);
        
        var linesHtml = '';
        if (dayData.lines) {
            linesHtml = dayData.lines.map(function(l, idx) {
                if (l && (l.text || l.html) && (l.text || "").trim() !== '') {
                    return '<div class="print-week-line"><span class="print-line-num">' + (idx + 1) + '.</span>' + renderLineWithColors(l) + '</div>';
                }
                return '';
            }).join('');
        }

        daysHtml += '<div class="print-week-day' + (isSpecial ? ' special' : '') + '">' +
                        '<div class="print-week-header">' + getDayName(date.getDay()) + ' ' + date.getDate() + '</div>' +
                        '<div class="print-week-content">' + linesHtml + '</div>' +
                    '</div>';
    }

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Semana - ' + monthName + '</title>' +
        '<style>' +
        '@page { size: A4 landscape; margin: 5mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }' +
        '.print-week-title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 10px; }' +
        '.print-week-grid { display: flex; border-top: 1px solid #000; border-left: 1px solid #000; height: 180mm; }' +
        '.print-week-day { flex: 1; border-right: 1px solid #000; border-bottom: 1px solid #000; position: relative; overflow: hidden; }' +
        '.print-week-header { background: #eee; padding: 5px; font-weight: bold; text-align: center; border-bottom: 1px solid #000; font-size: 12px; }' +
        '.print-week-day.special .print-week-header { color: #FF0000; }' +
        '.print-week-content { padding: 5px; font-size: 10px; }' +
        '.print-week-line { border-bottom: 0.1px solid #eee; padding: 2px 0; word-break: break-word; display: flex; align-items: flex-start; }' +
        '.print-line-num { min-width: 20px; font-weight: bold; color: #999; font-size: 8px; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>window.onafterprint = function() { window.close(); };</script></head><body>' +
        '<div class="print-week-title">PLANEJADOR SEMANAL - ' + monthName + '</div>' +
        '<div class="print-week-grid">' + daysHtml + '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}
