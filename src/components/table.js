import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
 // Шаблоны "до" добавляем в обратном порядке через prepend
    if (before && Array.isArray(before)) {
        [...before].reverse().forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.prepend(root[subName].container);
        });
    }
    
    // Шаблоны "после" добавляем в прямом порядке через append
    if (after && Array.isArray(after)) {
        after.forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.append(root[subName].container);
        });
    }
    // @todo: #1.3 —  обработать события и вызвать onAction()
// Обработчик изменения (change)
    root.container.addEventListener('change', () => {
        onAction();
    });
    
    // Обработчик сброса (reset) с отложенным вызовом
    root.container.addEventListener('reset', () => {
        setTimeout(() => onAction(), 0);
    });
    
    // Обработчик отправки формы (submit)
    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });
    
    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        const nextRows = data.map(item => {
            // Клонируем шаблон строки
            const row = cloneTemplate(rowTemplate);
            
            // Перебираем все ключи объекта с данными
            Object.keys(item).forEach(key => {
                // Проверяем, есть ли элемент с таким data-element в шаблоне
                if (row.elements[key]) {
                    const element = row.elements[key];
                    
                    // Для input и select используем value, для остальных - textContent
                    if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                        element.value = item[key];
                    } else {
                        element.textContent = item[key];
                    }
                }
            });
            
            return row.container;
        });
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}