import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import logger from 'morgan';
import path from 'path';

import { corsExceptionMiddleware, corsMiddleware } from './middleware/corsMiddleware';
import { exceptionMiddleware } from './middleware/exceptionMiddleware';
import { globalRateLimiter } from './middleware/rateLimiter';
import APIRouter from './routes/api.routes';
import { root_path } from './utils/path/getLocalPath';

const app = express();

/* --------------------------------------------
 * CORS NORMAL + PREFLIGHT
 * -------------------------------------------- */
app.use(corsMiddleware);
app.options('*', corsMiddleware);

/* --------------------------------------------
 * SECURITY & PERFORMANCE
 * -------------------------------------------- */
app.disable('x-powered-by')
app.use(helmet());
app.use(compression());

/* --------------------------------------------
 * GLOBAL RATE LIMIT
 * -------------------------------------------- */
app.use(globalRateLimiter);

/* --------------------------------------------
 * LOGGING
 * -------------------------------------------- */
app.use(logger('dev'));

/* --------------------------------------------
 * BODY PARSERS
 * -------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* --------------------------------------------
 * STATIC FILES
 * -------------------------------------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* --------------------------------------------
 * VIEW ENGINE
 * -------------------------------------------- */
app.set('views', root_path('src/views'));
app.set('view engine', 'ejs');

/* --------------------------------------------
 * BASIC HEALTH CHECK
 * -------------------------------------------- */
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    developer: 'Fahim',
    project: `😎Express JS template with TS`,
    github: 'https://github.com/fhmonly'
  });
});

/* --------------------------------------------
 * API ROUTES
 * -------------------------------------------- */
app.use('/api', APIRouter);

/* --------------------------------------------
 * CORS ERROR HANDLER
 *    (HARUS DI BAWAH ROUTE)
 * -------------------------------------------- */
app.use(corsExceptionMiddleware);

/* --------------------------------------------
 * GLOBAL ERROR HANDLER (PALING AKHIR)
 * -------------------------------------------- */
app.use(exceptionMiddleware);

export default app;
