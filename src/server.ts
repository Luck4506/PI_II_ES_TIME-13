//Importaçãoes de módulos necessários

import express, { Request, Response, NextFunction } from "express";
import { getDocenteByEmail,verificarExisteEmail,fazerUpdateSenha } from "./db/login";
import { registrarInstituicao,removerRelacaoDocente,verificarDocenteCurso,entrarIdInstituicao,verifyIdInstituicao,verifyByNameSigla, listarInstituicao, verifyByName, atualizarInstituicao, apagarInstituicao,pegarIdPorNome,existeDocente,existeCurso,cadastrarRelacao} from "./db/instituicao";
import { verificarCursoInstituica,verificarCursoExiste,estaRelacaoCurso,estaInstituicao,existeCursoId,cadastrarCurso,apagarRelacaoCurso,verificarCurso,listarCurso,atualizarCurso,apagarCursoComando,pegarIdCurso,pegarDisciplinaPorId,cadastrarRelacaoCurso } from "./db/curso";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
import session from "express-session";
import 'express-session';
import { addDocente,possuiInstituicao,listarDocente,listarDocenteCurso,pegarTurmasDb } from "./db/docentes";
import { enviarEmail } from "./services/servico_email";
import { criarTokenRecuperacao } from "./db/recuperar_senha";
import { addDisciplina, deleteDisciplinaById, getAllDisciplinas,getAllDisciplinasPeloId } from "./db/disciplina";
import { addTurma, getAllTurmasPerDocente, getTurmaById, deleteTurmaById, verificarDisciplina, verificarNome, cadastrarTurma, verificarTurma, verificarNomeTurma,apagarTurma, atualizarTurma, pegarIdDisciplina, listarTurmasPorDisciplina, listarAlunosDaTurma,apagarRelacaoTurma } from "./db/turma";
import { addComponenteNota, getAllComponentesByDisciplina, getComponenteNotaById, deleteComponenteNotaById  } from "./db/componente_nota";
import { addAluno, buscarAlunoPorRA, excluirAlunoPorRA, listarTodosAlunos, getAllAlunosByTurma, importarAlunos } from "./db/aluno";
import { inserirAlunoTurma, atualizarNotasFinaisLote} from "./db/nota_final";
import { salvarFormula, obterFormulaPorDisciplina } from "./db/formula";
import { salvarNotasComponente, getAllLancamentosByTurmaEComponente } from "./db/lancamento_nota";


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
    return res.status(201).json({ message: "Docente adicionado com sucesso", id });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao inserir Docente." });
  }
});
// Rota para envio de código de verificação por e-mail
app.post('/enviarCodigoEmail', async (req, res) => {
    const { codigo,email } = req.body;

    try {
        const enviado = await enviarEmail(
      email,
      "Codigo de verificacao",
      `<p>O codigo de verificao do seu email é ${codigo}</p>`
    );

    if (!enviado) {
            return res.status(500).json({ error: "Falha ao enviar email." });
        }
    return res.status(200).json({ message: "Código enviado com sucesso." });
    
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
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
// Rota para verificar se o docente logado possui alguma instituição relacionada
app.post('/verificarTemInstituicao', async (req, res) => {
  try {
    if(!req.session.user){
      return;
    }
    const docente_id= req.session.user.id;
    const temInstituicaoDocente = await possuiInstituicao(docente_id);
    if (temInstituicaoDocente) {
      return res.json({ temInstituicao: true });
    } else {
      return res.json({ temInstituicao: false });
    }
    
  } catch (err) {
    console.error("Erro ao verificar instituição:", err);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
});

//rota para página de mudar senha
app.get('/mudar_senha', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public', 'mudar_senha', 'index.html'));
});


// Rota para inserir uma disciplina
app.post('/disciplina', async (req: Request, res: Response) => {
  try{
    const {curso_ID, nome, sigla, codigo, periodo_curso} = req.body;
    if(!curso_ID || !nome || !sigla || !codigo || !periodo_curso){
      return res.status(400).json({error: "Campos 'curso_ID', 'nome', 'sigla', 'codigo' e 'periodo_curso' são obrigatórios."});
    }

    const id = await addDisciplina(curso_ID, nome, sigla, codigo, periodo_curso);
    res.status(201).json({message: "Disciplina adicionada com sucesso", id});
  }catch(error){
    console.error(error);
    return res.status(500).json({error: "Erro ao inserir Disciplina."});
  }
});


// Rota para exibir todas as disciplinas
app.post('/ver_disciplina', async (req: Request, res: Response) => {
  const { curso_id } = req.body;
  try{
    const disciplinas = await getAllDisciplinasPeloId(curso_id);
    res.json(disciplinas);
  }catch(err){
    console.log(err);
    res.status(500).json({
      "error": "Erro ao buscar disciplinas"
    });
  }
});
//rota para verificar se curso existe
app.post('/disciplina/existeCurso', async (req, res) => {
    const { curso_id } = req.body;
    try {
        const existe = await existeCursoId(curso_id);
        return res.json(existe);
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
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
// Rota para verificar se existe instituição com o nome e sigla fornecidos
app.post('/instituicao/verificarNomeSigla', async (req, res) => {
    const { nome,sigla } = req.body;

    try {
        const instituicao = await verifyByNameSigla(nome,sigla);
        if (instituicao) {
            return res.json(true);
        } else {
            return res.json(false);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});

//rota para verificar se a instituicao existe
app.post('/instituicao/verificarNome', async (req, res) => {
    const { nome } = req.body;

    try {
        const instituicao = await verifyByName(nome);
        if (instituicao) {
            return res.json(true);
        } else {
            return res.json(false);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para cadastrar a relação entre o docente e uma instituição
app.post('/instituicao/cadastrarRelacao', async (req, res) => {
    const { instituicao_id } = req.body;
    if(!req.session.user){
    return;
    }
    const docente_id= req.session.user.id;
    try {
        const cadastrada = await cadastrarRelacao(instituicao_id,docente_id);
        if (cadastrada) {
            return res.json(true);
        } else {
            return res.json(false);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para listar turmas associadas ao docente logado
app.post("/turma/listarDoDocente", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ erro: "Não autenticado" });
    }
    const docente_id= req.session.user.id;
    try {
        const turmas = await pegarTurmasDb(docente_id);
        return res.json(turmas);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro no servidor" });
    }
});
// Rota para atualizar a senha de um docente no banco de dados
app.post('/updateSenhaDb', async (req, res) => {
    const { email,senha } = req.body;
    try {
        const registrado = await fazerUpdateSenha(email,senha);
        if (registrado) {
            return res.json(true);
        } else {
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
  

  // Verifica se todos os campos obrigatórios vieram
  if (!nome || !sigla) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }

  try {
    const sucesso = await registrarInstituicao(nome, sigla);
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
        const instituicao = await verifyByNameSigla(nome,sigla);
        if (instituicao) {
              return res.json(true);
             // pode retornar o objeto
        } else {
            // não existe
            return res.json(false);
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
// Rota para verificar a existência de um curso por ID
app.post('/curso/verifyCursoExiste', async (req, res) => {
    const { curso_id } = req.body;

    try {
        const existeCurso = await verificarCursoExiste(curso_id);
        if (existeCurso) {
              return res.json(true);
        } else {
            return res.json(false);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});

//rota para pegar id da instituicao pelo nome
app.post('/instituicao/verificar/pegarid', async (req, res) => {
    const { nome:nome_int} = req.body;

    try {
        const existeInst = await pegarIdPorNome(nome_int);
        if (existeInst) {
              return res.json(existeInst);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar se uma instituição existe pelo ID
app.post('/instituicao/verificarExisteId', async (req, res) => {
    const { instituicao_id } = req.body;

    try {
        const existe = await verifyIdInstituicao(instituicao_id);
        return res.json(existe);
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para associar um docente a uma instituição
app.post('/instituicao/entrarInstituicao', async (req, res) => {
    const { instituicao_id } = req.body;
    if(!req.session.user){
    return;
    }
    const docente_id= req.session.user.id;
    try {
        const existe = await entrarIdInstituicao(instituicao_id,docente_id);
        return res.json(existe);
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar se o docente está associado a um curso/instituição
app.post('/instituicao/verificarExisteDocente', async (req, res) => {
    const { instituicao_id } = req.body;
    if(!req.session.user){
    return;
    }
    const docente_id= req.session.user.id;
    try {
        const existe = await verificarDocenteCurso(instituicao_id,docente_id);
        return res.json(existe);
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar a existência de uma disciplina pelo código
app.post('/turma/verificarDisciplina', async (req, res) => {
    const { codigo_disciplina } = req.body;
    try {
        const existe = await verificarDisciplina(codigo_disciplina);
        return res.json(existe);
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar se existe uma turma com determinado nome para uma disciplina
app.post('/turma/verificarNome', async (req, res) => {
    const { codigo_disciplina,nome } = req.body;
    try {
        const existe = await verificarNome(codigo_disciplina,nome);
        return res.json(existe);
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar se existe uma turma com determinado nome para uma disciplina
app.post('/turma/verificarNomeTurma', async (req, res) => {
    const { codigo_disciplina,nome } = req.body;
    try {
        const existe = await verificarNomeTurma(codigo_disciplina,nome);
        return res.json(existe);
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para cadastrar uma nova turma
app.post('/turma/cadastrarTurma', async (req, res) => {
    const { codigo_disciplina,nome } = req.body;
    if(!req.session.user){
    return;
    }
    const docente_id= req.session.user.id;
    try {
        await cadastrarTurma(codigo_disciplina,nome,docente_id);
        return true;
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para atualizar o nome de uma turma
app.post('/turma/atualizarTurma', async (req, res) => {
    const { codigo_turma,nome_antigo,nome_novo } = req.body;
    try {
        await atualizarTurma(codigo_turma,nome_antigo,nome_novo);
        return true;
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para apagar a relação do docente com a turma
app.post('/turma/apagarRelacao', async (req, res) => {
    const { codigo_turma } = req.body;
    try {
        await apagarRelacaoTurma(codigo_turma);
        return true;
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para apagar uma turma
app.post('/turma/apagarTurma', async (req, res) => {
    const { codigo_turma } = req.body;
    try {
        await apagarTurma(codigo_turma);
        return true;
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar a existência de uma turma por código e nome
app.post('/turma/verificarTurma', async (req, res) => {
    const { codigo_turma,nome } = req.body;
    try {
        const existe = await verificarTurma(codigo_turma,nome);
        return res.json(existe);
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para obter o ID da disciplina associada a uma turma
app.post('/turma/pegarIdDisciplina', async (req, res) => {
    const { turma_id } = req.body;
    try {
        const existe = await pegarIdDisciplina(turma_id);
        return res.json(existe);
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar se existem disciplinas associadas a um curso
app.post('/curso/verificar/disciplina', async (req, res) => {
    const { curso_id} = req.body;

    try {
        const existeDisciplina = await pegarDisciplinaPorId(curso_id);
        if (existeDisciplina) {
              return res.json(true);
        }else{
          return res.json(false);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});


//rota para pegar id do curso pelo nome e instituicao_id
app.post('/curso/verificar/pegarid', async (req, res) => {
    const { instituicao_id,nome } = req.body;
    try {
        const cursoId = await pegarIdCurso(instituicao_id, nome);
        return res.json( cursoId );
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para cadastrar a relação entre o docente logado e um curso
app.post('/curso/cadastrarRelacao', async (req, res) => {
    const {curso_id} = req.body;
    
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }
      const docente_id = req.session.user.id;
      const sucesso = await cadastrarRelacaoCurso(docente_id, curso_id);
      if(sucesso){
        return res.json( true );
      }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar a existência de um curso pelo ID
app.post('/curso/verifyExisteCurso', async (req, res) => {
    const {curso_id} = req.body;
    
    try {
      const sucesso = await existeCursoId(curso_id);
      if(sucesso){
        return res.json( true );
      }else{
        return res.json( false );
      }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar se o docente logado está associado à instituição
app.post('/curso/verifyEstaInstituicao', async (req, res) => {
    const {instituicao_id} = req.body;
    
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }
      const docente_id = req.session.user.id;
      const esta = await estaInstituicao(instituicao_id,docente_id);
      if(esta){
        return res.json( true );
      }else{
        return res.json( false );
      }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar se existe uma relação entre o docente logado e um curso
app.post('/curso/verifyExisteRelacao', async (req, res) => {
    const {curso_id} = req.body;
    
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }
      const docente_id = req.session.user.id;
      const esta = await estaRelacaoCurso(docente_id,curso_id);
      if(esta){
        return res.json( true );
      }else{
        return res.json( false );
      }
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
// Rota para verificar a existência de uma relação específica entre instituição e docente
app.post('/instituicao/verificar/existeRelacao', async (req, res) => {
    const { instituicao_id,docente_id } = req.body;
    try {
        const existe = await verificarDocenteCurso(instituicao_id,docente_id);
        if (existe){
          return res.json(true);
        }else{
          return res.json(false);
        }
        
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
// Rota para listar docentes de uma instituição
app.post("/docente/listar", async (req, res) => {
  try {
    const { instituicao_id } = req.body;

    if (!instituicao_id) {
      return res.status(400).json({ error: "ID da instituição é obrigatório" });
    }

    const dados = await listarDocente(instituicao_id);
    res.json(dados);
  } catch (err) {
    console.error("Erro ao buscar cursos:", err);
    res.status(500).send("Erro ao buscar cursos");
  }
});
// Rota para listar docentes associados a um curso
app.post("/docente/curso/listar", async (req, res) => {
  try {
    const { curso_id } = req.body;

    const dados = await listarDocenteCurso(curso_id);
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
// Rota para remover a relação de um docente com uma instituição
app.post('/instituicao/removerRelacao', async (req, res) => {
    const { instituicao_id,docente_id } = req.body;
    try {
        const removido = await removerRelacaoDocente(instituicao_id,docente_id);
        if (removido){
          return res.json(true);
        }else{
          return res.json(false);
        }
        
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para apagar a relação entre docentes e um curso
app.post('/curso/apagarRelacao', async (req, res) => {
    const { curso_id } = req.body;

    try {
        const apagado = await apagarRelacaoCurso(curso_id);
        if (apagado) {
              return res.json(true);
        } else {
            return res.json(false);
        }
    } catch (erro) {
        console.error('Erro ao verificar no DB:', erro);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});
// Rota para verificar se um email já está cadastrado
app.post('/verificarEmailCadastrado', async (req, res) => {
    const { email } = req.body;

    try {
        const existe = await verificarExisteEmail(email);
        return res.json(existe);
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

//Rotas componentes de nota

// Criar componente de nota
app.post('/componente-nota', async (req: Request, res: Response) => {
  try {
    const { codigo_disciplina, nome, sigla, descricao } = req.body;

    if (!codigo_disciplina || !nome) {
      return res.status(400).json({ error: "Campos 'codigo_disciplina' e 'nome' são obrigatórios." });
    }

    const id = await addComponenteNota(Number(codigo_disciplina), String(nome), sigla ?? null, descricao ?? null);
    return res.status(201).json({ message: 'Componente de nota criado com sucesso', id });
  } catch (error) {
    console.error('Erro ao criar componente de nota:', error);
    return res.status(500).json({ error: 'Erro ao criar componente de nota.' });
  }
});

// Listar componentes de nota por disciplina
app.get('/componentes-nota/:disciplinaId', async (req: Request, res: Response) => {
  try {
    const disciplinaId = Number(req.params.disciplinaId);

    if (!Number.isFinite(disciplinaId) || disciplinaId <= 0) {
      return res.status(400).json({ error: 'ID de disciplina inválido.' });
    }

    const componentes = await getAllComponentesByDisciplina(disciplinaId);
    return res.json(componentes);
  } catch (error) {
    console.error('Erro ao listar componentes de nota:', error);
    return res.status(500).json({ error: 'Erro ao listar componentes de nota.' });
  }
});

// Obter um componente de nota por ID
app.get('/componente-nota/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const componente = await getComponenteNotaById(id);
    if (!componente) {
      return res.status(404).json({ error: 'Componente de nota não encontrado.' });
    }

    return res.json(componente);
  } catch (error) {
    console.error('Erro ao buscar componente de nota:', error);
    return res.status(500).json({ error: 'Erro ao buscar componente de nota.' });
  }
});

// Excluir componente de nota por ID
app.delete('/componente-nota/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const deletado = await deleteComponenteNotaById(id);
    if (!deletado) {
      return res.status(404).json({ error: 'Componente de nota não encontrado.' });
    }

    return res.status(200).json({ message: 'Componente de nota excluído com sucesso', id });
  } catch (error) {
    console.error('Erro ao excluir componente de nota:', error);
    return res.status(500).json({ error: 'Erro interno ao excluir componente de nota.' });
  }
});

//Rota de Alunos

// Rota cadastrar aluno
app.post('/aluno', async (req: Request, res: Response) => {
  try {
    const { ra, nome } = req.body;

    if (!ra || !nome) {
      return res.status(400).json({ error: "Campos 'ra' e 'nome' são obrigatórios." });
    }

    const id = await addAluno(Number(ra), String(nome));
    return res.status(201).json({ message: 'Aluno criado com sucesso', ra: id });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return res.status(500).json({ error: 'Erro ao criar aluno.' });
  }
});

// rota para buscar aluno por RA
app.get('/aluno/:ra', async (req: Request, res: Response) => {
  try {
    const ra = Number(req.params.ra);

    if (!Number.isFinite(ra) || ra <= 0) {
      return res.status(400).json({ error: 'RA inválido.' });
    }

    const aluno = await buscarAlunoPorRA(ra);
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    return res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    return res.status(500).json({ error: 'Erro ao buscar aluno.' });
  }
});

// Rota para deletar aluno por RA
app.delete('/aluno/:ra', async (req: Request, res: Response) => {
  try {
    const ra = Number(req.params.ra);

    if (!Number.isFinite(ra) || ra <= 0) {
      return res.status(400).json({ error: 'RA inválido.' });
    }

    const deletado = await excluirAlunoPorRA(ra);
    if (!deletado) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    return res.status(200).json({ message: 'Aluno excluído com sucesso', ra });
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    return res.status(500).json({ error: 'Erro interno ao excluir aluno.' });
  }
});

// Rota para listar todos os alunos
app.get('/alunos', async (_req: Request, res: Response) => {
  try {
    const alunos = await listarTodosAlunos();
    return res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    return res.status(500).json({ error: 'Erro ao listar alunos.' });
  }
});

// Rota para listar alunos de uma turma específica
app.get('/turma/:turmaId/alunos', async (req: Request, res: Response) => {
  try {
    const turmaId = Number(req.params.turmaId);

    if (!Number.isFinite(turmaId) || turmaId <= 0) {
      return res.status(400).json({ error: 'Código da turma inválido.' });
    }

    const alunos = await getAllAlunosByTurma(turmaId);
    return res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos.', error);
    return res.status(500).json({ error: 'Erro ao listar alunos.' });
  }
});

// Rota para importar múltiplos alunos (AINDA EM TESTES)

app.post('/alunos/importar', async (req: Request, res: Response) => {
  try {
    // Aceita tanto { alunos: [...] } quanto um array direto no body
    const payload = Array.isArray(req.body) ? req.body : req.body?.alunos;

    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({ error: "Envie um array 'alunos' com objetos { ra, nome }." });
    }

    // Normaliza e valida minimamente os itens
    const alunos = payload
      .map((a: any) => ({
        ra: Number(a?.ra),
        nome: String(a?.nome ?? '').trim(),
      }))
      .filter((a: any) => Number.isFinite(a.ra) && a.ra > 0 && a.nome.length > 0);

    if (alunos.length === 0) {
      return res.status(400).json({ error: "Nenhum aluno válido encontrado no payload." });
    }

    const resumo = await importarAlunos(alunos);
    return res.status(201).json({ message: 'Importação concluída', resumo });
  } catch (error) {
    console.error('Erro ao importar alunos:', error);
    return res.status(500).json({ error: 'Erro ao importar alunos.' });
  }
});

//Rota para listar turmas por disciplina
app.get("/turma/por_disciplina/:id", async (req, res) => {
  try {
    const idDisciplina = Number(req.params.id);
    const turmas = await listarTurmasPorDisciplina(idDisciplina);
    res.json(turmas);
  } catch (erro) {
    console.error("Erro ao buscar turmas:", erro);
    res.status(500).json({ mensagem: "Erro ao buscar turmas." });
  }
});


// Rota para listar alunos de uma turma (usada na tela de lançamento de notas)
app.get("/turma/:id/alunos", async (req: Request, res: Response) => {
  try {
    const idTurma = Number(req.params.id);

    if (!Number.isFinite(idTurma) || idTurma <= 0) {
      return res.status(400).json({ error: "ID de turma inválido." });
    }

    const alunos = await listarAlunosDaTurma(idTurma);
    return res.json(alunos);
  } catch (erro) {
    console.error("Erro ao buscar alunos da turma:", erro);
    return res.status(500).json({ mensagem: "Erro ao buscar alunos da turma." });
  }
});

//Rota adicionar aluno na turma
app.post('/turma/adicionar-aluno', async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const docenteId = req.session.user.id;

    const { codigo_turma, ra_aluno } = req.body;

    if (!codigo_turma || !ra_aluno) {
      return res.status(400).json({ error: "Campos 'codigo_turma' e 'ra_aluno' são obrigatórios." });
    }

    const codigoTurmaNum = Number(codigo_turma);
    const raAlunoNum = Number(ra_aluno);

    if (!Number.isFinite(codigoTurmaNum) || codigoTurmaNum <= 0) {
      return res.status(400).json({ error: 'Código de turma inválido.' });
    }

    if (!Number.isFinite(raAlunoNum) || raAlunoNum <= 0) {
      return res.status(400).json({ error: 'RA do aluno inválido.' });
    }

    // Garante que a turma existe e pertence ao docente logado
    const turma = await getTurmaById(codigoTurmaNum);
    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada.' });
    }

    

    if (turma.id_docente !== docenteId) {
      return res.status(403).json({ error: 'Acesso negado: esta turma não pertence ao docente logado.' });
    }

    await inserirAlunoTurma(codigoTurmaNum, raAlunoNum);

    return res.status(201).json({
      message: 'Aluno vinculado à turma com sucesso.',
      codigo_turma: codigoTurmaNum,
      ra_aluno: raAlunoNum
    });
  } catch (error) {
    console.error('Erro ao adicionar aluno na turma:', error);
    return res.status(500).json({ error: 'Erro ao adicionar aluno na turma.' });
  }
});

// Rota para listar disciplinas para fórmula
app.get('/formula/disciplinas', async (_req: Request, res: Response) => {
  try {
    const disciplinas = await getAllDisciplinas();
    return res.json(disciplinas); 
  } catch (error) {
    console.error('Erro ao listar disciplinas para fórmula:', error);
    return res.status(500).json({ error: 'Erro ao listar disciplinas.' });
  }
});

// Rota para listar lançamentos de notas por turma e componente
app.get("/lancamento-nota/:turmaId/:componenteId", async (req: Request, res: Response) => {
  try {
    const turmaId = Number(req.params.turmaId);
    const componenteId = Number(req.params.componenteId);

    if (!Number.isFinite(turmaId) || turmaId <= 0) {
      return res.status(400).json({ error: "ID de turma inválido." });
    }

    if (!Number.isFinite(componenteId) || componenteId <= 0) {
      return res.status(400).json({ error: "ID de componente inválido." });
    }

    const lancamentos = await getAllLancamentosByTurmaEComponente(turmaId, componenteId);

    return res.json(lancamentos);

  } catch (erro) {
    console.error("Erro ao buscar lançamentos:", erro);
    return res.status(500).json({ error: "Erro ao buscar lançamentos de notas." });
  }
});

// Rota para cadastrar ou atualizar fórmula
app.post('/formula/cadastrar_formula', async (req: Request, res: Response) => {
  try {
    const { idDisciplina, expressao } = req.body;

    if (!idDisciplina || !expressao || typeof expressao !== 'string') {
      return res.status(400).json({ mensagem: "Campos 'idDisciplina' e 'expressao' são obrigatórios." });
    }

    const idDisciplinaNum = Number(idDisciplina);
    if (!Number.isFinite(idDisciplinaNum) || idDisciplinaNum <= 0) {
      return res.status(400).json({ mensagem: "ID de disciplina inválido." });
    }

    const formula = await salvarFormula(idDisciplinaNum, expressao.trim());

    return res.status(200).json({
      mensagem: "Fórmula cadastrada/atualizada com sucesso.",
      formula,
    });
  } catch (erro) {
    console.error("Erro ao salvar fórmula:", erro);
    return res.status(500).json({ mensagem: "Erro ao salvar fórmula." });
  }
});

// Rota para obter fórmula por disciplina
app.get("/formula/por_disciplina/:id", async (req: Request, res: Response) => {
  try {
    const idDisciplina = Number(req.params.id);

    if (!Number.isFinite(idDisciplina) || idDisciplina <= 0) {
      return res.status(400).json({ mensagem: "ID de disciplina inválido." });
    }

    const formula = await obterFormulaPorDisciplina(idDisciplina);

    if (!formula) {
      return res.status(404).json({ mensagem: "Nenhuma fórmula cadastrada para esta disciplina." });
    }
    return res.json(formula);

  } catch (erro) {
    console.error("Erro ao obter fórmula por disciplina:", erro);
    return res.status(500).json({ mensagem: "Erro ao obter fórmula da disciplina." });
  }
});


// Rota para salvar notas de um componente (lote)
app.post("/lancamento-nota/salvar", async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const docenteId = req.session.user.id;
    const { codigo_turma, componente_id, notas } = req.body;

    if (!codigo_turma || !componente_id || !Array.isArray(notas)) {
      return res.status(400).json({
        error:
          "Campos 'codigo_turma', 'componente_id' e 'notas' são obrigatórios.",
      });
    }

    const codigoTurmaNum = Number(codigo_turma);
    const componenteIdNum = Number(componente_id);

    if (!Number.isFinite(codigoTurmaNum) || codigoTurmaNum <= 0) {
      return res.status(400).json({ error: "Código de turma inválido." });
    }

    if (!Number.isFinite(componenteIdNum) || componenteIdNum <= 0) {
      return res
        .status(400)
        .json({ error: "ID de componente de nota inválido." });
    }

    const notasNormalizadas = notas
      .map((n: any) => ({
        ra_aluno: Number(n.ra_aluno),
        valor: Number(n.valor),
      }))
      .filter(
        (n) => Number.isFinite(n.ra_aluno) && Number.isFinite(n.valor)
      );

    if (!notasNormalizadas.length) {
      return res
        .status(400)
        .json({ error: "Nenhuma nota válida foi enviada para salvar." });
    }

    await salvarNotasComponente(
      codigoTurmaNum,
      componenteIdNum,
      docenteId,
      notasNormalizadas
    );

    return res
      .status(200)
      .json({ message: "Notas de componente salvas com sucesso." });
  } catch (erro) {
    console.error("Erro ao salvar notas de componente:", erro);
    return res
      .status(500)
      .json({ error: "Erro ao salvar notas de componente." });
  }
});

//Lançamento de nota final
app.post("/nota-final/salvar-lote", async (req: Request, res: Response) => {
  try {
    const { notas } = req.body;

    if (!Array.isArray(notas) || notas.length === 0) {
      return res.status(400).json({ error: "Nenhuma nota final enviada para salvar." });
    }

    // Validação básica de campos obrigatórios
    const registros = notas.map((n: any) => {
      if (
        n.codigo_turma == null ||
        n.ra_aluno == null ||
        n.valor_final == null
      ) {
        throw new Error("Registro de nota final inválido (campos obrigatórios ausentes).");
      }

      return {
        codigo_turma: Number(n.codigo_turma),
        ra_aluno: Number(n.ra_aluno),
        valor_final: Number(n.valor_final),
      };
    });

    await atualizarNotasFinaisLote(registros);

    return res.status(200).json({ message: "Notas finais salvas com sucesso." });
  } catch (erro) {
    console.error("Erro em /nota-final/salvar-lote:", erro);
    return res.status(500).json({ error: "Erro ao salvar notas finais." });
  }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
