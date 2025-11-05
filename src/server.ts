//Importaçãoes de módulos necessários

import express, { Request, Response, NextFunction } from "express";
import { getDocenteByEmail } from "./db/login";
import { verifyByNameESigla, registrarInstituicao, listarInstituicao, verifyByName, atualizarInstituicao, apagarInstituicao,pegarIdPorNome,existeDocente,existeCurso} from "./db/instituicao";
import { verificarCursoInstituica,cadastrarCurso,verificarCurso,listarCurso,atualizarCurso,apagarCursoComando,pegarIdCurso,pegarDisciplinaPorId } from "./db/curso";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
import session from "express-session";
import 'express-session';
import { addDocente } from "./db/docentes";
import { enviarEmail } from "./services/servico_email";
import { criarTokenRecuperacao } from "./db/recuperar_senha";
import { addDisciplina, deleteDisciplinaById, getAllDisciplinas } from "./db/disciplina";
import { addTurma, getAllTurmasPerDocente, getTurmaById, deleteTurmaById } from "./db/turma";

declare module 'express-session' {
  interface SessionData {
    user?: { id: number; nome: string; };
  }
}


const app = express();
app.use(express.json());
const port = 3000;

// Configuração da sessão
app.use(session({
  secret: "bT8pG6k@3L#9vQz!sW4eH2xN1rJ0dYfC7tB", 
  resave: false, 
  saveUninitialized: false, 
    cookie: {
    httpOnly: true,
    sameSite: "lax",      
    secure: false,        
    maxAge: 1000 * 60 * 60 * 4, // 4h
  },
}));

app.use(bodyParser.json());

// liberar o cors para aceitar todas as origens.
app.use(cors())

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para verificar sessão
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
      // Senhas coincidem, cria a sessão
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


// Rota para inserir uma disciplina
app.post('/disciplina', async (req: Request, res: Response) => {
  try{
    const {nome, sigla, codigo, periodo_curso} = req.body;
    if(!nome || !sigla || !codigo || !periodo_curso){
      return res.status(400).json({error: "Campos 'nome', 'sigla', 'codigo' e 'periodo_curso' são obrigatórios."});
    }

    const id = await addDisciplina(nome, sigla, codigo, periodo_curso);
    res.status(201).json({message: "Disciplina adicionada com sucesso", id});
  }catch(error){
    console.error(error);
    return res.status(500).json({error: "Erro ao inserir Disciplina."});
  }
});


// Rota para exibir todas as disciplinas
app.get('/ver_disciplina', async (req: Request, res: Response) => {
  try{
    const disciplinas = await getAllDisciplinas();
    res.json(disciplinas);
  }catch(err){
    console.log(err);
    res.status(500).json({
      "error": "Erro ao buscar disciplinas"
    });
  }
});


// Rota para exluir disciplina

app.delete('/disciplina/:id', async (req: Request, res: Response) => {
  
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try{

    const rows = await deleteDisciplinaById(id);

    if(rows === 0){
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    res.status(200).json({ message: "Disciplina excluída com sucesso", rowsAffected: rows });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });  
  }
});

//Rota para verificar se existe sessão ativa
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
            return res.json(true);
        } else {
            // não existe
            return res.json(false);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});


//rota para cadastrar instituicao
app.post('/instituicao/cadastrar', async (req, res) => {
  const { nome, sigla } = req.body;
  console.log('Dados recebidos:', req.body);
  if(!req.session.user){
    return;
  }
  const docente_id= req.session.user.id;

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


//rota para listar instituicoes
app.get("/instituicao/listar", async (req, res) => {
  try {
    const dados = await listarInstituicao();
    res.json(dados);
  } catch (err) {
    console.error("Erro ao buscar instituições:", err);
    res.status(500).send("Erro ao buscar instituições");
  }
});


//rota para verificar instituicao antes de atualizar
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


//rota para atualizar instituicao
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


//rota para apagar instituicao
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


//rota para verificar curso antes de cadastrar
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


//rota para pegar id da instituicao pelo nome
app.post('/instituicao/verificar/pegarid', async (req, res) => {
    const { nome} = req.body;

    try {
        const existeInst = await pegarIdPorNome(nome);
        if (existeInst) {
              return res.json(existeInst);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
app.post('/curso/verificar/disciplina', async (req, res) => {
    const { curso_id} = req.body;

    try {
        const existeDisciplina = await pegarDisciplinaPorId(curso_id);
        if (existeDisciplina) {
              return res.json(existeDisciplina);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});


//rota para pegar id do curso pelo nome e instituicao_id
app.post('/curso/verificar/pegarid', async (req, res) => {
    const { nome, instituicao_id } = req.body;
    try {
        const cursoId = await pegarIdCurso(instituicao_id, nome);
        return res.json({ cursoId });
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});


//rota para verificar docente antes de cadastrar
app.post('/instituicao/verificar/existeDocente', async (req, res) => {
    const { instituicao_id } = req.body;
    try {
        const existeInst = await existeDocente(instituicao_id);
        return res.json({ existe: existeInst });
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});


//rota para verificar curso antes de cadastrar
app.post('/instituicao/verificar/existeCurso', async (req, res) => {
    const { instituicao_id } = req.body;
    try {
        const existeInst = await existeCurso(instituicao_id);
        return res.json({ existe: existeInst });
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});


//rota para verificar curso antes de cadastrar
app.post('/curso/verifyCurso', async (req, res) => {
    const { instituicao_id,nome} = req.body;

    try {
        const existeInst = await verificarCurso(instituicao_id,nome);
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


//rota para cadastrar curso
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


//rota para listar curso
app.post("/curso/listar", async (req, res) => {
  try {
    const { instituicao_id } = req.body;

    if (!instituicao_id) {
      return res.status(400).json({ error: "ID da instituição é obrigatório" });
    }

    const dados = await listarCurso(instituicao_id);
    res.json(dados);
  } catch (err) {
    console.error("Erro ao buscar cursos:", err);
    res.status(500).send("Erro ao buscar cursos");
  }
});


//rota para verificar curso antes de atualizar
app.post('/curso/verificar', async (req, res) => {
    const { instituicao_id,nome} = req.body;

    try {
        const existeInst = await verificarCurso(instituicao_id,nome);
        return res.json({ existeInst });
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});


//rota para atualizar curso
app.post('/curso/atualizar', async (req, res) => {
    const { nome_antigo,nome_novo,instituicao_id } = req.body;

    try {
        const atualizado = await atualizarCurso(nome_antigo,nome_novo,instituicao_id);
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


//rota para apagar curso
app.post('/curso/apagar', async (req, res) => {
    const { instituicao_id,nome } = req.body;

    try {
        const apagado = await apagarCursoComando(instituicao_id,nome);
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


//Rota para sair (logout)
app.get('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

//Rota para criar turma
app.post("/turma/criar", async (req: Request, res: Response) => {

  try {

    if (!req.session.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    const {nome, id_disciplina} = req.body;
    const docente_id = req.session.user.id;

    if (!nome || !id_disciplina) {
      return res.status(400).json({ error: "Campos nome e id_disciplina são obrigatórios." });
    }

    const id = await addTurma(id_disciplina, docente_id, nome);
    res.status(201).json({ message: "Turma criada com sucesso", id });
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar Turma." });
  }
});

//Rota para página de mostrar todas as turmas
app.get('/turmas', verificarSessao, async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const docenteId = req.session.user.id;
    const turmas = await getAllTurmasPerDocente(docenteId);

    res.json(turmas);

  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar turmas.' });
  }
});


//Rota mostrar a turma selecionada
app.get('/turma/:id', verificarSessao, async (req: Request, res: Response) => {
  try {
    const idTurma = Number(req.params.id);

    if (!Number.isFinite(idTurma) || idTurma <= 0) {
    return res.status(400).json({ error: "ID inválido." });
    }

    const turma = await getTurmaById(idTurma);

    if (!turma) {
    return res.status(404).json({ error: "Turma não encontrada." });
    }

    if (!req.session.user) {
    return res.status(401).json({ error: "Não autenticado" });
    }
    const docente_id = req.session.user.id;

    if (turma.id_docente !== docente_id) {
    return res.status(403).json({ error: "Acesso negado: esta turma não pertence ao docente." });
    }

    const turmaPublica = {
      id: turma.id,
      nome: turma.nome,
      id_disciplina: turma.id_disciplina,
    };
    return res.json(turmaPublica);
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar turma." });
  }
});


//Rota para excluir turma
app.delete('/turma/:id', verificarSessao, async (req: Request, res: Response) => {
  try {
    const idTurma = Number(req.params.id);
    if (!Number.isFinite(idTurma) || idTurma <= 0) {
      return res.status(400).json({ error: "ID inválido." });
    }

    if (!req.session.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const docente_id = req.session.user.id;

    const turma = await getTurmaById(idTurma);

    if (!turma || turma.id_docente !== docente_id) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }

    const deletar = await deleteTurmaById(idTurma);

    if (!deletar) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }

    return res.status(200).json({ message: "Turma excluída com sucesso", id: idTurma });
  } 
  catch (error: any) {
    console.error("Erro ao excluir turma:", error);
    return res.status(500).json({ error: "Erro interno ao excluir turma." });
  }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
