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

    // Правила для фильтрации
    const customerRule = () => (key, sourceValue, targetValue) => {
        if (key !== 'customer') return { continue: true };
        if (!targetValue) return { skip: true };
        
        const sourceStr = String(sourceValue || '').toLowerCase();
        const targetStr = String(targetValue).toLowerCase();
        
        return { result: sourceStr.includes(targetStr) };
    };

    const sellerRule = () => (key, sourceValue, targetValue) => {
        if (key !== 'seller') return { continue: true };
        if (!targetValue) return { skip: true };
        
        return { result: String(sourceValue) === String(targetValue) };
    };

    const totalFromRule = () => (key, sourceValue, targetValue) => {
        if (key !== 'totalFrom') return { continue: true };
        if (!targetValue) return { skip: true };
        
        const rowTotal = parseFloat(sourceValue) || 0;
        const filterValue = parseFloat(targetValue) || 0;
        
        return { result: rowTotal >= filterValue };
    };

    const totalToRule = () => (key, sourceValue, targetValue) => {
        if (key !== 'totalTo') return { continue: true };
        if (!targetValue) return { skip: true };
        
        const rowTotal = parseFloat(sourceValue) || 0;
        const filterValue = parseFloat(targetValue) || 0;
        
        return { result: rowTotal <= filterValue };
    };

    const dateRule = () => (key, sourceValue, targetValue) => {
        if (key !== 'date') return { continue: true };
        if (!targetValue) return { skip: true };
        
        const sourceStr = String(sourceValue || '').toLowerCase();
        const targetStr = String(targetValue).toLowerCase();
        
        return { result: sourceStr.includes(targetStr) };
    };

    const compare = createComparison([
        'skipEmptyTargetValues'
    ], [
        customerRule(),
        sellerRule(),
        totalFromRule(),
        totalToRule(),
        dateRule()
    ]);

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
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    }
}