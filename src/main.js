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

// main.js — точка входа приложения.
// Он собирает параметры из формы, делает запрос на сервер и показывает таблицу.
// Здесь находятся самые важные шаги: сбор состояния, построение query и рендер результата.

// Инициализируем API-слой, который будет делать запросы к серверу.
const api = initData(sourceData);

/**
 * Считывает все значения из формы таблицы и приводит некоторые поля к числам.
 * Возвращает объект состояния, который будет использоваться для сборки query.
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    // В форме rowsPerPage приходит строка, поэтому превращаем её в число.
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;
    
    // Номер страницы также должен быть числом и не меньше 1.
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
 * Обновляет блок пагинации внизу таблицы.
 * @param {Object} state - состояние формы
 * @param {number} displayedCount - количество показанных записей на странице
 * @param {number} totalFilteredCount - общее количество записей после фильтрации
 */
function updatePaginationInfo(state, displayedCount, totalFilteredCount) {
    if (sampleTable.pagination?.elements) {
        const { fromRow, toRow, totalRows } = sampleTable.pagination.elements;
        
        if (fromRow) {
            const startRow = totalFilteredCount === 0 ? 0 : (state.page - 1) * state.rowsPerPage + 1;
            fromRow.textContent = displayedCount === 0 ? 0 : Math.min(startRow, totalFilteredCount);
        }
        if (toRow) {
            toRow.textContent = Math.min(state.page * state.rowsPerPage, totalFilteredCount);
        }
        if (totalRows) {
            totalRows.textContent = totalFilteredCount;
        }
    }
}

/**
 * Главная функция рендеринга таблицы.
 * Она строит query, отправляет его на сервер и отображает результат.
 * @param {HTMLButtonElement?} action - действие пользователя, например кнопка пагинации или сортировки
 */
async function render(action) {
    const state = collectState(); // собираем данные из формы
    let query = {}; // сюда будем добавлять параметры запроса поочередно

    // Добавление параметров поиска, фильтрации, сортировки и пагинации.
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    // Отправляем query на сервер и получаем готовые записи.
    const { total, items } = await api.getRecords(query);

    // Перерисовываем элементы пагинации и саму таблицу.
    updatePagination(total, query);
    sampleTable.render(items);
}

// Инициализация таблицы со всеми шаблонами.
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// Инициализация модулей.

// 1. Пагинация
const { applyPagination, updatePagination } = initPagination(
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
            input.value = page; // проставляем номер страницы в кнопке
            input.checked = isCurrent; // текущая страница отмечается checked
        }
        if (span) {
            span.textContent = page; // текст на кнопке
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
const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);

// 4. Поиск
const applySearching = initSearching('search');

// Добавляем контейнер таблицы на страницу.
const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Функция инициализации, которая сначала загружает индексы с сервера.
async function init() {
    const indexes = await api.getIndexes();

    // После получения индексов заполняем выпадающий список продавцов.
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

// Запускаем первую загрузку и рендер таблицы.
init().then(render);