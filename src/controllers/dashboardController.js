const { FinancialRecord } = require('../models');

const isValidDate = (dateString) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date format',
        code: 'INVALID_DATE'
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end date format',
        code: 'INVALID_DATE'
      });
    }

    const matchStage = { user: req.userId, isDeleted: false };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) {
        matchStage.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.date.$lte = new Date(endDate);
      }
    }

    const summary = await FinancialRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: { $round: ['$totalIncome', 2] },
          totalExpenses: { $round: ['$totalExpenses', 2] },
          netBalance: { $round: [{ $subtract: ['$totalIncome', '$totalExpenses'] }, 2] },
          transactionCount: '$transactionCount'
        }
      }
    ]);

    const result = summary[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      transactionCount: 0
    };

    res.json({
      success: true,
      data: { summary: result }
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryTotals = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date format',
        code: 'INVALID_DATE'
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end date format',
        code: 'INVALID_DATE'
      });
    }

    const matchStage = { user: req.userId, isDeleted: false };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) {
        matchStage.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.date.$lte = new Date(endDate);
      }
    }

    const categoryTotals = await FinancialRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            category: '$category',
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
            }
          },
          count: { $sum: '$count' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          income: { $round: ['$income', 2] },
          expense: { $round: ['$expense', 2] },
          net: { $round: [{ $subtract: ['$income', '$expense'] }, 2] },
          transactionCount: '$count'
        }
      },
      { $sort: { category: 1 } }
    ]);

    res.json({
      success: true,
      data: { categoryTotals }
    });
  } catch (error) {
    next(error);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cappedLimit = Math.min(limit, 50);

    const recentRecords = await FinancialRecord.find({ user: req.userId, isDeleted: false })
      .sort({ date: -1, createdAt: -1 })
      .limit(cappedLimit)
      .select('amount type category date notes description createdAt');

    res.json({
      success: true,
      data: { recentActivity: recentRecords }
    });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date format',
        code: 'INVALID_DATE'
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end date format',
        code: 'INVALID_DATE'
      });
    }

    let dateFormat;
    switch (groupBy) {
    case 'day':
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
      break;
    case 'week':
      dateFormat = {
        $dateToString: {
          format: '%Y-W%V',
          date: '$date'
        }
      };
      break;
    case 'year':
      dateFormat = { $dateToString: { format: '%Y', date: '$date' } };
      break;
    case 'month':
    default:
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
    }

    const matchStage = { user: req.userId, isDeleted: false };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) {
        matchStage.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.date.$lte = new Date(endDate);
      }
    }

    const trends = await FinancialRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            period: dateFormat,
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.period',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
            }
          },
          transactionCount: { $sum: '$count' }
        }
      },
      {
        $project: {
          _id: 0,
          period: '$_id',
          income: { $round: ['$income', 2] },
          expense: { $round: ['$expense', 2] },
          net: { $round: [{ $subtract: ['$income', '$expense'] }, 2] },
          transactionCount: 1
        }
      },
      { $sort: { period: 1 } }
    ]);

    res.json({
      success: true,
      data: { trends, groupBy }
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlyStats = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59);

    const monthlyStats = await FinancialRecord.aggregate([
      {
        $match: {
          user: req.userId,
          isDeleted: false,
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          income: { $round: ['$income', 2] },
          expense: { $round: ['$expense', 2] },
          net: { $round: [{ $subtract: ['$income', '$expense'] }, 2] },
          transactionCount: '$count'
        }
      },
      { $sort: { month: 1 } }
    ]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formattedStats = monthlyStats.map(stat => ({
      ...stat,
      monthName: monthNames[stat.month - 1]
    }));

    res.json({
      success: true,
      data: {
        year: currentDate.getFullYear(),
        monthlyStats: formattedStats
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardData = async (req, res, next) => {
  try {
    const [summary, categoryTotals, recentActivity] = await Promise.all([
      FinancialRecord.aggregate([
        { $match: { user: req.userId, isDeleted: false } },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
            },
            totalExpenses: {
              $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
            },
            transactionCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            totalIncome: { $round: ['$totalIncome', 2] },
            totalExpenses: { $round: ['$totalExpenses', 2] },
            netBalance: { $round: [{ $subtract: ['$totalIncome', '$totalExpenses'] }, 2] },
            transactionCount: '$transactionCount'
          }
        }
      ]),
      FinancialRecord.aggregate([
        { $match: { user: req.userId, isDeleted: false } },
        {
          $group: {
            _id: '$category',
            total: {
              $sum: {
                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            category: '$_id',
            amount: { $round: ['$total', 2] },
            count: 1
          }
        }
      ]),
      FinancialRecord.find({ user: req.userId, isDeleted: false })
        .sort({ date: -1 })
        .limit(5)
        .select('amount type category date')
    ]);

    const result = summary[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      transactionCount: 0
    };

    res.json({
      success: true,
      data: {
        summary: result,
        topCategories: categoryTotals,
        recentTransactions: recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getTrends,
  getMonthlyStats,
  getDashboardData
};
