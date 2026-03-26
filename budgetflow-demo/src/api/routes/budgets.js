import { Router } from 'express';

const router = Router();

let nextId = 4;
let budgets = [
  {
    id: 1,
    titre: 'Budget Informatique 2025',
    montant_alloue: 3000000,
    montant_consomme: 1200000,
    statut: 'APPROUVE',
    departement: 'INFO',
    date_creation: '2025-01-15',
  },
  {
    id: 2,
    titre: 'Budget RH Formation',
    montant_alloue: 2500000,
    montant_consomme: 0,
    statut: 'SOUMIS',
    departement: 'RH',
    date_creation: '2025-02-01',
  },
  {
    id: 3,
    titre: 'Budget Logistique Q2',
    montant_alloue: 2000000,
    montant_consomme: 500000,
    statut: 'BROUILLON',
    departement: 'LOG',
    date_creation: '2025-03-10',
  },
];

// GET /api/budgets
router.get('/', (req, res) => {
  res.json({ success: true, data: budgets });
});

// POST /api/budgets
router.post('/', (req, res) => {
  const { titre, montant_alloue, montant_consomme, statut, departement, date_creation } = req.body;

  if (!titre || montant_alloue === undefined) {
    return res.status(400).json({ success: false, message: 'Les champs titre et montant_alloue sont requis.' });
  }

  const nouveau = {
    id: nextId++,
    titre,
    montant_alloue,
    montant_consomme: montant_consomme ?? 0,
    statut: statut ?? 'BROUILLON',
    departement: departement ?? null,
    date_creation: date_creation ?? new Date().toISOString().split('T')[0],
  };

  budgets.push(nouveau);
  res.status(201).json({ success: true, data: nouveau });
});

// GET /api/budgets/:id
router.get('/:id', (req, res) => {
  const budget = budgets.find(b => b.id === parseInt(req.params.id));
  if (!budget) {
    return res.status(404).json({ success: false, message: 'Budget introuvable.' });
  }
  res.json({ success: true, data: budget });
});

// PUT /api/budgets/:id
router.put('/:id', (req, res) => {
  const index = budgets.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Budget introuvable.' });
  }

  budgets[index] = { ...budgets[index], ...req.body, id: budgets[index].id };
  res.json({ success: true, data: budgets[index] });
});

// DELETE /api/budgets/:id
router.delete('/:id', (req, res) => {
  const index = budgets.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Budget introuvable.' });
  }

  budgets.splice(index, 1);
  res.json({ success: true });
});

export default router;
