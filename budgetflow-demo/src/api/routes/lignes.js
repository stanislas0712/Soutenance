import { Router } from 'express';

const router = Router();

let nextId = 4;
let lignes = [
  {
    id: 1,
    budget_id: 1,
    designation: 'Achat serveurs',
    montant_prevu: 1500000,
    montant_reel: 1200000,
  },
  {
    id: 2,
    budget_id: 1,
    designation: 'Licences logicielles',
    montant_prevu: 800000,
    montant_reel: 0,
  },
  {
    id: 3,
    budget_id: 2,
    designation: 'Formation management',
    montant_prevu: 1200000,
    montant_reel: 0,
  },
];

// GET /api/lignes  ou  GET /api/lignes?budget_id=X
router.get('/', (req, res) => {
  const { budget_id } = req.query;
  if (budget_id !== undefined) {
    const filtered = lignes.filter(l => l.budget_id === parseInt(budget_id));
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: lignes });
});

// POST /api/lignes
router.post('/', (req, res) => {
  const { budget_id, designation, montant_prevu, montant_reel } = req.body;

  if (!budget_id || !designation || montant_prevu === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Les champs budget_id, designation et montant_prevu sont requis.',
    });
  }

  const nouvelle = {
    id: nextId++,
    budget_id: parseInt(budget_id),
    designation,
    montant_prevu,
    montant_reel: montant_reel ?? 0,
  };

  lignes.push(nouvelle);
  res.status(201).json({ success: true, data: nouvelle });
});

// GET /api/lignes/:id
router.get('/:id', (req, res) => {
  const ligne = lignes.find(l => l.id === parseInt(req.params.id));
  if (!ligne) {
    return res.status(404).json({ success: false, message: 'Ligne budgetaire introuvable.' });
  }
  res.json({ success: true, data: ligne });
});

// PUT /api/lignes/:id
router.put('/:id', (req, res) => {
  const index = lignes.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Ligne budgetaire introuvable.' });
  }

  lignes[index] = { ...lignes[index], ...req.body, id: lignes[index].id };
  res.json({ success: true, data: lignes[index] });
});

// DELETE /api/lignes/:id
router.delete('/:id', (req, res) => {
  const index = lignes.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Ligne budgetaire introuvable.' });
  }

  lignes.splice(index, 1);
  res.json({ success: true });
});

export default router;
