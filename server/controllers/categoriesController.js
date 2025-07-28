const BaseRepository = require('../utils/BaseRepository');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleQueryResult, handleDbResult, validationError } = require('../utils/responseHelper');
const { createValidator } = require('../utils/validator');

class CategoriesController {
    constructor(db) {
        this.categoriesRepo = new BaseRepository(db, 'categories');
    }

    /**
     * 获取所有分类
     */
    getAllCategories = asyncHandler(async (req, res) => {
        const categories = this.categoriesRepo.findAll({ orderBy: 'label ASC' });
        handleQueryResult(res, categories, 'Categories');
    });

    /**
     * 创建新分类
     */
    createCategory = asyncHandler(async (req, res) => {
        const { value, label } = req.body;

        // 验证数据
        const validator = createValidator();
        validator
            .required(value, 'value')
            .string(value, 'value')
            .length(value, 'value', 1, 50)
            .required(label, 'label')
            .string(label, 'label')
            .length(label, 'label', 1, 100);

        if (validator.hasErrors()) {
            return validationError(res, validator.getErrors());
        }

        // 检查是否已存在
        if (this.categoriesRepo.exists({ value })) {
            return validationError(res, 'Category with this value already exists');
        }

        const result = this.categoriesRepo.create({ value, label });
        handleDbResult(res, result, 'create', 'Category');
    });

    /**
     * 更新分类
     */
    updateCategory = asyncHandler(async (req, res) => {
        const { value } = req.params;
        const { label } = req.body;

        // 验证数据
        const validator = createValidator();
        validator
            .required(label, 'label')
            .string(label, 'label')
            .length(label, 'label', 1, 100);

        if (validator.hasErrors()) {
            return validationError(res, validator.getErrors());
        }

        const result = this.categoriesRepo.updateWhere({ value }, { label });
        handleDbResult(res, result, 'update', 'Category');
    });

    /**
     * 删除分类
     */
    deleteCategory = asyncHandler(async (req, res) => {
        const { value } = req.params;
        const result = this.categoriesRepo.deleteWhere({ value });
        handleDbResult(res, result, 'delete', 'Category');
    });
}

module.exports = CategoriesController;
