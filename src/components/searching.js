// initSearching делает из поля поиска функцию, которая добавляет параметр search в query.
export function initSearching(searchField) {
    // searchField — имя поля, в котором пользователь вводит текст для поиска.
    return (query, state, action) => {
        // Если в поле есть значение, добавляем параметр search к query.
        // Если поле пустое, возвращаем query без изменений.
        return state[searchField] ? Object.assign({}, query, {
            search: state[searchField]
        }) : query;
    };
}