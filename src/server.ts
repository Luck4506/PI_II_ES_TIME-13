//Importaçãoes de módulos necessários

import express, { Request, Response, NextFunction } from "express";
import { getDocenteByEmail } from "./db/login";
import { addInstituicao } from "./db/instituicao";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
import session from "express-session";
import 'express-session';
import { addDocente } from "./db/docentes";


declare module 'express-session' {
  interface SessionData {
    user?: { id: number; nome: string; };
  }
}



const app = express();
app.use(express.json());
const port = 3000;

app.use(session({
  secret: "bT8pG6k@3L#9vQz!sW4eH2xN1rJ0dYfC7tB", 
  resave: false, 
  saveUninitialized: false, 
  cookie: {
   maxAge: 1000 * 60 * 60 * 3, //3 Horas
  }
}));

app.use(bodyParser.json());



// liberar o cors para aceitar todas as origens.
app.use(cors())

app.use(express.static(path.join(__dirname, '../public')));

function verificarSessao(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    next(); 
  } else {
    res.redirect('/login'); // sem sessão, volta pro login
  }
}

// Rota principal: abre a página de login
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public', 'login', 'index.html'));
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

//Rota para verificar login (recebe email e senha e compara com o banco)
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

    const senhaBanco = String(docente.senha);
    const senhaUsuario = String(senha);

    // Compara as senhas
    if (senhaBanco === senhaUsuario) {
      //
      req.session.user = { id: docente.id, nome: docente.nome};
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

//Rota para página de dashboard (após login)
app.get('/dashboard', verificarSessao, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard', 'index.html'));
});

//Rota para inserir uma instituição
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

//rota para recuperar senha


//Rota para sair (logout)
app.get('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});


// New route to expose session data
app.get('/api/session', (req: Request, res: Response) => {
  if (req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.status(401).json({ error: 'Não autenticado' });
});



// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
