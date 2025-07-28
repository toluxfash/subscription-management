/**
 * 货币配置文件
 * 集中管理支持的货币列表，避免在多个服务中重复定义
 */

// 所有支持的货币代码（固定不变）
const ALL_CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];

// 基础货币配置 - 从环境变量读取，默认为 CNY
let BASE_CURRENCY = process.env.BASE_CURRENCY || 'CNY';

// 验证基础货币是否在支持的货币列表中
if (!ALL_CURRENCY_CODES.includes(BASE_CURRENCY)) {
    console.warn(`⚠️  Invalid BASE_CURRENCY: ${BASE_CURRENCY}. Using default: CNY`);
    BASE_CURRENCY = 'CNY';
}

/**
 * 支持的货币代码列表（基础货币在前，其他按字母排序）
 * 这些货币支持汇率API获取和转换
 */
const SUPPORTED_CURRENCY_CODES = [
    BASE_CURRENCY,
    ...ALL_CURRENCY_CODES.filter(code => code !== BASE_CURRENCY).sort()
];

// 所有货币的详细信息（固定不变）
const ALL_CURRENCIES = [
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
];

/**
 * 支持的货币详细信息（基础货币在前，其他按字母排序）
 */
const SUPPORTED_CURRENCIES = [
    ALL_CURRENCIES.find(c => c.code === BASE_CURRENCY),
    ...ALL_CURRENCIES.filter(c => c.code !== BASE_CURRENCY).sort((a, b) => a.code.localeCompare(b.code))
];

// 基础汇率配置 - 根据基础货币动态生成
const BASE_RATES = {
    CNY: {
        CNY: 1.0000,
        USD: 0.1538,
        EUR: 0.1308,
        GBP: 0.1154,
        CAD: 0.1923,
        AUD: 0.2077,
        JPY: 16.9231
    },
    USD: {
        USD: 1.0000,
        CNY: 6.5000,
        EUR: 0.8500,
        GBP: 0.7500,
        CAD: 1.2500,
        AUD: 1.3500,
        JPY: 110.0000
    },
    EUR: {
        EUR: 1.0000,
        USD: 1.1765,
        CNY: 7.6471,
        GBP: 0.8824,
        CAD: 1.4706,
        AUD: 1.5882,
        JPY: 129.4118
    },
    GBP: {
        GBP: 1.0000,
        USD: 1.3333,
        CNY: 8.6667,
        EUR: 1.1333,
        CAD: 1.6667,
        AUD: 1.8000,
        JPY: 146.6667
    },
    CAD: {
        CAD: 1.0000,
        USD: 0.8000,
        CNY: 5.2000,
        EUR: 0.6800,
        GBP: 0.6000,
        AUD: 1.0800,
        JPY: 88.0000
    },
    AUD: {
        AUD: 1.0000,
        USD: 0.7407,
        CNY: 4.8148,
        EUR: 0.6296,
        GBP: 0.5556,
        CAD: 0.9259,
        JPY: 81.4815
    },
    JPY: {
        JPY: 1.0000,
        USD: 0.0091,
        CNY: 0.0591,
        EUR: 0.0077,
        GBP: 0.0068,
        CAD: 0.0114,
        AUD: 0.0123
    }
};

/**
 * 默认汇率数据（根据基础货币动态生成）
 * 用于数据库初始化
 */
const DEFAULT_EXCHANGE_RATES = Object.entries(BASE_RATES[BASE_CURRENCY] || {}).map(([to_currency, rate]) => ({
    from_currency: BASE_CURRENCY,
    to_currency,
    rate
}));

/**
 * 验证货币代码是否受支持
 * @param {string} currencyCode - 货币代码
 * @returns {boolean} 是否受支持
 */
function isSupportedCurrency(currencyCode) {
    return SUPPORTED_CURRENCY_CODES.includes(currencyCode?.toUpperCase());
}

/**
 * 获取货币信息
 * @param {string} currencyCode - 货币代码
 * @returns {Object|null} 货币信息对象或null
 */
function getCurrencyInfo(currencyCode) {
    return SUPPORTED_CURRENCIES.find(currency => 
        currency.code === currencyCode?.toUpperCase()
    ) || null;
}

/**
 * 获取货币符号
 * @param {string} currencyCode - 货币代码
 * @returns {string} 货币符号
 */
function getCurrencySymbol(currencyCode) {
    const currency = getCurrencyInfo(currencyCode);
    return currency ? currency.symbol : currencyCode;
}

/**
 * 获取基础货币
 * @returns {string} 基础货币代码
 */
function getBaseCurrency() {
    return BASE_CURRENCY;
}

/**
 * 检查是否为基础货币
 * @param {string} currencyCode - 货币代码
 * @returns {boolean} 是否为基础货币
 */
function isBaseCurrency(currencyCode) {
    return currencyCode?.toUpperCase() === BASE_CURRENCY;
}

/**
 * 获取指定基础货币的汇率数据
 * @param {string} baseCurrency - 基础货币代码
 * @returns {Array} 汇率数组
 */
function getExchangeRatesForBase(baseCurrency = BASE_CURRENCY) {
    const rates = BASE_RATES[baseCurrency];
    if (!rates) {
        throw new Error(`No exchange rates found for base currency: ${baseCurrency}`);
    }

    return Object.entries(rates).map(([to_currency, rate]) => ({
        from_currency: baseCurrency,
        to_currency,
        rate
    }));
}

module.exports = {
    BASE_CURRENCY,
    SUPPORTED_CURRENCY_CODES,
    SUPPORTED_CURRENCIES,
    DEFAULT_EXCHANGE_RATES,
    BASE_RATES,
    isSupportedCurrency,
    getCurrencyInfo,
    getCurrencySymbol,
    getBaseCurrency,
    isBaseCurrency,
    getExchangeRatesForBase
};
