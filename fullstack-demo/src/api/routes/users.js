const express = require('express');
const router = express.Router();

let users = [
  { id: 1, name: 'Alice Martin', email: 'alice@example.com' },
  { id: 2, name: 'Bob Dupont', email: 'bob@example.com' },
  { id: 3, name: 'Claire Durand', email: 'claire@example.com' },
];
let nextId = 4;

// GET /api/users — list all users
router.get('/', (req, res) => {
  res.json({ success: true, data: users, message: 'Users retrieved successfully' });
});

// GET /api/users/:id — get one user
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, data: null, message: 'User not found' });
  }
  res.json({ success: true, data: user, message: 'User retrieved successfully' });
});

// POST /api/users — create user
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, data: null, message: 'Both name and email are required' });
  }
  const user = { id: nextId++, name, email };
  users.push(user);
  res.status(201).json({ success: true, data: user, message: 'User created successfully' });
});

// PUT /api/users/:id — update user
router.put('/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, data: null, message: 'User not found' });
  }
  const { name, email } = req.body;
  if (name) users[index].name = name;
  if (email) users[index].email = email;
  res.json({ success: true, data: users[index], message: 'User updated successfully' });
});

// DELETE /api/users/:id — delete user
router.delete('/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, data: null, message: 'User not found' });
  }
  const deleted = users.splice(index, 1)[0];
  res.json({ success: true, data: deleted, message: 'User deleted successfully' });
});

module.exports = router;
