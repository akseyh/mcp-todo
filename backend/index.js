const express = require("express");
const app = express();
const port = 3000;

// JSON body parser middleware
app.use(express.json());

// In-memory todos array
const todos = [];

// GET - Tüm todoları listele
app.get("/todos", (req, res) => {
  res.json(todos);
});

// POST - Yeni todo oluştur
app.post("/todos", (req, res) => {
  const { title } = req.body;
  console.log(title);

  if (!title) {
    return res.status(400).json({ error: "Title alanı zorunludur" });
  }

  const newTodo = {
    id: todos.length + 1,
    title,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT - Todo güncelle
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title alanı zorunludur" });
  }

  const todoIndex = todos.findIndex((todo) => todo.id === parseInt(id));

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo bulunamadı" });
  }

  todos[todoIndex].title = title;
  res.json(todos[todoIndex]);
});

app.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor`);
});
