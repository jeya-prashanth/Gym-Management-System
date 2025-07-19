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
