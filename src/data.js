import {makeIndex} from "./lib/utils.js";

// data.js отвечает за загрузку данных с сервера и за кеширование результатов.
// Здесь мы определяем, где находится сервер и как запрашивать нужные данные.

// Адрес сервера, откуда будем загружать данные.
const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData(sourceData) {
    // Переменные для кеша, чтобы не запрашивать одни и те же данные заново.
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    // Приводим записи из сервера к нужному формату таблицы.
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    const getIndexes = async () => {
        // Загружаем индексы только один раз.
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }

        return { sellers, customers };
    };

    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        // Используем кеш, если query не изменился и нет запроса на обновление.
        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}