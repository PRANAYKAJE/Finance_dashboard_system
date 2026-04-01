const { FinancialRecord } = require('../models');

const isValidDate = (dateString) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes, description } = req.body;

    if (date && !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
        code: 'INVALID_DATE'
      });
    }

    const record = await FinancialRecord.create({
      user: req.userId,
      amount,
      type,
      category,
      date: date ? new Date(date) : new Date(),
      notes,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Financial record created successfully',
      data: { record }
    });
  } catch (error) {
    next(error);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = Math.min(limit, 100);
    const skip = (page - 1) * limit;

    if (req.query.startDate && !isValidDate(req.query.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date format',
        code: 'INVALID_DATE'
      });
    }

    if (req.query.endDate && !isValidDate(req.query.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end date format',
        code: 'INVALID_DATE'
      });
    }

    const filter = { user: req.userId, isDeleted: false };

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate);
      }
    }

    const validSortFields = ['date', 'amount', 'createdAt', 'type', 'category'];
    const sortBy = validSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'date';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const total = await FinancialRecord.countDocuments(filter);
    const records = await FinancialRecord.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findOne({
      _id: req.params.id,
      user: req.userId,
      isDeleted: false
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'RECORD_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: { record }
    });
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes, description } = req.body;

    if (date && !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
        code: 'INVALID_DATE'
      });
    }

    const record = await FinancialRecord.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'RECORD_NOT_FOUND'
      });
    }

    if (amount !== undefined) record.amount = amount;
    if (type) record.type = type;
    if (category) record.category = category;
    if (date) record.date = new Date(date);
    if (notes !== undefined) record.notes = notes;
    if (description !== undefined) record.description = description;

    await record.save();

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: { record }
    });
  } catch (error) {
    next(error);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'RECORD_NOT_FOUND'
      });
    }

    record.isDeleted = true;
    await record.save();

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await FinancialRecord.getCategories(req.userId);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

const searchRecords = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        code: 'SEARCH_QUERY_REQUIRED'
      });
    }

    limit = Math.min(limit, 100);

    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const filter = {
      user: req.userId,
      isDeleted: false,
      $or: [
        { notes: { $regex: escapedQuery, $options: 'i' } },
        { description: { $regex: escapedQuery, $options: 'i' } },
        { category: { $regex: escapedQuery, $options: 'i' } }
      ]
    };

    const total = await FinancialRecord.countDocuments(filter);
    const records = await FinancialRecord.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getCategories,
  searchRecords
};
