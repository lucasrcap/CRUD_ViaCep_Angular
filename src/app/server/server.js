const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const CLIENTES_FILE_PATH = path.resolve(__dirname, 'clientes.json');

app.use(cors());
app.use(express.json());

const getClientesFromFile = () => {
  if (fs.existsSync(CLIENTES_FILE_PATH)) {
    const fileData = fs.readFileSync(CLIENTES_FILE_PATH, 'utf-8');
    return JSON.parse(fileData);
  }
  return [];
};

const saveClientesToFile = (clientes) => {
  fs.writeFileSync(CLIENTES_FILE_PATH, JSON.stringify(clientes, null, 2), 'utf-8');
};

// ✅ GET /api/clientes
app.get('/api/clientes', (req, res) => {
  const clientes = getClientesFromFile();
  res.json(clientes);
});

// ✅ PUT /api/clientes/:id
app.put('/api/clientes/:id', (req, res) => {
  const clientes = getClientesFromFile();
  const id = parseInt(req.params.id);
  const dadosAtualizados = req.body;

  const clienteIndex = clientes.findIndex(cliente => cliente.id === id);

  if (clienteIndex === -1) {
    return res.status(404).json({ message: 'Cliente não encontrado' });
  }

  clientes[clienteIndex] = { ...clientes[clienteIndex], ...dadosAtualizados, id };

  saveClientesToFile(clientes);

  return res.json(clientes[clienteIndex]);
});

// ✅ POST /api/clientes
app.post('/api/clientes', (req, res) => {
  const clientes = getClientesFromFile();
  const newCliente = req.body;

  const novoId = clientes.length === 0 ? 1 : Math.max(...clientes.map(c => c.id)) + 1;
  newCliente.id = novoId;

  clientes.push(newCliente);
  saveClientesToFile(clientes);

  res.status(201).json(newCliente);
});

// ✅ DELETE /api/clientes/:id
app.delete('/api/clientes/:id', (req, res) => {
  const clientes = getClientesFromFile();
  const id = parseInt(req.params.id);
  console.log('Tentando excluir cliente com ID:', id);

  const clienteIndex = clientes.findIndex(cliente => cliente.id === id);

  if (clienteIndex === -1) {
    return res.status(404).json({ message: 'Cliente não encontrado' });
  }

  clientes.splice(clienteIndex, 1);
  saveClientesToFile(clientes);

  return res.json({ message: 'Cliente excluído com sucesso' });
});



app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
