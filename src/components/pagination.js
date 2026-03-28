import {getPages} from "../lib/utils.js";

// initPagination возвращает две вспомогательные функции: applyPagination и updatePagination.
// Они нужны, чтобы собирать параметры запроса и потом отрисовывать навигацию по страницам.
export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // Создаём шаблон кнопки страницы и очищаем контейнер перед заполнением.
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.innerHTML = '';

    // pageCount хранит общее число страниц после получения данных с сервера.
    let pageCount;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage; // количество строк на странице
        let page = state.page; // текущая страница

        if (action) {
            // Если пользователь нажал кнопку пагинации, изменяем номер страницы.
            switch(action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = pageCount ? Math.min(pageCount, page + 1) : page + 1;
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    if (pageCount) {
                        page = pageCount;
                    }
                    break;
            }

            // Сохраняем новый номер страницы обратно в состояние.
            state.page = page;
        }

        // Возвращаем новый query, не изменяя исходный объект.
        return Object.assign({}, query, {
            limit,
            page
        });
    };

    const updatePagination = (total, { page, limit }) => {
        // Рассчитываем общее количество страниц по общему числу строк и лимиту.
        pageCount = Math.ceil(total / limit);

        // Получаем список видимых страниц для рендеринга.
        const visiblePages = getPages(page, pageCount, 5);
        const pageButtons = visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        });

        // Обновляем кнопки на странице.
        pages.replaceChildren(...pageButtons);

        // Обновляем поля с информацией о диапазоне строк.
        if (fromRow) {
            fromRow.textContent = (page - 1) * limit + 1;
        }
        if (toRow) {
            toRow.textContent = Math.min(page * limit, total);
        }
        if (totalRows) {
            totalRows.textContent = total;
        }
    };

    return {
        updatePagination,
        applyPagination
    };
}