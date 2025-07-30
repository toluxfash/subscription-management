// server/services/settingsService.js
const BaseRepository = require('../utils/BaseRepository');
const logger = require('../utils/logger');
const { SUPPORTED_CURRENCIES, isSupportedCurrency, getBaseCurrency } = require('../config/currencies');

class SettingsService extends BaseRepository {
    constructor(db) {
        super(db, 'settings');
    }

    // 获取应用设置
    async getSettings() {
        try {
            const settings = await this.findById(1);
            return settings || this._getDefaultSettings();
        } catch (error) {
            logger.error('Failed to get settings:', error.message);
            throw error;
        }
    }

    // 更新应用设置
    async updateSettings(updateData) {
        try {
            this._validateUpdateData(updateData);

            const updates = {};
            if (updateData.currency) updates.currency = updateData.currency;
            if (updateData.theme) updates.theme = updateData.theme;
            if (updateData.show_original_currency !== undefined)
                updates.show_original_currency = updateData.show_original_currency;

            if (Object.keys(updates).length === 0) {
                throw new Error('No update fields provided');
            }

            updates.updated_at = new Date();

            // Try update
            const result = await this.update(1, updates);

            if (result.affectedRows === 0) {
                // Record does not exist — insert instead
                const defaultSettings = this._getDefaultSettings();
                const createData = { ...defaultSettings, ...updates, id: 1 };
                return await this.create(createData);
            }

            return result;
        } catch (error) {
            logger.error('Failed to update settings:', error.message);
            throw error;
        }
    }

    // 重置设置为默认值
    async resetSettings() {
        try {
            await this.delete(1);

            const defaultSettings = this._getDefaultSettings();
            const result = await this.create({ ...defaultSettings, id: 1 });

            logger.info('Settings reset to default values');
            return result;
        } catch (error) {
            logger.error('Failed to reset settings:', error.message);
            throw error;
        }
    }

    validateCurrency(currency) {
        return isSupportedCurrency(currency);
    }

    validateTheme(theme) {
        const validThemes = ['light', 'dark', 'system'];
        return validThemes.includes(theme);
    }

    validateShowOriginalCurrency(showOriginalCurrency) {
        return typeof showOriginalCurrency === 'boolean' ||
               showOriginalCurrency === 0 ||
               showOriginalCurrency === 1;
    }

    _getDefaultSettings() {
        return {
            currency: getBaseCurrency(),
            theme: 'system',
            show_original_currency: 1,
            created_at: new Date(),
            updated_at: new Date()
        };
    }

    _validateUpdateData(updateData) {
        if (updateData.currency && !this.validateCurrency(updateData.currency)) {
            throw new Error(`Invalid currency: ${updateData.currency}`);
        }

        if (updateData.theme && !this.validateTheme(updateData.theme)) {
            throw new Error(`Invalid theme: ${updateData.theme}`);
        }

        if (updateData.show_original_currency !== undefined &&
            !this.validateShowOriginalCurrency(updateData.show_original_currency)) {
            throw new Error(`Invalid show_original_currency value: ${updateData.show_original_currency}`);
        }
    }

    getSupportedCurrencies() {
        return SUPPORTED_CURRENCIES;
    }

    getSupportedThemes() {
        return [
            { value: 'light', label: 'Light Theme', description: 'Light color scheme' },
            { value: 'dark', label: 'Dark Theme', description: 'Dark color scheme' },
            { value: 'system', label: 'System Default', description: 'Follow system preference' }
        ];
    }
}

module.exports = SettingsService;
