const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
require('dotenv').config();


app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/css', express.static(path.join(__dirname, 'css')));


// Manipular dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Conexão com MySQL (NÃO ESQUECER DE COLOCAR AS CREDENCIAIS NO ARQUIVO .ENV)
const conexao = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'notadez',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
});

//Teste de conexão
conexao.connect(function (erro) {
  if (erro) {
    throw erro;
  }
  
  else {
    console.log('Conexão efetuada com sucesso!');
  }
});


// Rota principal: abre a página de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login', 'index.html'));
});

// Rota para cadastrar professor
app.post('/cadastrar', function(req, res) {
  const { nome, email, telefone, senha } = req.body;

  // Posteriormente, adicionar criptografia
  const sql = `
  INSERT INTO professor (nome, email, telefone, senha_hash) VALUES (?, ?, ?, ?)`;

  const dados = [nome, email, telefone, senha];


  conexao.execute(sql, dados, (erro, retorno) => {
    if (erro) {
      if (erro.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'E-mail já cadastrado.' });
      }
      console.error('Erro ao inserir professor:', erro);
      return res.status(500).json({ message: 'Erro ao cadastrar professor.' });
    }
    return res.status(201).json({ message: 'Professor cadastrado com sucesso!', id: retorno.insertId });
  });
});

app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página de cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro', 'index.html'));
});

//rota verificar instituicao. !!feita para entender como funciona!!
app.post('/verificar', async (req, res) => {
  const { campo, valor } = req.body;
  let tabela, coluna;

  // Define qual tabela e coluna usar
  if (campo === 'instituicao') {
    tabela = 'instituicao';
    coluna = 'nome';
  } else if (campo === 'curso') {
    tabela = 'curso';
    coluna = 'nome';
  }

  try {
    // Cria a query com bind variable (Oracle usa :valor)
    const sql = `SELECT * FROM ${tabela} WHERE ${coluna} = :valor`;

    // Executa e retorna resultados como objetos (não arrays)
    const result = await conexao.execute(sql, [valor], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    // Verifica se encontrou linhas
    if (result.rows.length > 0) {
      res.json({ existe: true });
    } else {
      res.json({ existe: false });
    }

  }catch (erro) {
    console.error('Erro ao verificar:', erro);
    res.status(500).json({ erro: 'Erro ao acessar o banco de dados' });
  }
});
//rota para cadastrar !!feita para aprender como funciona!!
app.post("/adicionar", async (req, res) => {
  const { instituicao, curso } = req.body;

  try {
    // Inserir instituição
    await conexao.execute(
      `INSERT INTO instituicao (nome) VALUES (:nome)`,
      [instituicao],
      { autoCommit: true }
    );

    // Inserir curso
    await conexao.execute(
      `INSERT INTO curso (nome) VALUES (:nome)`,
      [curso],
      { autoCommit: true }
    );

    // Retorna sucesso para o front-end
    res.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro ao adicionar:", erro);
    res.status(500).json({ sucesso: false, erro: "Erro ao inserir no banco" });
  }
});
// Servidor
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});