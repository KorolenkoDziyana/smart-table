import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    // Создаём компаратор с правилом поиска по нескольким полям
    const compare = createComparison([
        'skipEmptyTargetValues'
    ], [
        rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)
    ]);

    return (data, state, action) => {
        const searchValue = state[searchField] || '';
        
        // Если поиск пустой, возвращаем все данные
        if (!searchValue) {
            return data;
        }
        
        // Фильтруем данные
        return data.filter(row => compare(row, { [searchField]: searchValue }));
    };
}