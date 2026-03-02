import {createComparison, rules} from "../lib/compare.js";

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes).forEach(elementName => {
        if (elements[elementName]) {
            const values = Object.values(indexes[elementName]);
            
            const options = values.map(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                return option;
            });
            
            elements[elementName].append(...options);
        }
    });

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const wrapper = action.closest('.filter-wrapper');
            if (wrapper) {
                const input = wrapper.querySelector('input');
                if (input) {
                    input.value = '';
                    const field = action.dataset.field;
                    if (field) {
                        state[field] = '';
                    }
                }
            }
            // Возвращаем все данные после очистки
            return data;
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => {
            // Фильтр по дате (частичное совпадение)
            if (state.date && state.date.trim() !== '') {
                const rowDate = String(row.date || '').toLowerCase();
                const filterDate = String(state.date).toLowerCase();
                if (!rowDate.includes(filterDate)) {
                    return false;
                }
            }
            
            // Фильтр по клиенту (частичное совпадение)
            if (state.customer && state.customer.trim() !== '') {
                const rowCustomer = String(row.customer || '').toLowerCase();
                const filterCustomer = String(state.customer).toLowerCase();
                if (!rowCustomer.includes(filterCustomer)) {
                    return false;
                }
            }
            
            // Фильтр по продавцу (точное совпадение)
            if (state.seller && state.seller.trim() !== '') {
                if (String(row.seller || '') !== String(state.seller)) {
                    return false;
                }
            }
            
            // Фильтр по минимальной сумме (totalFrom)
            if (state.totalFrom && state.totalFrom.trim() !== '') {
                const rowTotal = parseFloat(row.total) || 0;
                const filterFrom = parseFloat(state.totalFrom) || 0;
                if (rowTotal < filterFrom) {
                    return false;
                }
            }
            
            // Фильтр по максимальной сумме (totalTo)
            if (state.totalTo && state.totalTo.trim() !== '') {
                const rowTotal = parseFloat(row.total) || 0;
                const filterTo = parseFloat(state.totalTo) || 0;
                if (rowTotal > filterTo) {
                    return false;
                }
            }
            
            return true;
        });
    }
}