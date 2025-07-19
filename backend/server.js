// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import { fileURLToPath } from 'url';
// import path from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const PORT = process.env.PORT || 5000;
// const NODE_ENV = process.env.NODE_ENV || 'development';

// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//   res.json({ status: 'API is running' });
// });

// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// const server = app.listen(PORT, () => {
//   console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
// });

// process.on('unhandledRejection', (err) => {
//   console.error(`Error: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// export default app;


import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { PORT, NODE_ENV, CORS_ORIGIN, API_PREFIX } from './config/config.js';
import errorHandler from './middleware/errorMiddleware.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import gymRoutes from './routes/gyms.js';
import adminRoutes from './routes/admin.js';
import memberRoutes from './routes/members.js';
import classRoutes from './routes/classes.js';
import paymentRoutes from './routes/payments.js';
import attendanceRoutes from './routes/attendance.js';
import reportRoutes from './routes/reports.js';

export const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

connectDB();

app.use(helmet());

app.use(cors({
  origin: NODE_ENV === 'production' ? CORS_ORIGIN : true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: NODE_ENV
  };
  res.status(200).json(healthStatus);
});

app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV
  });
});

app.route('/')
  .get((req, res) => {
    res.json({
      status: 'success',
      message: 'Welcome to the Gym Management System API',
      documentation: `Use ${API_PREFIX}/... to access the API`,
      availableEndpoints: [
        `${API_PREFIX}/auth`,
        `${API_PREFIX}/users`,
        `${API_PREFIX}/gyms`,
        `${API_PREFIX}/members`,
        `${API_PREFIX}/classes`,
        `${API_PREFIX}/payments`,
        `${API_PREFIX}/attendance`,
        `${API_PREFIX}/reports`
      ]
    });
  })
  .post((req, res) => {
    res.status(400).json({
      status: 'error',
      message: 'Please use specific API endpoints',
      documentation: `Use ${API_PREFIX}/... to access the API`
    });
  })
  .put((req, res) => {
    res.status(400).json({
      status: 'error',
      message: 'Please use specific API endpoints',
      documentation: `Use ${API_PREFIX}/... to access the API`
    });
  });

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/gyms`, gymRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/members`, memberRoutes);
app.use(`${API_PREFIX}/classes`, classRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}${API_PREFIX}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

export default app;
