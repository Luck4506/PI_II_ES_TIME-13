//Codigo de autoria de Lucas Gonçalves

const formulaEl = document.getElementById('formula');
const tbody = document.getElementById('tbody');
const btnSalvar = document.getElementById('btnSalvar');
const btnRecarregar = document.getElementById('btnRecarregar');
const selTurma = document.getElementById('turma');
const selDisciplina = document.getElementById('disciplina');
const selComponente = document.getElementById('componente');

//
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

// ---------- Dados dinâmicos vindos do back-end ----------
let EXPRESSAO = '';        // Fórmula da disciplina selecionada (ex.: "(P1 + P2 + T1) / 3")
let SIGLAS = [];           // Siglas dos componentes de nota da disciplina (ex.: ["P1","P2","T1"])
let COMPONENTES = [];      // Componentes completos da disciplina [{ id, sigla, nome }]
let ALUNOS = [];           // Alunos da turma selecionada [{ id, nome }]
const NOTAS = {};          // Mapa de notas por aluno e sigla: { [ra]: { [sigla]: valor } }
//--------------------------------------------------------//

// Limpa notas e tabela
function limparNotasETabela() {
  Object.keys(NOTAS).forEach(k => delete NOTAS[k]);
  tbody.innerHTML = '';
}

// Reseta o select de disciplina
function resetDisciplina() {
  selDisciplina.innerHTML = '<option value="">Selecione a disciplina</option>';
}

// Reseta o select de turma
function resetTurma() {
  selTurma.innerHTML = '<option value="">Selecione a turma</option>';
  selTurma.disabled = true;
}

// Reseta o select de componente
function resetComponente() {
  selComponente.innerHTML = '<option value="">Selecione o componente</option>';
  selComponente.disabled = true;
}

// Monta a tabela com alunos e inputs de notas
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
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.min = '0';
      inp.max = '10';
      inp.step = '0.01';
      inp.className = 'input-nota';
      inp.dataset.sigla = sigla; // usado para habilitar/desabilitar por componente

      // inicialmente todos os campos ficam desabilitados até que um componente seja selecionado
      inp.disabled = true;

      inp.addEventListener('input', () => {
        const v = parseFloat(inp.value);
        if (!NOTAS[aluno.ra]) NOTAS[aluno.ra] = {};
        NOTAS[aluno.ra][sigla] = Number.isFinite(v) ? v : undefined;
      });

      td.appendChild(inp);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}


// Atualiza quais inputs ficam habilitados conforme componente selecionado
function atualizarInputsPorComponenteSelecionado() {
  const siglaSelecionada = selComponente.value;
  const inputs = tbody.querySelectorAll('input.input-nota');

  inputs.forEach(inp => {
    const sigla = inp.dataset.sigla;
    const tr = inp.closest('tr');
    const tdMatricula = tr ? tr.querySelector('td') : null;
    const ra = tdMatricula ? tdMatricula.textContent : null;

    // Se nenhum componente estiver selecionado, todos os campos ficam desabilitados
    if (!siglaSelecionada) {
      inp.disabled = true;
      return;
    }

    if (sigla === siglaSelecionada) {
      inp.disabled = false;

      // Restaura o valor já digitado anteriormente (se existir) para o componente selecionado
      if (ra && NOTAS[ra] && Number.isFinite(NOTAS[ra][siglaSelecionada])) {
        inp.value = NOTAS[ra][siglaSelecionada];
      } else if (!inp.value) {
        // mantém vazio se não houver nota registrada
        inp.value = '';
      }
    } else {
      inp.disabled = true;
    }
  });
}


// Carrega disciplinas para o select de Disciplina
async function carregarDisciplinas() {
  try {
    resetDisciplina();
    resetTurma();
    resetComponente();
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
    console.error('Erro ao carregar disciplinas para lançamento de notas:', erro);
    alert('Erro ao carregar disciplinas.');
  }
}

// Carrega turmas da disciplina selecionada
async function carregarTurmasPorDisciplina(idDisciplina) {
  try {
    resetTurma();
    resetComponente();
    limparNotasETabela();
    SIGLAS = [];
    atualizarCabecalhoComponentes();

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

// Carrega a fórmula vigente da disciplina
async function carregarFormulaPorDisciplina(idDisciplina) {
  try {
    EXPRESSAO = '';
    formulaEl.textContent = '';

    if (!idDisciplina) return;

    // TODO: ajustar a rota de acordo com o back-end real
    const resp = await fetch(`/formula/por_disciplina/${idDisciplina}`);
    if (!resp.ok) {
      // Se não houver fórmula cadastrada, apenas mostra mensagem
      formulaEl.textContent = '(sem fórmula cadastrada)';
      return;
    }

    const dados = await resp.json(); // { expressao: '(... )', ... } ou objeto Formula
    EXPRESSAO = dados.Expressao || dados.expressao || '';
    formulaEl.textContent = EXPRESSAO || '(sem fórmula cadastrada)';
  } catch (erro) {
    console.error('Erro ao carregar fórmula da disciplina:', erro);
    formulaEl.textContent = '(erro ao carregar fórmula)';
  }
}

// Carrega componentes de nota (P1, P2, T1, ...) da disciplina (ou disciplina/turma)
async function carregarComponentes(idDisciplina) {
  try {
    resetComponente();
    SIGLAS = [];
    limparNotasETabela();

    if (!idDisciplina) return;

    // TODO: ajustar a rota de acordo com o back-end real
    const resp = await fetch(`/componentes-nota/${idDisciplina}`);
    if (!resp.ok) {
      throw new Error('Falha ao buscar componentes de nota');
    }

    const componentes = await resp.json(); // [{ id, sigla, nome }]
    COMPONENTES = componentes;
    SIGLAS = componentes.map(c => c.sigla);
    atualizarCabecalhoComponentes();

    selComponente.innerHTML = '<option value="">Selecione o componente</option>';
    componentes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.sigla;
      opt.textContent = `${c.sigla} - ${c.nome}`;
      selComponente.appendChild(opt);
    });
    selComponente.disabled = componentes.length === 0;

    // Se já houver alunos carregados, remonta a tabela com as novas colunas
    montarTabela();
    atualizarInputsPorComponenteSelecionado();
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
    // Normaliza os dados dos alunos para garantir que sempre tenhamos RA e nome
    ALUNOS = alunos.map(a => ({
      ra: a.ra_aluno ?? a.RA_ALUNO ?? a.ra ?? a.RA ?? a.id,
      nome: a.nome ?? a.NOME
    }));

    montarTabela();
    await carregarNotasDeTodosComponentesDaTurma();
    atualizarInputsPorComponenteSelecionado();

  } catch (erro) {
    console.error('Erro ao carregar alunos da turma:', erro);
    alert('Erro ao carregar alunos da turma.');
  }
}

// Carrega notas já cadastradas para o componente selecionado
async function carregarNotasExistentesParaComponente() {
  const siglaSelecionada = selComponente.value;
  const turmaId = selTurma.value;

  if (!siglaSelecionada || !turmaId) {
    return;
  }

  const componente = COMPONENTES.find(c => c.sigla === siglaSelecionada);
  if (!componente) {
    return;
  }

  try {
    const resp = await fetch(`/lancamento-nota/${turmaId}/${componente.id}`);
    if (!resp.ok) {
      return;
    }

    const lancamentos = await resp.json(); 

    lancamentos.forEach(l => {
      const ra = l.ra_aluno ?? l.RA_ALUNO;
      const valorBruto = l.valor ?? l.VALOR;
      const valorNum = Number(valorBruto);
      if (!Number.isFinite(valorNum)) {
        return;
      }
      if (!NOTAS[ra]) NOTAS[ra] = {};
      NOTAS[ra][siglaSelecionada] = valorNum;
    });
    preencherNotasNaTabela();
  } catch (erro) {
    console.error('Erro ao carregar notas existentes do componente:', erro);
  }
}

// Preenche notas existentes na tabela
function preencherNotasNaTabela() {
  const linhas = tbody.querySelectorAll('tr');

  linhas.forEach(tr => {
    const ra = tr.querySelector('td')?.textContent;
    if (!ra) return;

    const inputs = tr.querySelectorAll('input.input-nota');

    inputs.forEach(inp => {
      const sigla = inp.dataset.sigla;

      // se houver nota carregada, preenche
      if (NOTAS[ra] && Number.isFinite(NOTAS[ra][sigla])) {
        inp.value = NOTAS[ra][sigla];
      }
    });
  });
}

// Carrega notas de todos os componentes para todos alunos da turma
async function carregarNotasDeTodosComponentesDaTurma() {
  const turmaId = selTurma.value;

  if (!turmaId) return;
  if (!COMPONENTES || COMPONENTES.length === 0) return;

  // para cada componente
  for (const componente of COMPONENTES) {
    try {
      const resp = await fetch(`/lancamento-nota/${turmaId}/${componente.id}`);
      if (!resp.ok) {
        // se ainda não tem lançamentos para aquele componente, só ignora
        continue;
      }

      const lancamentos = await resp.json(); 

      lancamentos.forEach(l => { const ra = l.ra_aluno ?? l.RA_ALUNO; const valorBruto = l.valor ?? l.VALOR; const valorNum = Number(valorBruto);
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

// Habilita/desabilita inputs de nota conforme o componente selecionado
selComponente.addEventListener('change', async () => {
  await carregarNotasExistentesParaComponente();
  atualizarInputsPorComponenteSelecionado();
});

// Botão salvar: envia as notas do componente selecionado para o back-end
btnSalvar.addEventListener('click', async () => {
  try {
    const siglaSelecionada = selComponente.value;
    const turmaId = selTurma.value;

    if (!turmaId) {
      alert('Selecione uma turma antes de salvar.');
      return;
    }

    if (!siglaSelecionada) {
      alert('Selecione um componente de nota antes de salvar.');
      return;
    }

    const componente = COMPONENTES.find(c => c.sigla === siglaSelecionada);
    if (!componente) {
      alert('Não foi possível identificar o componente selecionado.');
      return;
    }

    const notasArray = [];

    ALUNOS.forEach(aluno => {
      const ra = aluno.ra;
      const valor = NOTAS[ra]?.[siglaSelecionada];
      if (Number.isFinite(valor)) {
        notasArray.push({
          ra_aluno: ra,
          valor
        });
      }
    });

    if (notasArray.length === 0) {
      alert('Nenhuma nota válida para salvar.');
      return;
    }

    btnSalvar.disabled = true;

    const resp = await fetch('/lancamento-nota/salvar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_turma: Number(turmaId),
        componente_id: componente.id,
        notas: notasArray
      })
    });

    if (!resp.ok) {
      console.error('Falha ao salvar notas:', await resp.text());
      alert('Erro ao salvar notas no servidor.');
      return;
    }

    alert('Notas salvas com sucesso.');
  } catch (erro) {
    console.error('Erro ao salvar notas:', erro);
    alert('Erro ao salvar notas.');
  } finally {
    btnSalvar.disabled = false;
  }
});

// Botão recarregar: recarrega alunos da turma atual e limpa notas
btnRecarregar.addEventListener('click', () => {
  Object.keys(NOTAS).forEach(k => delete NOTAS[k]);
  if (selTurma.value) {
    carregarAlunosDaTurma(selTurma.value);
  } else {
    limparNotasETabela();
  }
});

// Quando mudar disciplina: carrega fórmula, turmas e componentes daquela disciplina
selDisciplina.addEventListener('change', async () => {
  const idDisciplina = selDisciplina.value;
  await Promise.all([
    carregarFormulaPorDisciplina(idDisciplina),
    carregarTurmasPorDisciplina(idDisciplina),
    carregarComponentes(idDisciplina),
  ]);
});

// Quando mudar turma: carrega alunos da turma
selTurma.addEventListener('change', () => {
  const idTurma = selTurma.value;
  carregarAlunosDaTurma(idTurma);
});


// Inicializa carregamento da página
function init() {
  carregarDisciplinas();
}

init();