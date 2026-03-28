// initFiltering создаёт две функции для фильтрации данных.
// Она не сразу заполняет выпадающий список, а возвращает метод updateIndexes для этого.
export function initFiltering(elements) {
    // Функция обновляет опции в списках <select> на основе полученных индексов.
    // Она вызывается после получения данных индексов с сервера.
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name; // visible label for option
                el.value = name; // actual value that will be used in query
                return el;
            }))
        })
    }

    const applyFiltering = (query, state, action) => {
        // Если нажата кнопка очистки, то очищаем соответствующее поле фильтра.
        if (action && action.name === 'clear') {
            const wrapper = action.closest('.filter-wrapper');
            if (wrapper) {
                const input = wrapper.querySelector('input');
                if (input) {
                    input.value = ''; // очистка DOM-поля
                    const field = action.dataset.field;
                    if (field) {
                        state[field] = ''; // очистка значения в состоянии формы
                    }
                }
            }
        }

        // Собираем параметры фильтрации из всех элементов фильтра.
        const filter = {};
        Object.keys(elements).forEach(key => {
            const element = elements[key];
            if (element && ['INPUT', 'SELECT'].includes(element.tagName) && element.value) {
                // Формируем query-параметр вида filter[fieldName]=fieldValue
                filter[`filter[${element.name}]`] = element.value;
            }
        })

        // Если фильтров нет, оставляем query без изменений.
        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    }

    return {
        updateIndexes,
        applyFiltering
    }
}