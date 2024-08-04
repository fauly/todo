const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = 3002;

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'kanban',
  password: 'N4bnak531!',
  database: 'kanbans'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Get tasks
app.get('/tasks', (req, res) => {
  const query = 'SELECT * FROM tasks';
  db.query(query, (err, results) => {
    if (err) throw err;
    const tasks = { todo: [], 'in-progress': [], done: [] };
    results.forEach(row => {
      tasks[row.status].push(row.task);
    });
    res.json(tasks);
  });
});

// Add task
app.post('/tasks', (req, res) => {
  const { column, task } = req.body;
  const query = 'INSERT INTO tasks (task, status) VALUES (?, ?)';
  db.query(query, [task, column], (err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

// Update tasks
app.put('/tasks', (req, res) => {
  const { column, tasks } = req.body;
  const deleteQuery = 'DELETE FROM tasks WHERE status = ?';
  db.query(deleteQuery, [column], (err) => {
    if (err) throw err;
    const insertQuery = 'INSERT INTO tasks (task, status) VALUES ?';
    const values = tasks.map(task => [task, column]);
    db.query(insertQuery, [values], (err) => {
      if (err) throw err;
      res.sendStatus(200);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
