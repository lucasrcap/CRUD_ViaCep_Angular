const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const dbConfig = require('./dbConfig');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conexão SQL (usar pool para eficiência)
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Conectado ao SQL Server');
    return pool;
  })
  .catch(err => console.log('Erro de conexão com SQL Server:', err));

// GET /api/clientes - lista todos os clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Clientes');
    
    const clientesFormatados = result.recordset.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      sobrenome: cliente.sobrenome,
      email: cliente.email,
      telefone: cliente.telefone,
      dataNascimento: new Date(cliente.dataNascimento).toISOString().split('T')[0],
      endereco: {
        cep: cliente.cep,
        logradouro: cliente.logradouro,
        bairro: cliente.bairro,
        estado: cliente.estado,
        localidade: cliente.localidade,
        complemento: cliente.complemento
      }
    })); 
    res.json(clientesFormatados);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).send('Erro no servidor');
  }
});

// GET /api/clientes/:id - buscar cliente por id
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const id = parseInt(req.params.id);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Clientes WHERE id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const c = result.recordset[0];
    const cliente = {
      id: c.id,
      nome: c.nome,
      sobrenome: c.sobrenome,
      email: c.email,
      telefone: c.telefone,
      dataNascimento: new Date(c.dataNascimento).toISOString().split('T')[0],
      endereco: {
        cep: c.cep,
        logradouro: c.logradouro,
        bairro: c.bairro,
        estado: c.estado,
        localidade: c.localidade,
        complemento: c.complemento
      }
    };

    res.json(cliente);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).send('Erro no servidor');
  }
});

// POST /api/clientes - criar cliente (id é auto-gerado no banco)
app.post('/api/clientes', async (req, res) => {

  try {
    const pool = await poolPromise;
    const {
      nome,
      sobrenome,
      email,
      telefone,
      dataNascimento,
      endereco
    } = req.body;

    const parsedDate = new Date(dataNascimento); 

    const result = await pool.request()
      .input('nome', sql.NVarChar(100), nome)
      .input('sobrenome', sql.NVarChar(100), sobrenome)
      .input('email', sql.NVarChar(100), email)
      .input('telefone', sql.NVarChar(20), telefone)
      .input('dataNascimento', sql.Date, parsedDate) 
      .input('cep', sql.NVarChar(10), endereco.cep)
      .input('logradouro', sql.NVarChar(100), endereco.logradouro)
      .input('bairro', sql.NVarChar(100), endereco.bairro)
      .input('estado', sql.NVarChar(50), endereco.estado)
      .input('localidade', sql.NVarChar(100), endereco.localidade)
      .input('complemento', sql.NVarChar(100), endereco.complemento)
      .query(`INSERT INTO Clientes 
        (nome, sobrenome, email, telefone, dataNascimento, cep, logradouro, bairro, estado, localidade, complemento) 
        VALUES 
        (@nome, @sobrenome, @email, @telefone, @dataNascimento, @cep, @logradouro, @bairro, @estado, @localidade, @complemento);
        SELECT SCOPE_IDENTITY() AS id;`);  // Retorna o id gerado

    const insertedId = result.recordset[0].id;
    res.status(201).json({ message: 'Cliente criado', id: insertedId });
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    res.status(500).send('Erro no servidor');
  }
});

// PUT /api/clientes/:id - atualizar cliente
app.put('/api/clientes/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const id = parseInt(req.params.id);
    const {
      nome,
      sobrenome,
      email,
      telefone,
      dataNascimento,
      endereco,
    } = req.body;

    const parsedDate = new Date(dataNascimento); 

    // Primeiro verifica se cliente existe
    const clienteExiste = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT 1 FROM Clientes WHERE id = @id');

    if (clienteExiste.recordset.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('nome', sql.NVarChar(100), nome)
      .input('sobrenome', sql.NVarChar(100), sobrenome)
      .input('email', sql.NVarChar(100), email)
      .input('telefone', sql.NVarChar(20), telefone)
      .input('dataNascimento', sql.Date, parsedDate) 
      .input('cep', sql.NVarChar(10), endereco.cep)
      .input('logradouro', sql.NVarChar(100), endereco.logradouro)
      .input('bairro', sql.NVarChar(100), endereco.bairro)
      .input('estado', sql.NVarChar(50), endereco.estado)
      .input('localidade', sql.NVarChar(100), endereco.localidade)
      .input('complemento', sql.NVarChar(100), endereco.complemento)
      .query(`UPDATE Clientes SET
        nome = @nome,
        sobrenome = @sobrenome,
        email = @email,
        telefone = @telefone,
        dataNascimento = @dataNascimento,
        cep = @cep,
        logradouro = @logradouro,
        bairro = @bairro,
        estado = @estado,
        localidade = @localidade,
        complemento = @complemento
        WHERE id = @id`);

    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).send('Erro no servidor');
  }
});

// DELETE /api/clientes/:id - deletar cliente
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const id = parseInt(req.params.id);

    // Verifica se cliente existe
    const clienteExiste = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT 1 FROM Clientes WHERE id = @id');

    if (clienteExiste.recordset.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Clientes WHERE id = @id');

    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar cliente:', err);
    res.status(500).send('Erro no servidor');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
