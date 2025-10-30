//Importaçãoes de módulos necessários

import express, { Request, Response, NextFunction } from "express";
import { getDocenteByEmail } from "./db/login";
import { verifyByNameESigla, registrarInstituicao, listarInstituicao, verifyByName, atualizarInstituicao, apagarInstituicao} from "./db/instituicao";
import { verificarCursoInstituica,cadastrarCurso } from "./db/curso";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
import session from "express-session";
import 'express-session';
import { addDocente } from "./db/docentes";
import { enviarEmail } from "./services/servico_email";
import { criarTokenRecuperacao } from "./db/recuperar_senha";


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

//rota para recuperar senha
app.post('/recuperar-senha', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ sucesso: false, erro: "Email é obrigatório." });
    }

    const tokenRecuperacao = await criarTokenRecuperacao();
    const linkRecuperacao = `http://localhost:3000/mudar_senha?token=${tokenRecuperacao}`;

    const enviado = await enviarEmail(
      email,
      "Teste de Envio de Email",
      `<p>O link de recuperação da sua senha é ${linkRecuperacao}</p>`
    );

    if (enviado) {
      return res.json({ message: "Email de teste enviado com sucesso!" });
    }
    else {
      return res.status(500).json({ error: "Falha ao enviar email de teste." });
    }
  } catch (error) {
    console.error("Erro no envio de email de teste:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

//rota para página de mudar senha
app.get('/mudar_senha', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public', 'mudar_senha', 'index.html'));
});

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


//rota para verificar se a instituicao existe
app.post('/instituicao/verificar', async (req, res) => {
    const { nome, sigla } = req.body;

    try {
        const instituicao = await verifyByNameESigla(nome, sigla);
        if (instituicao) {
            // existe no DB
            return res.json(instituicao); // pode retornar o objeto
        } else {
            // não existe
            return res.json(null);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
app.post('/instituicao/cadastrar', async (req, res) => {
  const { nome, sigla, docente_id } = req.body;
  console.log('Dados recebidos:', req.body);

  // Verifica se todos os campos obrigatórios vieram
  if (!nome || !sigla || !docente_id) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }

  try {
    const sucesso = await registrarInstituicao(nome, sigla, docente_id);
    if (sucesso) {
      return res.json({ message: 'Instituição cadastrada com sucesso' });
    } else {
      return res.status(500).json({ error: 'Não foi possível cadastrar a instituição' });
    }
  } catch (erro) {
    console.error('Erro ao cadastrar no DB:', erro);
    return res.status(501).json({ error: 'Erro no cadastro' });
  }
});
app.get("/instituicao/listar", async (req, res) => {
  try {
    const dados = await listarInstituicao();
    res.json(dados);
  } catch (err) {
    console.error("Erro ao buscar instituições:", err);
    res.status(500).send("Erro ao buscar instituições");
  }
});
app.post('/instituicao/atualizar/verificar', async (req, res) => {
    const { nome,sigla } = req.body;

    try {
        const instituicao = await verifyByName(nome);
        if (instituicao) {
              return res.json(instituicao);
             // pode retornar o objeto
        } else {
            // não existe
            return res.json(null);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
app.post('/instituicao/atualizar', async (req, res) => {
    const { nome,sigla } = req.body;

    try {
        const atualizado = await atualizarInstituicao(nome,sigla);
        if (atualizado) {
              return res.json(atualizado);
             // pode retornar o objeto
        } else {
            // não existe
            return res.json(null);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});

app.post('/instituicao/apagar', async (req, res) => {
    const { nome,sigla } = req.body;

    try {
        const apagado = await apagarInstituicao(nome,sigla);
        if (apagado) {
              return res.json(apagado);
             // pode retornar o objeto
        } else {
            // não existe
            return res.json(null);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
app.post('/curso/verifyInstituicao', async (req, res) => {
    const { instituicao_id} = req.body;

    try {
        const existeInst = await verificarCursoInstituica(instituicao_id);
        if (existeInst) {
              return res.json(existeInst);
             // pode retornar o objeto
        } else {
            // não existe
            return res.json(null);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
app.post('/curso/cadastrar', async (req, res) => {
  const { instituicao_id,nome } = req.body;
  console.log('Dados recebidos:', req.body);

  // Verifica se todos os campos obrigatórios vieram
  if (!instituicao_id || !nome) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }

  try {
    const sucesso = await cadastrarCurso(instituicao_id,nome);
    if (sucesso) {
      return res.json({ message: 'Curso cadastrado com sucesso' });
    } else {
      return res.status(500).json({ error: 'Não foi possível cadastrar o curso' });
    }
  } catch (erro) {
    console.error('Erro ao cadastrar no DB:', erro);
    return res.status(501).json({ error: 'Curso duplicado!' });
  }
});
// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
