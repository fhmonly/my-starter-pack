import dotenv from 'dotenv';
dotenv.config();

import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import logger from 'morgan';
import path from 'path';

import { corsExceptionMiddleware, corsMiddleware } from './middleware/corsMiddleware';
import { exceptionMiddleware } from './middleware/exceptionMiddleware';
import APIRouter from './routes/api.routes';
import { root_path } from './utils/path/getLocalPath';

const app = express();

/* --------------------------------------------
 * 1️⃣  CORS NORMAL + PREFLIGHT
 * -------------------------------------------- */
app.use(corsMiddleware);
app.options('*', corsMiddleware);

/* --------------------------------------------
 * 2️⃣  SECURITY & PERFORMANCE
 * -------------------------------------------- */
app.use(helmet());
app.use(compression());

/* --------------------------------------------
 * 3️⃣  LOGGING
 * -------------------------------------------- */
app.use(logger('dev'));

/* --------------------------------------------
 * 4️⃣  BODY PARSERS
 * -------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* --------------------------------------------
 * 5️⃣  STATIC FILES
 * -------------------------------------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* --------------------------------------------
 * 6️⃣  VIEW ENGINE
 * -------------------------------------------- */
app.set('views', root_path('src/views'));
app.set('view engine', 'ejs');

/* --------------------------------------------
 * 7️⃣  BASIC HEALTH CHECK
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
 * 8️⃣  API ROUTES
 * -------------------------------------------- */
app.use('/api', APIRouter);

/* --------------------------------------------
 * 9️⃣  CORS ERROR HANDLER
 *    (HARUS DI BAWAH ROUTE)
 * -------------------------------------------- */
app.use(corsExceptionMiddleware);

/* --------------------------------------------
 * 🔟  GLOBAL ERROR HANDLER (PALING AKHIR)
 * -------------------------------------------- */
app.use(exceptionMiddleware);

export default app;
