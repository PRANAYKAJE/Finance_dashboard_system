const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense'
    },
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

financialRecordSchema.index({ user: 1, date: -1 });
financialRecordSchema.index({ user: 1, category: 1 });
financialRecordSchema.index({ user: 1, type: 1 });
financialRecordSchema.index({ user: 1, isDeleted: 1 });

financialRecordSchema.pre('find', function() {
  const query = this.getQuery();
  if (!Object.prototype.hasOwnProperty.call(query, 'isDeleted')) {
    this.where({ isDeleted: false });
  }
});

financialRecordSchema.pre('findOne', function() {
  const query = this.getQuery();
  if (!Object.prototype.hasOwnProperty.call(query, 'isDeleted')) {
    this.where({ isDeleted: false });
  }
});

financialRecordSchema.pre('countDocuments', function() {
  const query = this.getQuery();
  if (!Object.prototype.hasOwnProperty.call(query, 'isDeleted')) {
    this.where({ isDeleted: false });
  }
});

financialRecordSchema.virtual('formattedAmount').get(function() {
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  return formatter.format(this.amount);
});

financialRecordSchema.set('toJSON', { virtuals: true });
financialRecordSchema.set('toObject', { virtuals: true });

financialRecordSchema.statics.getCategories = async function(userId) {
  return await this.distinct('category', { user: userId, isDeleted: false });
};

financialRecordSchema.statics.softDelete = async function(id, userId) {
  return this.findOneAndUpdate({ _id: id, user: userId }, { isDeleted: true }, { new: true });
};

const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema);

module.exports = FinancialRecord;
