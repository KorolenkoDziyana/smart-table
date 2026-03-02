import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    // Создаём шаблон из первого элемента в контейнере pages
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    // Очищаем контейнер (удаляем все дочерние элементы)
    pages.innerHTML = '';

    return (data, state, action) => {
        // @todo: #2.1 — посчитать количество страниц, объявить переменные и константы
        const rowsPerPage = state.rowsPerPage; // количество строк на странице
        const pageCount = Math.ceil(data.length / rowsPerPage); // общее количество страниц
        let page = state.page; // текущая страница (может меняться при действиях)

        // @todo: #2.6 — обработать действия
        if (action) {
            switch(action.name) {
                case 'prev': // предыдущая страница
                    page = Math.max(1, page - 1);
                    break;
                case 'next': // следующая страница
                    page = Math.min(pageCount, page + 1);
                    break;
                case 'first': // первая страница
                    page = 1;
                    break;
                case 'last': // последняя страница
                    page = pageCount;
                    break;
            }
        }

        // @todo: #2.4 — получить список видимых страниц и вывести их
        // Получаем массив страниц для отображения (максимум 5)
        const visiblePages = getPages(page, pageCount, 5);
        
        // Создаём кнопки для каждой видимой страницы
        const pageButtons = visiblePages.map(pageNumber => {
            // Клонируем шаблон
            const el = pageTemplate.cloneNode(true);
            // Заполняем кнопку через колбэк createPage
            return createPage(el, pageNumber, pageNumber === page);
        });
        
        // Добавляем кнопки в контейнер
        pages.replaceChildren(...pageButtons);

        // @todo: #2.5 — обновить статус пагинации
        if (fromRow) {
            fromRow.textContent = (page - 1) * rowsPerPage + 1;
        }
        if (toRow) {
            toRow.textContent = Math.min(page * rowsPerPage, data.length);
        }
        if (totalRows) {
            totalRows.textContent = data.length;
        }

        // @todo: #2.2 — посчитать сколько строк нужно пропустить и получить срез данных
        const skip = (page - 1) * rowsPerPage; // сколько строк пропустить
        return data.slice(skip, skip + rowsPerPage);
    }
}