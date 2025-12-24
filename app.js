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
    }, false);

    weekGrid.addEventListener('touchmove', function(e) {
        if (!isSwiping || e.touches.length !== 1) return;
        
        var currentX = e.touches[0].clientX;
        var currentY = e.touches[0].clientY;
        var deltaX = currentX - touchStartX;
        var deltaY = currentY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            e.preventDefault();
        }
    }, true);

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
    }, false);
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
        var cell = createMonthDayCell(new Date(currentDate)); // Passa uma cópia da data
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
        
        if (line && line.text && line.text.trim() !== '') {
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
    cell.className = 'month-day';
    
    var dateStr = getDateString(date);
    var isOtherMonth = date.getMonth() !== appState.currentDate.getMonth();
    var isToday = dateStr === getDateString(new Date());
    var isSpecial = date.getDay() === 0 || date.getDay() === 6 || isHolidayDate(date);

    if (isOtherMonth) cell.classList.add('other-month');
    if (isToday) cell.classList.add('today');
    if (isSpecial) cell.classList.add('special');

    var num = document.createElement('div');
    num.className = 'month-day-num';
    num.textContent = date.getDate();
    cell.appendChild(num);

    var content = document.createElement('div');
    content.className = 'month-day-content';
    
    var dayData = appState.days[dateStr];
    if (dayData && dayData.lines) {
        dayData.lines.forEach(function(line, idx) {
            if (line && line.text && line.text.trim() !== '') {
                var lineDiv = document.createElement('div');
                lineDiv.className = 'month-line-preview';
                lineDiv.innerHTML = '<span class="line-num">' + (idx + 1) + '.</span>' + renderLineWithColors(line);
                content.appendChild(lineDiv);
            }
        });
    }
    cell.appendChild(content);

    cell.addEventListener('click', function() {
        openDayEdit(date);
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

    var info = document.getElementById('editDayInfo');
    var dayName = getDayName(date.getDay());
    info.textContent = dayName + ', ' + date.toLocaleDateString('pt-BR');

    var notebook = document.getElementById('notebookLines');
    notebook.innerHTML = '';

    for (var i = 0; i < 30; i++) {
        var line = dayData.lines[i] || { text: '', spans: [] };
        notebook.appendChild(createNotebookLine(i, line));
    }

    document.getElementById('mainView').style.display = 'none';
    document.getElementById('dayEditView').style.display = 'flex';
    
    // Resetar seleção
    appState.selectedLineIndex = null;
}

function createNotebookLine(index, lineData) {
    var wrapper = document.createElement('div');
    wrapper.className = 'notebook-line-wrapper';

    var num = document.createElement('div');
    num.className = 'notebook-line-num';
    num.textContent = (index + 1) + '.';

    var content = document.createElement('div');
    content.className = 'notebook-line-content';
    content.contentEditable = true;
    content.setAttribute('data-index', index);
    
    if (lineData) {
        content.innerHTML = renderLineWithColors(lineData);
    }

    content.addEventListener('input', function() {
        updateLineData(index, this);
    });

    content.addEventListener('focus', function() {
        appState.selectedLineIndex = index;
        highlightActiveLine(wrapper);
    });

    // Navegação por Tab e Enter (Retorno no iPhone)
    content.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
            var nextIndex = index + 1;
            if (nextIndex < 30) {
                var nextLine = document.querySelector('[data-index="' + nextIndex + '"]');
                if (nextLine) {
                    nextLine.focus();
                    // Colocar cursor no final do texto se houver
                    var range = document.createRange();
                    var sel = window.getSelection();
                    range.selectNodeContents(nextLine);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
    });

    // Suporte para colar mantendo apenas formatação básica (cores, negrito, itálico)
    content.addEventListener('paste', function(e) {
        e.preventDefault();
        var text = (e.originalEvent || e).clipboardData.getData('text/plain');
        document.execCommand('insertHTML', false, text);
    });

    wrapper.appendChild(num);
    wrapper.appendChild(content);
    return wrapper;
}

function highlightActiveLine(activeWrapper) {
    var all = document.querySelectorAll('.notebook-line-wrapper');
    all.forEach(function(w) { w.classList.remove('active'); });
    activeWrapper.classList.add('active');
}

function updateLineData(index, element) {
    var dateStr = appState.selectedDay;
    if (!appState.days[dateStr]) {
        appState.days[dateStr] = { lines: Array(30).fill(null).map(function() { return { html: '' }; }) };
    }
    
    // Salvar o HTML completo para preservar cores, negrito e itálico
    appState.days[dateStr].lines[index] = {
        html: element.innerHTML
    };
    
    saveDataToStorage();
}

function closeDayEdit() {
    document.getElementById('mainView').style.display = 'flex';
    document.getElementById('dayEditView').style.display = 'none';
    if (appState.view === 'week') {
        renderWeekView();
    } else {
        renderMonthView();
    }
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
            applyColorToSelection();
        });
        palette.appendChild(btn);
    });
}

function applyColorToSelection() {
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    var range = selection.getRangeAt(0);
    if (range.collapsed) return;

    var color = COLORS[appState.selectedColor];
    
    // Usar execCommand para compatibilidade e simplicidade
    // Se for preto ou cinza (últimas cores), aplica como background
    if (appState.selectedColor >= COLORS.length - 2) {
        document.execCommand('backColor', false, color);
    } else {
        document.execCommand('foreColor', false, color);
    }
    
    // Forçar atualização do estado
    if (appState.selectedLineIndex !== null) {
        var element = document.querySelector('[data-index="' + appState.selectedLineIndex + '"]');
        if (element) {
            updateLineData(appState.selectedLineIndex, element);
        }
    }
}

// ========== UTILITÁRIOS ==========
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
    // Se tiver HTML (novo formato), retorna o HTML
    if (lineData.html) return lineData.html;
    // Se tiver apenas texto (formato antigo), retorna o texto
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
    normalBtn.onmouseover = function() { this.style.background = '#45a049'; };
    normalBtn.onmouseout = function() { this.style.background = '#4CAF50'; };
    normalBtn.onclick = function() {
        document.body.removeChild(modal);
        printMonth('normal');
    };
    
    var largeBtn = document.createElement('button');
    largeBtn.textContent = '📋 Impressão Grande (17 linhas)';
    largeBtn.style.cssText = 'display: block; width: 100%; padding: 15px; margin: 10px 0; font-size: 16px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;';
    largeBtn.onmouseover = function() { this.style.background = '#0b7dda'; };
    largeBtn.onmouseout = function() { this.style.background = '#2196F3'; };
    largeBtn.onclick = function() {
        document.body.removeChild(modal);
        printMonth('large');
    };
    
    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕ Cancelar';
    cancelBtn.style.cssText = 'display: block; width: 100%; padding: 15px; margin: 10px 0; font-size: 16px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;';
    cancelBtn.onmouseover = function() { this.style.background = '#da190b'; };
    cancelBtn.onmouseout = function() { this.style.background = '#f44336'; };
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
                // Modo Grande: mostrar exatamente 17 linhas numeradas
                for (var lineIdx = 0; lineIdx < 17; lineIdx++) {
                    var line = (dayData && dayData.lines && dayData.lines[lineIdx]) ? dayData.lines[lineIdx] : { text: '', spans: [] };
                    var lineContent = (line && line.text && line.text.trim() !== '') ? renderLineWithColors(line) : '&nbsp;';
                    linesHtml += '<div class="print-month-line"><span class="print-line-num">' + (lineIdx + 1) + '.</span>' + lineContent + '</div>';
                }
            } else {
                // Modo Normal: mostrar apenas linhas com conteúdo
                if (dayData && dayData.lines) {
                    linesHtml = dayData.lines.map(function(l, idx) {
                        if (l && l.text && l.text.trim() !== '') {
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
            // Célula invisível para dias de outros meses - removendo completamente bordas e visibilidade
            gridHtml += '<div class="print-month-day other-month" style="border: none !important; background: none !important; visibility: hidden !important;"></div>';
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Calendário Mensal - ' + monthName + '</title>' +
        '<style>' +
        '@page { size: 600mm 600mm; margin: 5mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }' +
        '.print-month-header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 10px; height: 15mm; }' +
        '.print-month-grid { display: block; width: 100%; border-top: 1px solid #000; border-left: 1px solid #000; overflow: hidden; }' +
        '.print-month-day-header { float: left; width: 14.28%; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px; padding: 2px; background: #eee; box-sizing: border-box; }' +
        '.print-month-day { float: left; width: 14.28%; border-right: 1px solid #000; border-bottom: 1px solid #000; height: 96.67mm; position: relative; overflow: hidden; box-sizing: border-box; }' +
        '.print-month-num { font-weight: bold; font-size: 14px !important; padding: 4px; color: #000 !important; }' +
        '.print-month-day.special .print-month-num { color: #FF0000; }' +
        '.print-month-day.other-month { background: none !important; border: none !important; visibility: hidden !important; }' +
        '.print-month-content { font-size: ' + (mode === 'large' ? '10px' : '10px') + '; line-height: ' + (mode === 'large' ? '1.1' : '1.1') + '; padding: 0 2px; }' +
        '.print-month-line { border-bottom: 1.5px solid #000 !important; padding: ' + (mode === 'large' ? '1px' : '1px') + ' 0; word-break: break-word; display: -webkit-box; display: -webkit-flex; display: flex; -webkit-box-align: start; -webkit-align-items: flex-start; align-items: flex-start; height: ' + (mode === 'large' ? '5.2mm' : '5.68mm') + '; box-sizing: border-box; }' +
        '.print-line-num { min-width: 18px; font-weight: bold !important; margin-right: 4px; font-size: 10px !important; color: #000 !important; display: inline-block; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>window.onafterprint = function() { window.close(); window.opener.focus(); window.opener.renderWeekView(); };</script></head><body>' +
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
        if (l && l.text && l.text.trim() !== '') {
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
        '.print-line { border-bottom: 1px solid #eee; padding: 8px 0; display: -webkit-box; display: -webkit-flex; display: flex; -webkit-box-align: start; -webkit-align-items: flex-start; align-items: flex-start; }' +
        '.print-line-num { min-width: 30px; font-weight: bold; color: #999; }' +
        '.print-line-content { -webkit-box-flex: 1; -webkit-flex: 1; flex: 1; }' +
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
                if (l && l.text && l.text.trim() !== '') {
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
        '.print-week-grid { display: -webkit-box; display: -webkit-flex; display: flex; border-top: 1px solid #000; border-left: 1px solid #000; height: 180mm; }' +
        '.print-week-day { -webkit-box-flex: 1; -webkit-flex: 1; flex: 1; border-right: 1px solid #000; border-bottom: 1px solid #000; position: relative; overflow: hidden; }' +
        '.print-week-header { background: #eee; padding: 5px; font-weight: bold; text-align: center; border-bottom: 1px solid #000; font-size: 12px; }' +
        '.print-week-day.special .print-week-header { color: #FF0000; }' +
        '.print-week-content { padding: 5px; font-size: 10px; }' +
        '.print-week-line { border-bottom: 0.1px solid #eee; padding: 2px 0; word-break: break-word; display: -webkit-box; display: -webkit-flex; display: flex; -webkit-box-align: start; -webkit-align-items: flex-start; align-items: flex-start; }' +
        '.print-line-num { min-width: 20px; font-weight: bold; color: #999; font-size: 8px; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>window.onafterprint = function() { window.close(); };</script></head><body>' +
        '<div class="print-week-title">PLANEJADOR SEMANAL - ' + monthName + '</div>' +
        '<div class="print-week-grid">' + daysHtml + '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}
