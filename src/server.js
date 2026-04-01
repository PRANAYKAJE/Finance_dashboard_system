const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const config = require('./config/config');
const connectDB = require('./config/database');
const { standardLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/validation');
const {
  authRoutes,
  userRoutes,
  recordRoutes,
  dashboardRoutes
} = require('./routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/', standardLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
