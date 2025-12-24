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
    cell.className = 'month-day-cell';

    var dateStr = getDateString(date);
    var dayOfWeek = date.getDay();
    var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    var isHoliday = isHolidayDate(date);
    var isOtherMonth = date.getMonth() !== appState.currentDate.getMonth();

    if (isOtherMonth) {
        cell.classList.add('other-month');
    } else if (isWeekend || isHoliday) {
        cell.classList.add(isHoliday ? 'holiday' : 'weekend');
    }

    var dayNum = document.createElement('div');
    dayNum.className = 'month-day-number';
    dayNum.textContent = date.getDate();
    cell.appendChild(dayNum);

    var dayData = appState.days[dateStr] || { lines: [] };
    if (!dayData.lines || dayData.lines.length === 0) {
        dayData.lines = Array(30).fill(null).map(function() { return { text: '', spans: [] }; });
    }

    var notesContainer = document.createElement('div');
    notesContainer.className = 'month-day-notes';
    
    for (var i = 0; i < 30; i++) {
        var line = dayData.lines[i] || { text: '', spans: [] };
        
        if (line && line.text && line.text.trim() !== '') {
            var lineWrapper = document.createElement('div');
            lineWrapper.className = 'month-line-wrapper';

            var lineNum = document.createElement('div');
            lineNum.className = 'month-line-number';
            lineNum.textContent = (i + 1) + '.';

            var lineDiv = document.createElement('div');
            lineDiv.className = 'month-line-content';
            lineDiv.innerHTML = renderLineWithColors(line);
            
            lineWrapper.appendChild(lineNum);
            lineWrapper.appendChild(lineDiv);
            notesContainer.appendChild(lineWrapper);
        }
    }
    
    cell.appendChild(notesContainer);

    cell.addEventListener('click', function() {
        openDayEdit(date);
    });

    return cell;
}

// ========== EDIÇÃO DIÁRIA ==========
function openDayEdit(date) {
    appState.selectedDay = getDateString(date);
    var dayEditView = document.getElementById('dayEditView');
    var editDayInfo = document.getElementById('editDayInfo');
    var notebookLines = document.getElementById('notebookLines');

    var dayName = getDayName(date.getDay());
    editDayInfo.textContent = dayName + ', ' + formatDate(date);
    
    if (!appState.days[appState.selectedDay]) {
        appState.days[appState.selectedDay] = {
            lines: Array(30).fill(null).map(function() { return { text: '', spans: [] }; })
        };
    }
    
    var dayData = appState.days[appState.selectedDay];
    notebookLines.innerHTML = '';

    for (var i = 0; i < 30; i++) {
        (function(index) {
            var lineData = dayData.lines[index] || { text: '', spans: [] };
            var lineWrapper = document.createElement('div');
            lineWrapper.className = 'notebook-line-wrapper';

            var lineNum = document.createElement('div');
            lineNum.className = 'line-number';
            lineNum.textContent = index + 1;

            var lineEditable = document.createElement('div');
            lineEditable.className = 'notebook-line-editable';
            lineEditable.contentEditable = true;
            lineEditable.setAttribute('data-index', index);
            
            updateEditableContent(lineEditable, lineData);

            lineEditable.addEventListener('input', function(e) {
                lineData.text = lineEditable.textContent;
                if (lineData.spans) {
                    lineData.spans = lineData.spans.filter(function(span) { return span.start < lineData.text.length; });
                    lineData.spans.forEach(function(span) {
                        if (span.end > lineData.text.length) span.end = lineData.text.length;
                    });
                }
                saveDataToStorage();
            });

            lineEditable.addEventListener('focus', function() {
                appState.selectedLineIndex = index;
            });

            lineWrapper.appendChild(lineNum);
            lineWrapper.appendChild(lineEditable);
            notebookLines.appendChild(lineWrapper);
        })(i);
    }

    dayEditView.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderColorPalette();
}

function updateEditableContent(element, lineData) {
    element.innerHTML = renderLineWithColors(lineData);
}

function closeDayEdit() {
    saveDataToStorage();
    document.getElementById('dayEditView').style.display = 'none';
    document.body.style.overflow = '';
    
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
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            applyColorToSelectedText(index);
        });
        
        palette.appendChild(btn);
    });
}

function getTextPosition(container, node, offset) {
    var position = 0;
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    var currentNode;
    while (currentNode = walker.nextNode()) {
        if (currentNode === node) {
            position += offset;
            break;
        }
        position += currentNode.textContent.length;
    }
    return position;
}

function applyColorToSelectedText(colorIndex) {
    var selection = window.getSelection();
    if (selection.toString().length === 0) {
        alert('Por favor, selecione o texto que deseja colorir');
        return;
    }

    var selectedText = selection.toString();
    var anchorNode = selection.anchorNode;
    var editableElement = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode;
    
    while (editableElement && !editableElement.classList.contains('notebook-line-editable')) {
        editableElement = editableElement.parentElement;
    }

    if (!editableElement) {
        alert('Por favor, selecione o texto dentro de uma linha');
        return;
    }

    var lineIndex = parseInt(editableElement.getAttribute('data-index'));
    var dayData = appState.days[appState.selectedDay];
    var lineData = dayData.lines[lineIndex];
    
    var range = selection.getRangeAt(0);
    var start = getTextPosition(editableElement, range.startContainer, range.startOffset);
    var end = start + selectedText.length;

    if (!lineData.spans) lineData.spans = [];
    
    lineData.spans.push({ start: start, end: end, color: colorIndex });
    lineData.spans.sort(function(a, b) { return a.start - b.start; });
    
    lineData.spans = lineData.spans.filter(function(s) {
        if (s.start >= start && s.end <= end && (s.start !== start || s.end !== end)) return false;
        return true;
    });

    saveDataToStorage();
    
    var cursorPosition = end;
    updateEditableContent(editableElement, lineData);
    
    setTimeout(function() {
        editableElement.focus();
        try {
            var textNode = getTextNodeAtPosition(editableElement, cursorPosition);
            if (textNode) {
                var newRange = document.createRange();
                newRange.setStart(textNode.node, textNode.offset);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        } catch (e) {
            console.log('Erro ao restaurar cursor:', e);
        }
    }, 10);
}

function getTextNodeAtPosition(container, position) {
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    var currentPos = 0;
    var node;
    
    while (node = walker.nextNode()) {
        var nodeLength = node.textContent.length;
        if (currentPos + nodeLength >= position) {
            return { node: node, offset: position - currentPos };
        }
        currentPos += nodeLength;
    }
    
    return null;
}

function renderLineWithColors(lineData) {
    if (!lineData || !lineData.text) return '';
    if (!lineData.spans || lineData.spans.length === 0) return escapeHtml(lineData.text);

    var html = '';
    var lastIndex = 0;
    var spans = lineData.spans.slice().sort(function(a, b) { return a.start - b.start; });

    for (var i = 0; i < spans.length; i++) {
        var span = spans[i];
        if (span.start >= lineData.text.length) continue;
        var end = Math.min(span.end, lineData.text.length);
        if (lastIndex < span.start) {
            html += escapeHtml(lineData.text.substring(lastIndex, span.start));
        }
        var spanText = lineData.text.substring(span.start, end);
        var color = COLORS[span.color];
        // Aplica a cor como background (marca-texto)
        var style = 'background-color: ' + color + '; color: ' + getContrastColor(color) + ';';

        html += '<span style="' + style + ' padding: 1px 3px; border-radius: 2px; display: inline-block;">' + escapeHtml(spanText) + '</span>';
        lastIndex = end;
    }
    if (lastIndex < lineData.text.length) html += escapeHtml(lineData.text.substring(lastIndex));
    return html + '\n';
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getContrastColor(hexColor) {
    var r = parseInt(hexColor.substr(1, 2), 16);
    var g = parseInt(hexColor.substr(3, 2), 16);
    var b = parseInt(hexColor.substr(5, 2), 16);
    var brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

// ========== UTILITÁRIOS DE DATA ==========
function getDateString(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function getDayName(dayOfWeek) {
    var days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[dayOfWeek];
}

function formatDate(date) {
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function isHolidayDate(date) {
    var monthDay = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    return FERIADOS_BRASIL.indexOf(monthDay) !== -1;
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
    largeBtn.textContent = '📋 Impressão Grande (20 linhas)';
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
        var dateStr = getDateString(currentDate);
        var dayData = appState.days[dateStr];
        var isOtherMonth = currentDate.getMonth() !== month;
        var isSpecial = currentDate.getDay() === 0 || currentDate.getDay() === 6 || isHolidayDate(currentDate);
        
        var linesHtml = '';
        if (mode === 'large') {
            // Modo Grande: mostrar todas as 20 linhas numeradas
            for (var lineIdx = 0; lineIdx < 20; lineIdx++) {
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

        gridHtml += '<div class="print-month-day' + (isOtherMonth ? ' other-month' : '') + (isSpecial ? ' special' : '') + '">' +
                        '<div class="print-month-num">' + currentDate.getDate() + '</div>' +
                        '<div class="print-month-content">' + linesHtml + '</div>' +
                    '</div>';
        
        currentDate.setDate(currentDate.getDate() + 1);
    }

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Calendário Mensal - ' + monthName + '</title>' +
        '<style>' +
        '@page { size: 600mm 600mm; margin: 5mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }' +
        '.print-month-header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 10px; height: 15mm; }' +
        '.print-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid #000; border-left: 1px solid #000; }' +
        '.print-month-day-header { border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px; padding: 2px; background: #eee; }' +
        '.print-month-day { border-right: 1px solid #000; border-bottom: 1px solid #000; height: 96.67mm; position: relative; overflow: hidden; }' +
        '.print-month-num { font-weight: bold; font-size: 10px; padding: 2px; }' +
        '.print-month-day.special .print-month-num { color: #FF0000; }' +
        '.print-month-day.other-month { background: #f9f9f9; color: #ccc; }' +
        '.print-month-content { font-size: ' + (mode === 'large' ? '9px' : '10px') + '; line-height: ' + (mode === 'large' ? '1.0' : '1.1') + '; padding: 0 2px; }' +
        '.print-month-line { border-bottom: 0.1px solid #eee; padding: ' + (mode === 'large' ? '0.5px' : '1px') + ' 0; word-break: break-word; display: flex; align-items: flex-start; height: ' + (mode === 'large' ? '4.5mm' : '5.68mm') + '; }' +
        '.print-line-num { min-width: 15px; font-weight: bold; margin-right: 2px; font-size: 8px; color: #000; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>window.onafterprint = function() { window.close(); window.opener.focus(); window.opener.renderWeekView(); };</script></head><body>' +
        '<div class="print-month-header">PLANEJADOR MENSAL - ' + monthName + '</div>' +
        '<div class="print-month-grid">' +
        '<div class="print-month-day-header">DOM</div><div class="print-month-day-header">SEG</div><div class="print-month-day-header">TER</div>' +
        '<div class="print-month-day-header">QUA</div><div class="print-month-day-header">QUI</div><div class="print-month-day-header">SEX</div><div class="print-month-day-header">SAB</div>' +
        gridHtml + '</div></body></html>';

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
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }' +
        '.print-header { text-align: center; padding: 10px 0; border-bottom: 2px solid #333; margin-bottom: 10px; }' +
        '.print-header h1 { margin: 0; font-size: 18px; font-weight: bold; ' + (isSpecial ? 'color: #FF0000;' : '') + ' }' +
        '.print-lines { display: flex; flex-direction: column; padding: 0 10px; }' +
        '.print-line { border-bottom: 1px solid #eee; display: flex; align-items: flex-start; padding: 8px 0; ' + (isSpecial ? 'color: #FF0000;' : '') + ' }' +
        '.print-line-num { min-width: 35px; font-weight: bold; font-size: 14px; color: #000; }' +
        '.print-line-content { flex: 1; font-size: 16px; line-height: 1.4; word-break: break-word; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>window.onafterprint = function() { window.close(); window.opener.focus(); window.opener.renderWeekView(); };</script></head><body>' +
        '<div class="print-header"><h1>' + dayName + ', ' + formatDate(date) + '</h1></div>' +
        '<div class="print-lines">' + linesHtml + '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}

function printWeek() {
    var startDate = new Date(appState.currentDate);
    startDate.setDate(appState.currentDate.getDate() - appState.currentDate.getDay());

    var printWindow = window.open('', '', 'width=800,height=600');
    var daysHtml = '';
    var hasAnyContent = false;

    for (var i = 1; i <= 7; i++) {
        var dayIndex = i % 7;
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + dayIndex);
        var dateStr = getDateString(date);
        var dayData = appState.days[dateStr];
        
        var dayLinesHtml = '';
        var dayHasContent = false;
        if (dayData && dayData.lines) {
            dayLinesHtml = dayData.lines.map(function(l, idx) {
                if (l && l.text && l.text.trim() !== '') {
                    dayHasContent = true;
                    hasAnyContent = true;
                    return '<div class="print-line"><span class="print-line-num">' + (idx + 1) + '.</span>' + renderLineWithColors(l) + '</div>';
                }
                return '';
            }).join('');
        }

        if (dayHasContent) {
            var isSpecial = date.getDay() === 0 || date.getDay() === 6 || isHolidayDate(date);
            var dayName = getDayName(date.getDay());

            daysHtml += '<div class="print-day" style="' + (isSpecial ? 'color: #FF0000;' : '') + '">' +
                '<div class="print-header" style="' + (isSpecial ? 'color: #FF0000;' : '') + '">' + dayName + ', ' + formatDate(date) + '</div>' +
                '<div class="print-lines">' + dayLinesHtml + '</div></div>';
        }
    }

    if (!hasAnyContent) {
        daysHtml = '<div style="text-align: center; padding: 50px;">Nenhuma anotação encontrada para esta semana.</div>';
    }

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Impressão Semanal</title>' +
        '<style>' +
        '@page { size: A4 portrait; margin: 5mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }' +
        '.week-container-print { width: 100%; box-sizing: border-box; display: flex; flex-direction: column; }' +
        '.print-day { page-break-inside: avoid; border-bottom: 2px solid #333; padding: 10px 0.5cm; display: flex; flex-direction: column; }' +
        '.print-day:last-child { border-bottom: none; }' +
        '.print-header { padding: 5px 0; font-weight: bold; font-size: 16px; border-bottom: 1px solid #eee; margin-bottom: 5px; }' +
        '.print-lines { display: flex; flex-direction: column; gap: 2px; }' +
        '.print-line { border-bottom: 1px solid #eee; padding: 3px 0; font-size: 12px; line-height: 1.2; word-break: break-word; display: flex; align-items: flex-start; }' +
        '.print-line-num { min-width: 25px; font-weight: bold; font-size: 10px; color: #000; margin-right: 5px; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>window.onafterprint = function() { window.close(); window.opener.focus(); window.opener.renderWeekView(); };</script></head><body><div class="week-container-print">' + daysHtml + '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}
