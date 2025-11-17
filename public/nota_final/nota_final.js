const formulaEl = document.getElementById('formula');
const tbody = document.getElementById('tbody');
const selTurma = document.getElementById('turma');
const selDisciplina = document.getElementById('disciplina');

// ---------- Dados dinâmicos vindos do back-end ----------
let EXPRESSAO = '';        // Fórmula da disciplina selecionada (ex.: "(P1 + P2 + T1) / 3")
let SIGLAS = [];           // Siglas dos componentes de nota da disciplina (ex.: ["P1","P2","T1"])
let COMPONENTES = [];      // Componentes completos da disciplina [{ id, sigla, nome }]
let ALUNOS = [];           // Alunos da turma selecionada [{ id, nome }]
const NOTAS = {};          // Mapa de notas por aluno e sigla: { [ra]: { [sigla]: valor } }
//--------------------------------------------------------//

console.log("Inicializando nota_final.js. SIGLAS:", SIGLAS, "COMPONENTES:", COMPONENTES);

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

function limparNotasETabela() {
  Object.keys(NOTAS).forEach(k => delete NOTAS[k]);
  tbody.innerHTML = '';
}

function resetDisciplina() {
  selDisciplina.innerHTML = '<option value="">Selecione a disciplina</option>';
}

function resetTurma() {
  selTurma.innerHTML = '<option value="">Selecione a turma</option>';
  selTurma.disabled = true;
}

function montarTabela() {
  tbody.innerHTML = '';

  if (!ALUNOS || ALUNOS.length === 0) {
    return;
  }

  ALUNOS.forEach(aluno => {
    const tr = document.createElement('tr');

    // Matrícula
    const tdMat = document.createElement('td');
    tdMat.textContent = aluno.id;
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

// Carrega disciplinas para o select de Disciplina
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

    const disciplinas = await resp.json(); // [{ id, nome, ... }]
    disciplinas.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.nome;
      selDisciplina.appendChild(opt);
    });
  } catch (erro) {
    console.error('Erro ao carregar disciplinas para notas finais:', erro);
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
      throw new Error('Falha ao buscar turmas da disciplina');
    }

    const turmas = await resp.json(); // [{ id, nome }]
    turmas.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.nome;
      selTurma.appendChild(opt);
    });

    selTurma.disabled = turmas.length === 0;
  } catch (erro) {
    console.error('Erro ao carregar turmas:', erro);
    alert('Erro ao carregar turmas da disciplina.');
  }
}

// Carrega a fórmula vigente da disciplina (apenas para visualização)
async function carregarFormulaPorDisciplina(idDisciplina) {
  try {
    EXPRESSAO = '';
    formulaEl.textContent = '';

    if (!idDisciplina) return;

    const resp = await fetch(`/formula/por_disciplina/${idDisciplina}`);
    if (!resp.ok) {
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
    console.error('Erro ao carregar fórmula da disciplina:', erro);
    formulaEl.textContent = '(erro ao carregar fórmula)';
  }
}

// Carrega componentes de nota (P1, P2, T1, ...) da disciplina
async function carregarComponentes(idDisciplina) {
  try {
    SIGLAS = [];
    limparNotasETabela();

    if (!idDisciplina) return;

    const resp = await fetch(`/componentes-nota/${idDisciplina}`);
    if (!resp.ok) {
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
    console.error('Erro ao carregar componentes de nota:', erro);
    alert('Erro ao carregar componentes de nota.');
  }
}

// Carrega alunos da turma selecionada
async function carregarAlunosDaTurma(idTurma) {
  try {
    limparNotasETabela();

    if (!idTurma) return;

    const resp = await fetch(`/turma/${idTurma}/alunos`);
    if (!resp.ok) {
      throw new Error('Falha ao buscar alunos da turma');
    }

    const alunos = await resp.json(); 
    console.log('Alunos carregados para turma', idTurma, alunos);
    ALUNOS = alunos;

    montarTabela();
    await carregarNotasDeTodosComponentesDaTurma();
    preencherNotasNaTabela();
    calcularNotasFinaisParaTodos();

  } catch (erro) {
    console.error('Erro ao carregar alunos da turma:', erro);
    alert('Erro ao carregar alunos da turma.');
  }
}

// Preenche as células da tabela com as notas carregadas do back-end
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

// Carrega notas de TODOS os componentes para a turma selecionada
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
      console.error(
        `Erro ao carregar notas existentes do componente ${componente.sigla}:`,
        erro
      );
    }
  }
}

// Calcula a Nota Final de um aluno usando a fórmula EXPRESSAO
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
    console.error('Erro ao avaliar expressão da nota final:', e);
    return undefined;
  }
}

// Percorre a tabela e preenche a coluna Nota Final para todos os alunos
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

// Envia as notas finais calculadas para o back-end (salvar em lote)
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
      throw new Error('Falha na resposta do servidor ao salvar notas finais.');
    }

    alert('Notas finais salvas com sucesso.');
  } catch (erro) {
    console.error('Erro ao salvar notas finais:', erro);
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

// Inicialização da página: carrega disciplinas disponíveis
function init() {
  carregarDisciplinas();
}

init();