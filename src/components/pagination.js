import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.innerHTML = '';

    return (data, state, action) => {
        // @todo: #2.1 — посчитать количество страниц, объявить переменные и константы
        const rowsPerPage = state.rowsPerPage;
        const totalDataLength = data.length;
        const pageCount = Math.ceil(totalDataLength / rowsPerPage);
        
        // Важно: если данных нет, страниц нет
        if (totalDataLength === 0) {
            if (fromRow) fromRow.textContent = '0';
            if (toRow) toRow.textContent = '0';
            if (totalRows) totalRows.textContent = '0';
            pages.innerHTML = '';
            return [];
        }
        
        let page = state.page;

        // @todo: #2.6 — обработать действия
        if (action) {
            switch(action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount, page + 1);
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    page = pageCount;
                    break;
            }
            
            // Обновляем state.page для следующего рендера
            state.page = page;
        }

        // @todo: #2.4 — получить список видимых страниц и вывести их
        const visiblePages = getPages(page, pageCount, 5);
        
        const pageButtons = visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        });
        
        pages.replaceChildren(...pageButtons);

        // @todo: #2.5 — обновить статус пагинации
        if (fromRow) {
            fromRow.textContent = (page - 1) * rowsPerPage + 1;
        }
        if (toRow) {
            toRow.textContent = Math.min(page * rowsPerPage, totalDataLength);
        }
        if (totalRows) {
            totalRows.textContent = totalDataLength;
        }

        // @todo: #2.2 — посчитать сколько строк нужно пропустить и получить срез данных
        const skip = (page - 1) * rowsPerPage;
        return data.slice(skip, skip + rowsPerPage);
    }
}