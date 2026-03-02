import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    // Преобразуем строковые значения в числа для пагинации
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;
    
    // Важно: page может быть строкой, преобразуем в число
    let page = parseInt(state.page);
    if (isNaN(page) || page < 1) {
        page = 1;
    }

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Обновляет информацию о строках в пагинации
 * @param {Object} state - состояние
 * @param {number} displayedCount - количество отображаемых строк (после пагинации)
 * @param {number} totalFilteredCount - общее количество после фильтрации (до пагинации)
 */
function updatePaginationInfo(state, displayedCount, totalFilteredCount) {
    if (sampleTable.pagination?.elements) {
        const { fromRow, toRow, totalRows } = sampleTable.pagination.elements;
        
        if (fromRow) {
            const startRow = totalFilteredCount === 0 ? 0 : (state.page - 1) * state.rowsPerPage + 1;
            fromRow.textContent = displayedCount === 0 ? 0 : Math.min(startRow, totalFilteredCount);
        }
        if (toRow) {
            const endRow = Math.min(state.page * state.rowsPerPage, totalFilteredCount);
            toRow.textContent = endRow;
        }
        if (totalRows) {
            totalRows.textContent = totalFilteredCount;
        }
    }
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState();
    let result = [...data];
    
    // Применяем модули в правильном порядке
    result = applySearching(result, state, action);    // 1. Поиск
    result = applyFiltering(result, state, action);    // 2. Фильтрация
    
    const totalFilteredCount = result.length; // Сохраняем после фильтрации
    
    result = applySorting(result, state, action);      // 3. Сортировка
    result = applyPagination(result, state, action);   // 4. Пагинация

    sampleTable.render(result);
    updatePaginationInfo(state, result.length, totalFilteredCount);
}

// Инициализация таблицы со всеми шаблонами
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// Инициализация модулей

// 1. Пагинация
const applyPagination = initPagination(
    {
        pages: sampleTable.pagination.elements.pages,
        form: sampleTable.pagination.elements.form,
        fromRow: sampleTable.pagination.elements.fromRow,
        toRow: sampleTable.pagination.elements.toRow,
        totalRows: sampleTable.pagination.elements.totalRows
    },
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const span = el.querySelector('span');
        
        if (input) {
            input.value = page;
            input.checked = isCurrent;
        }
        if (span) {
            span.textContent = page;
        }
        
        return el;
    }
);

// 2. Сортировка
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

// 3. Фильтрация
const applyFiltering = initFiltering(
    sampleTable.filter.elements,
    {
        searchBySeller: indexes.sellers
    }
);

// 4. Поиск
const applySearching = initSearching('search');

// Добавляем таблицу на страницу
const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Первый рендер
render();