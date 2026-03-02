import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
// Используем правила сравнения по умолчанию
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes).forEach(elementName => {
        // Проверяем, существует ли элемент с таким именем
        if (elements[elementName]) {
            // Получаем массив значений для этого элемента
            const values = Object.values(indexes[elementName]);
            
            // Создаём опции для каждого значения
            const options = values.map(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                return option;
            });
            
            // Добавляем опции в select
            elements[elementName].append(...options);
        }
    });

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            // Находим ближайший родительский элемент с классом 'filter-wrapper'
            const wrapper = action.closest('.filter-wrapper');
            if (wrapper) {
                // Находим input внутри этого wrapper
                const input = wrapper.querySelector('input');
                if (input) {
                    // Очищаем значение input
                    input.value = '';
                    
                    // Получаем имя поля из data-field кнопки
                    const field = action.dataset.field;
                    if (field) {
                        // Очищаем соответствующее поле в state
                        state[field] = '';
                    }
                }
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    }
}