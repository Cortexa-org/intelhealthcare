// Prototype only - no real PHI

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { initDatabase } from './database/connection.js';
import { setupRoutes } from './routes/index.js';
import { setupSocketHandlers } from './socket/handlers.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupCron } from './services/cronService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? false : true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(join(__dirname, 'uploads')));
app.use((req, res, next) => {
  req.io = io;
  next();
});

async function startServer() {
  try {
    await initDatabase();
    setupRoutes(app);
    setupSocketHandlers(io);
    setupCron();
    app.use(errorHandler);

    server.listen(PORT, () => {
      console.log(`Server on port ${PORT}`);
      console.log(`Prototype only - no real PHI`);
    });
  } catch (error) {
    console.error('Start failed:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

startServer();