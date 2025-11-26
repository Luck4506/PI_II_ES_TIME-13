//Codigo de autoria de Lucas Gonçalves

const formulaEl = document.getElementById('formula');
const tbody = document.getElementById('tbody');
const selTurma = document.getElementById('turma');
const selDisciplina = document.getElementById('disciplina');

// ---------- Dados dinâmicos vindos do back-end ----------
let EXPRESSAO = '';        // Fórmula da disciplina selecionada (ex.: "(P1 + P2 + T1) / 3")
let SIGLAS = [];           // Siglas dos componentes de nota da disciplina (ex.: ["P1","P2","T1"])
let COMPONENTES = [];      // Componentes completos da disciplina [{ id, sigla, nome }]
let ALUNOS = [];           // Alunos da turma selecionada [{ ra, nome }]
const NOTAS = {};          // Mapa de notas por aluno e sigla: { [ra]: { [sigla]: valor } }
//--------------------------------------------------------//

console.log("Inicializando nota_final.js. SIGLAS:", SIGLAS, "COMPONENTES:", COMPONENTES);

// Atualiza cabeçalho dos componentes
function atualizarCabecalhoComponentes() {
  const ths = document.querySelectorAll('th.th-componente');

  ths.forEach((th, index) => {
    const sigla = SIGLAS[index];

    if (!sigla) {
      th.textContent = '';
      return;
    }

    // Apenas a SIGLA, sem nome
    th.textContent = sigla;
  });
}

// Limpa notas e tabela
function limparNotasETabela() {
  Object.keys(NOTAS).forEach(k => delete NOTAS[k]);
  tbody.innerHTML = '';
}

// Reseta select de disciplina
function resetDisciplina() {
  selDisciplina.innerHTML = '<option value="">Selecione a disciplina</option>';
}

// Reseta select de turma
function resetTurma() {
  selTurma.innerHTML = '<option value="">Selecione a turma</option>';
  selTurma.disabled = true;
}

// Monta a tabela de alunos e notas
function montarTabela() {
  tbody.innerHTML = '';

  if (!ALUNOS || ALUNOS.length === 0) {
    return;
  }

  ALUNOS.forEach(aluno => {
    const tr = document.createElement('tr');

    // Matrícula (RA)
    const tdMat = document.createElement('td');
    tdMat.textContent = aluno.ra;
    tr.appendChild(tdMat);

    // Nome
    const tdNome = document.createElement('td');
    tdNome.textContent = aluno.nome;
    tr.appendChild(tdNome);

    // Colunas de componentes de nota (uma por sigla)
    SIGLAS.forEach(sigla => {
      const td = document.createElement('td');
      td.className = 'td-nota';
      td.dataset.sigla = sigla;
      td.textContent = '-'; // será preenchido com as notas carregadas
      tr.appendChild(td);
    });

    // Coluna de Nota Final (por enquanto só visual; cálculo será feito depois)
    const tdFinal = document.createElement('td');
    tdFinal.className = 'td-nota-final';
    tdFinal.textContent = '-';
    tr.appendChild(tdFinal);

    tbody.appendChild(tr);
  });
}

// -----------------------------------------------------------------------------
// Fluxo principal da tela de nota final
// 1) Carrega as disciplinas disponíveis (carregarDisciplinas).
// 2) Ao escolher uma disciplina, carrega fórmula, turmas e componentes.
// 3) Ao escolher uma turma, carrega alunos e notas já lançadas.
// 4) Com base na fórmula e nas notas, calcula a nota final e permite salvar no banco.
// -----------------------------------------------------------------------------

// Carrega disciplinas no select
// Faz requisição ao back-end para obter as disciplinas que possuem fórmula configurada.
async function carregarDisciplinas() {
  try {
    resetDisciplina();
    resetTurma();
    limparNotasETabela();
    formulaEl.textContent = '';
    SIGLAS = [];
    atualizarCabecalhoComponentes();

    const resp = await fetch('/formula/disciplinas');
    if (!resp.ok) {
      throw new Error('Falha ao buscar disciplinas');
    }

    // Converte a lista de disciplinas retornada pelo back-end em um array de objetos.
    const disciplinas = await resp.json(); // [{ id, nome, ... }]

    // Para cada disciplina encontrada, cria uma opção no select para o usuário escolher.
    disciplinas.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.nome;
      selDisciplina.appendChild(opt);
    });
  } catch (erro) {
    // Registra detalhes do erro no console para facilitar depuração pelos desenvolvedores.
    console.error('Erro ao carregar disciplinas para notas finais:', erro);
    // Informa ao usuário de forma amigável que houve um problema ao buscar as disciplinas.
    alert('Erro ao carregar disciplinas.');
  }
}

// Carrega turmas da disciplina selecionada
async function carregarTurmasPorDisciplina(idDisciplina) {
  try {
    resetTurma();
    limparNotasETabela();

    if (!idDisciplina) return;

    const resp = await fetch(`/turma/por_disciplina/${idDisciplina}`);
    if (!resp.ok) {
      // Caso a resposta HTTP não seja bem-sucedida, lança um erro para ser tratado no catch.
      throw new Error('Falha ao buscar turmas da disciplina');
    }

    // Converte o JSON de resposta em uma lista de turmas vinculadas à disciplina.
    const turmas = await resp.json(); // [{ id, nome }]

    // Cria dinamicamente cada opção de turma no select, com id e nome vindos do banco.
    turmas.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.nome;
      selTurma.appendChild(opt);
    });

    selTurma.disabled = turmas.length === 0;
  } catch (erro) {
    // Mostra detalhes técnicos do erro no console para auxiliar na correção.
    console.error('Erro ao carregar turmas:', erro);
    // Exibe uma mensagem genérica de erro para o usuário, sem expor detalhes internos.
    alert('Erro ao carregar turmas da disciplina.');
  }
}

// Carrega fórmula da disciplina
async function carregarFormulaPorDisciplina(idDisciplina) {
  try {
    EXPRESSAO = '';
    formulaEl.textContent = '';

    if (!idDisciplina) return;

    const resp = await fetch(`/formula/por_disciplina/${idDisciplina}`);
    if (!resp.ok) {
      // Se a API não retornar 200, assume que não há fórmula cadastrada para essa disciplina.
      formulaEl.textContent = '(sem fórmula cadastrada)';
      return;
    }

    const dados = await resp.json(); // { EXPRESSAO: '(... )', ... } ou objeto Formula
    EXPRESSAO =
      dados.EXPRESSAO || // caso venha em maiúsculas (padrão Oracle)
      dados.Expressao  || // camelCase
      dados.expressao  || // minúsculas
      '';
    formulaEl.textContent = EXPRESSAO || '(sem fórmula cadastrada)';

    console.log('Fórmula carregada para disciplina', idDisciplina, '=>', EXPRESSAO, dados);
  } catch (erro) {
    // Registra o erro da tentativa de carregar a fórmula da disciplina.
    console.error('Erro ao carregar fórmula da disciplina:', erro);
    // Informa visualmente na tela que ocorreu um problema ao buscar a fórmula.
    formulaEl.textContent = '(erro ao carregar fórmula)';
  }
}

// Carrega componentes de nota
async function carregarComponentes(idDisciplina) {
  try {
    SIGLAS = [];
    limparNotasETabela();

    if (!idDisciplina) return;

    const resp = await fetch(`/componentes-nota/${idDisciplina}`);
    if (!resp.ok) {
      // Lança um erro caso a resposta ao buscar componentes não seja bem-sucedida.
      throw new Error('Falha ao buscar componentes de nota');
    }

    const componentes = await resp.json(); // [{ id, sigla, nome }]
    console.log('Componentes carregados para disciplina', idDisciplina, componentes);
    COMPONENTES = componentes;
    SIGLAS = componentes.map(c => c.sigla);
    atualizarCabecalhoComponentes();

    // Se já houver alunos carregados, monta a tabela com as novas colunas
    if (ALUNOS && ALUNOS.length > 0) {
      console.log('Já havia alunos carregados, montando tabela com SIGLAS:', SIGLAS);
      montarTabela();
      preencherNotasNaTabela();
      calcularNotasFinaisParaTodos();
    }
  } catch (erro) {
    // Registra no console os detalhes do erro relacionado aos componentes de nota.
    console.error('Erro ao carregar componentes de nota:', erro);
    // Mostra uma mensagem amigável para o usuário sobre a falha ao buscar os componentes.
    alert('Erro ao carregar componentes de nota.');
  }
}

// Carrega alunos da turma
async function carregarAlunosDaTurma(idTurma) {
  try {
    limparNotasETabela();

    if (!idTurma) return;

    const resp = await fetch(`/turma/${idTurma}/alunos`);
    if (!resp.ok) {
      // Se a resposta não for 2xx, considera que houve falha ao buscar os alunos.
      throw new Error('Falha ao buscar alunos da turma');
    }

    const alunos = await resp.json(); 
    console.log('Alunos carregados para turma', idTurma, alunos);
    // Normaliza os dados dos alunos para garantir que sempre tenhamos RA e nome
    ALUNOS = alunos.map(a => ({
      ra: a.ra_aluno ?? a.RA_ALUNO ?? a.ra ?? a.RA ?? a.id,
      nome: a.nome ?? a.NOME
    }));

    montarTabela();
    await carregarNotasDeTodosComponentesDaTurma();
    preencherNotasNaTabela();
    calcularNotasFinaisParaTodos();

  } catch (erro) {
    // Registra no console o erro ocorrido durante o carregamento dos alunos.
    console.error('Erro ao carregar alunos da turma:', erro);
    // Exibe uma mensagem resumida de erro para o usuário final.
    alert('Erro ao carregar alunos da turma.');
  }
}

// Preenche notas na tabela
function preencherNotasNaTabela() {
  const linhas = tbody.querySelectorAll('tr');

  linhas.forEach(tr => {
    const raCell = tr.querySelector('td');
    if (!raCell) return;
    const ra = raCell.textContent;

    const notaCells = tr.querySelectorAll('td.td-nota');
    notaCells.forEach(td => {
      const sigla = td.dataset.sigla;
      const valor = NOTAS[ra]?.[sigla];
      td.textContent = Number.isFinite(valor) ? valor.toString() : '-';
    });

    // (Removido o placeholder da coluna de Nota Final)
  });
}

// Carrega notas de todos os componentes
async function carregarNotasDeTodosComponentesDaTurma() {
  const turmaId = selTurma.value;
  console.log('carregarNotasDeTodosComponentesDaTurma() - turmaId:', turmaId, 'COMPONENTES:', COMPONENTES);

  if (!turmaId) return;
  if (!COMPONENTES || COMPONENTES.length === 0) return;

  for (const componente of COMPONENTES) {
    try {
      console.log('Buscando lançamentos para turma', turmaId, 'componente', componente);
      const resp = await fetch(`/lancamento-nota/${turmaId}/${componente.id}`);
      if (!resp.ok) {
        // Se houver erro ao buscar este componente específico, ignora e segue para o próximo.
        continue;
      }

      const lancamentos = await resp.json(); // [{ ra_aluno, valor }, ...]
      console.log('Lançamentos recebidos para componente', componente.sigla, lancamentos);

      lancamentos.forEach(l => {
        const ra = l.ra_aluno ?? l.RA_ALUNO;
        const valorBruto = l.valor ?? l.VALOR;
        const valorNum = Number(valorBruto);
        if (!Number.isFinite(valorNum)) {
          return;
        }
        if (!NOTAS[ra]) NOTAS[ra] = {};
        NOTAS[ra][componente.sigla] = valorNum;
      });
    } catch (erro) {
      // Registra qual componente falhou ao carregar as notas, junto com o erro detalhado.
      console.error(
        `Erro ao carregar notas existentes do componente ${componente.sigla}:`,
        erro
      );
    }
  }
}

// Calcula nota final de um aluno
function calcularNotaFinalParaAluno(ra) {
  if (!EXPRESSAO || !EXPRESSAO.trim()) return undefined;
  if (!NOTAS[ra]) return undefined;

  let expr = EXPRESSAO;

  // Substitui cada sigla (P1, P2, T1, etc.) pelo valor correspondente
  for (const sigla of SIGLAS) {
    const valor = NOTAS[ra][sigla];
    if (!Number.isFinite(valor)) {
      // Se algum componente não tiver nota, não calcula a nota final
      return undefined;
    }
    const regex = new RegExp(`\\b${sigla}\\b`, 'g');
    expr = expr.replace(regex, valor.toString());
  }

  try {
    const resultado = eval(expr);
    if (!Number.isFinite(resultado)) return undefined;
    return resultado.toFixed(2);
  } catch (e) {
    // Caso a expressão montada seja inválida, registra o erro para investigação futura.
    console.error('Erro ao avaliar expressão da nota final:', e);
    return undefined;
  }
}

// Calcula nota final de todos os alunos
function calcularNotasFinaisParaTodos() {
  const linhas = tbody.querySelectorAll('tr');

  linhas.forEach(tr => {
    const raCell = tr.querySelector('td');
    if (!raCell) return;
    const ra = raCell.textContent;

    const tdFinal = tr.querySelector('td.td-nota-final');
    if (!tdFinal) return;

    const notaFinal = calcularNotaFinalParaAluno(ra);
    tdFinal.textContent = notaFinal !== undefined ? notaFinal : '-';
  });
}

// Salva notas finais no banco
async function salvarNotasFinaisNoBanco() {
  const turmaId = selTurma.value;
  if (!turmaId) {
    alert('Selecione uma turma antes de salvar as notas finais.');
    return;
  }

  // Garante que a coluna está atualizada antes de salvar
  calcularNotasFinaisParaTodos();

  const linhas = tbody.querySelectorAll('tr');
  const notasParaSalvar = [];

  linhas.forEach(tr => {
    const raCell = tr.querySelector('td');
    const tdFinal = tr.querySelector('td.td-nota-final');
    if (!raCell || !tdFinal) return;

    const ra = raCell.textContent;
    const textoFinal = tdFinal.textContent;
    const valor = Number(textoFinal.replace(',', '.'));

    // Só envia quem tem nota final numérica
    if (!Number.isFinite(valor)) {
      return;
    }

    notasParaSalvar.push({
      codigo_turma: Number(turmaId),
      ra_aluno: Number(ra),
      valor_final: valor
    });
  });

  if (notasParaSalvar.length === 0) {
    alert('Nenhuma nota final calculada para salvar.');
    return;
  }

  try {
    const resp = await fetch('/nota-final/salvar-lote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas: notasParaSalvar })
    });

    if (!resp.ok) {
      // Se o servidor responder com status de erro, interrompe o fluxo e delega ao catch.
      throw new Error('Falha na resposta do servidor ao salvar notas finais.');
    }

    alert('Notas finais salvas com sucesso.');
  } catch (erro) {
    // Registra detalhes técnicos do erro na tentativa de salvar as notas finais.
    console.error('Erro ao salvar notas finais:', erro);
    // Notifica o usuário de que o salvamento não foi concluído com sucesso.
    alert('Erro ao salvar notas finais.');
  }
}

// Quando mudar disciplina: carrega fórmula, turmas e componentes daquela disciplina
selDisciplina.addEventListener('change', async () => {
  const idDisciplina = selDisciplina.value;
  await Promise.all([
    carregarFormulaPorDisciplina(idDisciplina),
    carregarTurmasPorDisciplina(idDisciplina),
    carregarComponentes(idDisciplina),
  ]);
});

// Quando mudar turma: carrega alunos da turma e notas dos componentes
selTurma.addEventListener('change', () => {
  const idTurma = selTurma.value;
  carregarAlunosDaTurma(idTurma);
});

// Botão para salvar as notas finais no banco
const btnSalvar = document.getElementById('btnSalvar');
if (btnSalvar) {
  btnSalvar.addEventListener('click', () => {
    salvarNotasFinaisNoBanco();
  });
}

// Inicializa a página
function init() {
  carregarDisciplinas();
}

init();