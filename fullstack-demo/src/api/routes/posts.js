const express = require('express');
const router = express.Router();

let posts = [
  { id: 1, title: 'Introduction au budget', content: 'Gérer son budget est essentiel pour une bonne santé financière.', userId: 1 },
  { id: 2, title: 'Astuces d\'épargne', content: 'Voici quelques conseils pour économiser au quotidien.', userId: 2 },
  { id: 3, title: 'Suivi des dépenses', content: 'Tenir un journal de dépenses permet de mieux contrôler ses finances.', userId: 1 },
];
let nextId = 4;

// GET /api/posts — list all posts, optional ?userId= filter
router.get('/', (req, res) => {
  let result = posts;
  if (req.query.userId) {
    const uid = parseInt(req.query.userId);
    result = posts.filter(p => p.userId === uid);
  }
  res.json({ success: true, data: result, message: 'Posts retrieved successfully' });
});

// GET /api/posts/:id — get one post
router.get('/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ success: false, data: null, message: 'Post not found' });
  }
  res.json({ success: true, data: post, message: 'Post retrieved successfully' });
});

// POST /api/posts — create post
router.post('/', (req, res) => {
  const { title, content, userId } = req.body;
  if (!title || !content || userId === undefined) {
    return res.status(400).json({ success: false, data: null, message: 'title, content, and userId are all required' });
  }
  const post = { id: nextId++, title, content, userId: parseInt(userId) };
  posts.push(post);
  res.status(201).json({ success: true, data: post, message: 'Post created successfully' });
});

// PUT /api/posts/:id — update post
router.put('/:id', (req, res) => {
  const index = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, data: null, message: 'Post not found' });
  }
  const { title, content } = req.body;
  if (title) posts[index].title = title;
  if (content) posts[index].content = content;
  res.json({ success: true, data: posts[index], message: 'Post updated successfully' });
});

// DELETE /api/posts/:id — delete post
router.delete('/:id', (req, res) => {
  const index = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, data: null, message: 'Post not found' });
  }
  const deleted = posts.splice(index, 1)[0];
  res.json({ success: true, data: deleted, message: 'Post deleted successfully' });
});

module.exports = router;
