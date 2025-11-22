dotenv.config();
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import BookRoutes from './src/Routes/BookRoutes.js';
import FavoritesRoutes from './src/Routes/FavoritesRoutes.js';
import UserRoutes from './src/Routes/UserRoutes.js';
import PreorderRoutes from './src/Routes/PreorderRoutes.js';
import { connectDB } from './src/Config/db.js';
// Middlewares and configurations
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

// Quick health check
app.get('/health', (_req, res) => res.json({ success: true }));
app.get('/api/health', (_req, res) => res.json({ success: true }));

/////////////////////// Routes Start //////////////////////////////////
app.use('/api/books', BookRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/favorites', FavoritesRoutes);
app.use('/api/preorders', PreorderRoutes);
/////////////////////// Routes End //////////////////////////////////

/////////////////////// ConnectDB Start //////////////////////////////////
connectDB();
/////////////////////// ConnectDB End //////////////////////////////////

app.get('/', (req, res) => {
  res.send('Welcome to the Book Trading Club server!');
});

export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}
