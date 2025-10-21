import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";

import {
  addDocente
} from "./db/docentes";


const app = express();
app.use(express.json());
const port = 3000;

app.use(bodyParser.json());

// liberar o cors para aceitar todas as origens.
app.use(cors())

app.use(express.static(path.join(__dirname, "public")));

// Rota principal: abre a página de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login', 'index.html'));
});

//Rota para inserir um docente
app.post("/cadastrar", async (req: Request, res: Response) => {

  try {
    const {nome, email, telefone, senha } = req.body;
    if (!nome || !email || !telefone || !senha) {
      return res.status(400).json({ error: "Campos nome, email, telefone e senha obrigatórios." });
    }

    const id = await addDocente(nome, email, telefone, senha);
    res.status(201).json({ message: "Docente adicionado com sucesso", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao inserir Docente." });
  }
});

//Rota para verificar login
import { getDocenteByEmail } from "./db/login";

// Rota de login: recebe email e senha e compara com o banco
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ autenticado: false, erro: 'Email e senha são obrigatórios.' });
    }

    const docente = await getDocenteByEmail(email);

    if (!docente) {
      // Não encontrou o email informado
      return res.status(401).json({ autenticado: false });
    }

    // Pega a senha salva no banco para o email informado
    const senhaBanco = String(docente.senha);
    const senhaUsuario = String(senha);

    // Compara as senhas
    if (senhaBanco === senhaUsuario) {
      return res.json({ autenticado: true });
    } 

    else {
      return res.json({ autenticado: false });
    }
  } catch (error) {
    console.error('Erro no /login:', error);
    return res.status(500).json({ autenticado: false, erro: 'Erro interno.' });
  }
});

//Rota para inserir uma instituição
import { addInstituicao } from "./db/instituicao";

app.post("/cadastrarInstituicao", async (req: Request, res: Response) => {
  try {
    const { nome, sigla } = req.body;

    if (!nome || !sigla) {
      return res.status(400).json({ error: "Campos 'nome' e 'sigla' são obrigatórios." });
    }

    const id = await addInstituicao(nome, sigla);
    return res.status(201).json({ message: "Instituição adicionada com sucesso", id });
  } catch (error) {
    console.error("Erro ao inserir Instituição:", error);
    return res.status(500).json({ error: "Erro ao inserir Instituição." });
  }
});





app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});