require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const tailorRoutes = require('./routes/tailor');
const historyRoutes = require('./routes/history');
const exportRoutes = require('./routes/export');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/tailor', tailorRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/export', exportRoutes);

// Central error handler (multer errors, uncaught throws in routes, etc.)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Resume Tailor API listening on http://localhost:${PORT}`);
});
