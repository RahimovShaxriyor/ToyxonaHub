import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env.js';
import { setupSwagger } from './config/swagger.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { NotFoundError } from './shared/errors/index.js';

const app = express();

app.set('trust proxy', 1);

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", 'http:', 'https:'],
        upgradeInsecureRequests: null,
      },
    },
  })
);
app.use(
  cors({
    origin:
      env.FRONTEND_URL === '*'
        ? '*'
        : [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);

// Logging Middleware
if (env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

// Body Parsers with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded images
const uploadDir = path.resolve(env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadDir));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Swagger API Documentation
setupSwagger(app);

// Mount API v1 Routes
app.use('/api/v1', apiRouter);

// 404 Handler for undefined routes
app.use((req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
