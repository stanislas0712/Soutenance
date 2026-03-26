import express from 'express';
import cors from 'cors';
import budgetsRouter from './routes/budgets.js';
import lignesRouter from './routes/lignes.js';
import depensesRouter from './routes/depenses.js';

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Route health
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ok' });
});

// Routeurs
app.use('/api/budgets', budgetsRouter);
app.use('/api/lignes', lignesRouter);
app.use('/api/depenses', depensesRouter);

// Middleware global d'erreur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
});

app.listen(PORT, () => {
  console.log(`BudgetFlow API running on http://localhost:${PORT}`);
});
