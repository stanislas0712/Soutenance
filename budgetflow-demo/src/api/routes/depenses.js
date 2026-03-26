import { Router } from 'express';

const router = Router();

let nextId = 4;
let depenses = [
  {
    id: 1,
    budget_id: 1,
    description: 'Achat Dell PowerEdge R750',
    montant: 800000,
    date: '2025-02-10',
    justificatif: 'facture_dell_001.pdf',
  },
  {
    id: 2,
    budget_id: 1,
    description: 'Câblage réseau salle serveur',
    montant: 400000,
    date: '2025-02-20',
    justificatif: null,
  },
  {
    id: 3,
    budget_id: 3,
    description: 'Location entrepôt temporaire Q2',
    montant: 500000,
    date: '2025-03-12',
    justificatif: 'contrat_location_q2.pdf',
  },
];

// GET /api/depenses  ou  GET /api/depenses?budget_id=X
router.get('/', (req, res) => {
  const { budget_id } = req.query;
  if (budget_id !== undefined) {
    const filtered = depenses.filter(d => d.budget_id === parseInt(budget_id));
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: depenses });
});

// POST /api/depenses
router.post('/', (req, res) => {
  const { budget_id, description, montant, date, justificatif } = req.body;

  if (!budget_id || !description || montant === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Les champs budget_id, description et montant sont requis.',
    });
  }

  const nouvelle = {
    id: nextId++,
    budget_id: parseInt(budget_id),
    description,
    montant,
    date: date ?? new Date().toISOString().split('T')[0],
    justificatif: justificatif ?? null,
  };

  depenses.push(nouvelle);
  res.status(201).json({ success: true, data: nouvelle });
});

// GET /api/depenses/:id
router.get('/:id', (req, res) => {
  const depense = depenses.find(d => d.id === parseInt(req.params.id));
  if (!depense) {
    return res.status(404).json({ success: false, message: 'Depense introuvable.' });
  }
  res.json({ success: true, data: depense });
});

// PUT /api/depenses/:id
router.put('/:id', (req, res) => {
  const index = depenses.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Depense introuvable.' });
  }

  depenses[index] = { ...depenses[index], ...req.body, id: depenses[index].id };
  res.json({ success: true, data: depenses[index] });
});

// DELETE /api/depenses/:id
router.delete('/:id', (req, res) => {
  const index = depenses.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Depense introuvable.' });
  }

  depenses.splice(index, 1);
  res.json({ success: true });
});

export default router;
