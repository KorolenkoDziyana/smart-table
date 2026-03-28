import {sortMap} from "../lib/sort.js";

// initSorting создаёт функцию, которая добавляет параметр sort в query.
// sort указывает серверу, по какому полю и в каком направлении сортировать данные.
export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // Меняем текущее направление для нажатой колонки.
            action.dataset.value = sortMap[action.dataset.value];
            field = action.dataset.field;
            order = action.dataset.value;

            // Сбрасываем сортировку на остальных колонках.
            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';
                }
            });
        } else {
            // Если нет действия, ищем активную сортировку в текущем DOM.
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        const sort = (field && order !== 'none') ? `${field}:${order}` : null;
        return sort ? Object.assign({}, query, { sort }) : query;
    }
}