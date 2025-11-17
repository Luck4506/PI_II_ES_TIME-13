//Codigo feito por LUCAS SOARES GONÇALVES

const spanFormula = document.getElementById("formula");
const tbody = document.getElementById("tbody");
const selTurma = document.getElementById("turma");
const selDisciplina = document.getElementById("disciplina");
const statusExportacao = document.getElementById("statusExportacao");
const btnExportarCsv = document.getElementById("btnExportarCsv");

let EXPRESSAO = "";        
let SIGLAS = [];           
let COMPONENTES = [];      
let ALUNOS = [];           
const NOTAS = {};          

function atualizarCabecalhoComponentes() {
  const ths = document.querySelectorAll("th.th-componente");

  ths.forEach((th, index) => {
    const sigla = SIGLAS[index];

    if (!sigla) {
      th.textContent = "";
      th.style.display = "none";
      return;
    }

    th.textContent = sigla; // apenas a sigla
    th.style.display = "";
  });
}

function limparNotasETabela() {
  Object.keys(NOTAS).forEach((k) => delete NOTAS[k]);
  tbody.innerHTML = "";
}

function resetDisciplina() {
  selDisciplina.innerHTML = '<option value="">Selecione a disciplina</option>';
}

function resetTurma() {
  selTurma.innerHTML = '<option value="">Selecione a turma</option>';
  selTurma.disabled = true;
}

function atualizarStatusNeutro() {
  statusExportacao.textContent =
    "Selecione uma disciplina e uma turma para verificar se a exportação está disponível.";
  btnExportarCsv.disabled = true;
}


function montarTabela() {
  tbody.innerHTML = "";

  if (!ALUNOS || ALUNOS.length === 0) {
    return;
  }

  ALUNOS.forEach((aluno) => {
    const tr = document.createElement("tr");

    // Vamos assumir que o RA vem em aluno.id (como em nota_final.js)
    const ra = aluno.id ?? aluno.ra ?? aluno.RA ?? aluno.ra_aluno ?? aluno.RA_ALUNO;
    tr.dataset.ra = ra;

    // Matrícula
    const tdMat = document.createElement("td");
    tdMat.textContent = ra;
    tr.appendChild(tdMat);

    // Nome
    const tdNome = document.createElement("td");
    tdNome.textContent = aluno.nome ?? aluno.NOME ?? aluno.nome_aluno ?? aluno.NOME_ALUNO;
    tr.appendChild(tdNome);

    // Colunas de componentes de nota 
    SIGLAS.forEach((sigla) => {
      const td = document.createElement("td");
      td.className = "td-nota";
      td.dataset.sigla = sigla;
      td.textContent = "-"; // será preenchido com as notas carregadas
      tr.appendChild(td);
    });

    // Coluna de Nota Final (calculada na hora)
    const tdFinal = document.createElement("td");
    tdFinal.className = "td-nota-final";
    tdFinal.textContent = "-";
    tr.appendChild(tdFinal);

    tbody.appendChild(tr);
  });
}

// Preenche as células da tabela com as notas carregadas do back-end
function preencherNotasNaTabela() {
  const linhas = tbody.querySelectorAll("tr");

  linhas.forEach((tr) => {
    const ra = tr.dataset.ra;
    if (!ra) return;

    const notaCells = tr.querySelectorAll("td.td-nota");
    notaCells.forEach((td) => {
      const sigla = td.dataset.sigla;
      const valor = NOTAS[ra]?.[sigla];
      td.textContent = Number.isFinite(valor) ? valor.toString() : "-";
    });
  });
}


async function carregarDisciplinas() {
  try {
    resetDisciplina();
    resetTurma();
    limparNotasETabela();
    spanFormula.textContent = "";
    SIGLAS = [];
    atualizarCabecalhoComponentes();
    atualizarStatusNeutro();

    const resp = await fetch("/formula/disciplinas");
    if (!resp.ok) {
      throw new Error("Falha ao buscar disciplinas");
    }

    const disciplinas = await resp.json(); // [{ id, nome, ... }]
    disciplinas.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.nome;
      selDisciplina.appendChild(opt);
    });
  } catch (erro) {
    console.error("Erro ao carregar disciplinas para exportação:", erro);
    alert("Erro ao carregar disciplinas.");
  }
}

async function carregarTurmasPorDisciplina(idDisciplina) {
  try {
    resetTurma();
    limparNotasETabela();

    if (!idDisciplina) {
      atualizarStatusNeutro();
      return;
    }

    const resp = await fetch(`/turma/por_disciplina/${idDisciplina}`);
    if (!resp.ok) {
      throw new Error("Falha ao buscar turmas da disciplina");
    }

    const turmas = await resp.json(); // [{ id, nome }]
    turmas.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id ?? t.codigo_turma ?? t.CODIGO_TURMA;
      opt.textContent = t.nome ?? t.nome_turma ?? t.NOME_TURMA;
      selTurma.appendChild(opt);
    });

    selTurma.disabled = turmas.length === 0;
  } catch (erro) {
    console.error("Erro ao carregar turmas:", erro);
    alert("Erro ao carregar turmas da disciplina.");
  }
}

async function carregarFormulaPorDisciplina(idDisciplina) {
  try {
    EXPRESSAO = "";
    spanFormula.textContent = "";

    if (!idDisciplina) {
      spanFormula.textContent = "(nenhuma fórmula carregada)";
      return;
    }

    const resp = await fetch(`/formula/por_disciplina/${idDisciplina}`);
    if (!resp.ok) {
      spanFormula.textContent = "(sem fórmula cadastrada)";
      return;
    }

    const dados = await resp.json();
    EXPRESSAO =
      dados.EXPRESSAO ||
      dados.Expressao ||
      dados.expressao ||
      "";
    spanFormula.textContent = EXPRESSAO || "(sem fórmula cadastrada)";

    console.log("Fórmula carregada para disciplina", idDisciplina, "=>", EXPRESSAO, dados);
  } catch (erro) {
    console.error("Erro ao carregar fórmula da disciplina:", erro);
    spanFormula.textContent = "(erro ao carregar fórmula)";
  }
}

async function carregarComponentes(idDisciplina) {
  try {
    SIGLAS = [];
    limparNotasETabela();

    if (!idDisciplina) {
      atualizarCabecalhoComponentes();
      return;
    }

    const resp = await fetch(`/componentes-nota/${idDisciplina}`);
    if (!resp.ok) {
      throw new Error("Falha ao buscar componentes de nota");
    }

    const componentes = await resp.json(); // [{ id, sigla, nome }]
    console.log("Componentes carregados para disciplina", idDisciplina, componentes);
    COMPONENTES = componentes;
    SIGLAS = componentes.map((c) => c.sigla ?? c.SIGLA);
    atualizarCabecalhoComponentes();

    if (ALUNOS && ALUNOS.length > 0) {
      montarTabela();
      await carregarNotasDeTodosComponentesDaTurma();
      preencherNotasNaTabela();
      calcularNotasFinaisParaTodos();
      atualizarStatusExportacao();
    }
  } catch (erro) {
    console.error("Erro ao carregar componentes de nota:", erro);
    alert("Erro ao carregar componentes de nota.");
  }
}

async function carregarAlunosDaTurma(idTurma) {
  try {
    limparNotasETabela();

    if (!idTurma) {
      atualizarStatusNeutro();
      return;
    }

    const resp = await fetch(`/turma/${idTurma}/alunos`);
    if (!resp.ok) {
      throw new Error("Falha ao buscar alunos da turma");
    }

    const alunos = await resp.json();
    console.log("Alunos carregados para turma", idTurma, alunos);
    ALUNOS = alunos;

    montarTabela();
    await carregarNotasDeTodosComponentesDaTurma();
    preencherNotasNaTabela();
    calcularNotasFinaisParaTodos();
    atualizarStatusExportacao();
  } catch (erro) {
    console.error("Erro ao carregar alunos da turma:", erro);
    alert("Erro ao carregar alunos da turma.");
  }
}

async function carregarNotasDeTodosComponentesDaTurma() {
  const turmaId = selTurma.value;
  console.log("carregarNotasDeTodosComponentesDaTurma() - turmaId:", turmaId, "COMPONENTES:", COMPONENTES);

  if (!turmaId) return;
  if (!COMPONENTES || COMPONENTES.length === 0) return;

  for (const componente of COMPONENTES) {
    try {
      const compId = componente.id ?? componente.ID ?? componente.componente_nota_id ?? componente.COMPONENTE_NOTA_ID;
      if (!compId) continue;

      console.log("Buscando lançamentos para turma", turmaId, "componente", componente);
      const resp = await fetch(`/lancamento-nota/${turmaId}/${compId}`);
      if (!resp.ok) {
        continue;
      }

      const lancamentos = await resp.json();
      console.log("Lançamentos recebidos para componente", componente.sigla ?? componente.SIGLA, lancamentos);

      lancamentos.forEach((l) => {
        const ra = l.ra_aluno ?? l.RA_ALUNO ?? l.ra ?? l.RA;
        const valorBruto = l.valor ?? l.VALOR;
        const valorNum = Number(valorBruto);
        if (!Number.isFinite(valorNum)) {
          return;
        }
        if (!NOTAS[ra]) NOTAS[ra] = {};
        const sigla = componente.sigla ?? componente.SIGLA;
        NOTAS[ra][sigla] = valorNum;
      });
    } catch (erro) {
      console.error(`Erro ao carregar notas existentes do componente ${componente.sigla}:`, erro);
    }
  }
}

// Cálculo da Nota Final (igual à tela de nota_final)

function calcularNotaFinalParaAluno(ra) {
  if (!EXPRESSAO || !EXPRESSAO.trim()) return undefined;
  if (!NOTAS[ra]) return undefined;

  let expr = EXPRESSAO;

  for (const sigla of SIGLAS) {
    const valor = NOTAS[ra][sigla];
    if (!Number.isFinite(valor)) {
      return undefined;
    }
    const regex = new RegExp(`\\b${sigla}\\b`, "g");
    expr = expr.replace(regex, valor.toString());
  }

  try {
    const resultado = eval(expr); // já usado em nota_final.js
    if (!Number.isFinite(resultado)) return undefined;
    return Number(resultado.toFixed(2));
  } catch (e) {
    console.error("Erro ao avaliar expressão da nota final:", e);
    return undefined;
  }
}

function calcularNotasFinaisParaTodos() {
  const linhas = tbody.querySelectorAll("tr");

  linhas.forEach((tr) => {
    const ra = tr.dataset.ra;
    if (!ra) return;

    const tdFinal = tr.querySelector("td.td-nota-final");
    if (!tdFinal) return;

    const notaFinal = calcularNotaFinalParaAluno(ra);
    tdFinal.textContent = Number.isFinite(notaFinal) ? notaFinal.toString() : "-";
  });
}


function verificarNotasCompletas() {
  const pendencias = [];

  ALUNOS.forEach((aluno) => {
    const ra = aluno.id ?? aluno.ra ?? aluno.RA ?? aluno.ra_aluno ?? aluno.RA_ALUNO;
    const mapa = NOTAS[ra] || {};

    SIGLAS.forEach((sigla) => {
      const valor = mapa[sigla];
      if (!Number.isFinite(valor)) {
        const nome = aluno.nome ?? aluno.NOME ?? aluno.nome_aluno ?? aluno.NOME_ALUNO;
        pendencias.push({ ra, nome, sigla });
      }
    });
  });

  return {
    ok: pendencias.length === 0,
    pendencias,
  };
}

function atualizarStatusExportacao() {
  if (!ALUNOS.length || !SIGLAS.length) {
    atualizarStatusNeutro();
    return;
  }

  const { ok, pendencias } = verificarNotasCompletas();

  if (!ok) {
    const mensagens = pendencias.slice(0, 5).map(
      (p) => `RA ${p.ra} (${p.nome}) sem nota em ${p.sigla}`
    );
    let msg =
      "Ainda há notas pendentes. A exportação só é permitida quando todas as notas forem lançadas.";
    if (mensagens.length) {
      msg += " Exemplos: " + mensagens.join("; ") + (pendencias.length > 5 ? " ..." : "");
    }
    statusExportacao.textContent = msg;
    btnExportarCsv.disabled = true;
  } else {
    statusExportacao.textContent =
      "Todas as notas dos componentes foram lançadas. Você pode exportar o CSV.";
    btnExportarCsv.disabled = false;
  }
}

// Exportação CSV
function exportarCsv() {
  const { ok, pendencias } = verificarNotasCompletas();

  if (!ok) {
    alert(
      "Ainda existem alunos sem todas as notas lançadas. Não é possível exportar.\n" +
        "Exemplo: RA " +
        pendencias[0].ra +
        " (" +
        pendencias[0].nome +
        ") sem nota em " +
        pendencias[0].sigla
    );
    return;
  }

  if (!ALUNOS.length) {
    alert("Não há alunos para exportar.");
    return;
  }

  calcularNotasFinaisParaTodos();

  const cabecalho = ["Matricula", "Aluno", ...SIGLAS, "NotaFinal"];

  const linhas = [cabecalho];

  const linhasTabela = tbody.querySelectorAll("tr");
  linhasTabela.forEach((tr) => {
    const ra = tr.dataset.ra;
    const aluno = ALUNOS.find((a) =>
      String(a.id ?? a.ra ?? a.RA ?? a.ra_aluno ?? a.RA_ALUNO) === String(ra)
    );
    const nome = aluno
      ? aluno.nome ?? aluno.NOME ?? aluno.nome_aluno ?? aluno.NOME_ALUNO
      : "";
    const mapaNotas = NOTAS[ra] || {};
    const notasComp = SIGLAS.map((sigla) => {
      const v = mapaNotas[sigla];
      return Number.isFinite(v) ? String(v) : "";
    });
    const tdNotaFinal = tr.querySelector("td.td-nota-final");
    const notaFinalTexto = tdNotaFinal ? tdNotaFinal.textContent ?? "" : "";
    const linha = [ra, nome, ...notasComp, notaFinalTexto];
    linhas.push(linha);
  });

  // Monta o CSV 
  const conteudoCsv = linhas
    .map((cols) =>
      cols
        .map((c) => {
          const texto = c == null ? "" : String(c);
          // Escapa aspas duplas
          const esc = texto.replace(/"/g, '""');
          return `"${esc}"`;
        })
        .join(";")
    )
    .join("\r\n");

  const blob = new Blob([conteudoCsv], { type: "text/csv;charset=utf-8;" });

  // Gera nome do arquivo: YYYY-MM-DD_HHmmss-TurmaX_Sigla.csv
  const agora = new Date();
  const yyyy = agora.getFullYear();
  const mm = String(agora.getMonth() + 1).padStart(2, "0");
  const dd = String(agora.getDate()).padStart(2, "0");
  const hh = String(agora.getHours()).padStart(2, "0");
  const mi = String(agora.getMinutes()).padStart(2, "0");
  const ss = String(agora.getSeconds()).padStart(2, "0");

  const turmaTexto =
    selTurma.options[selTurma.selectedIndex]?.textContent?.trim() ?? "Turma";
  const disciplinaTexto =
    selDisciplina.options[selDisciplina.selectedIndex]?.textContent?.trim() ?? "Disciplina";

  const disciplinaSlug = disciplinaTexto.replace(/\s+/g, "_");
  const turmaSlug = turmaTexto.replace(/\s+/g, "_");

  const nomeArquivo = `${yyyy}-${mm}-${dd}_${hh}${mi}${ss}-${turmaSlug}_${disciplinaSlug}.csv`;

  // Dispara download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


function configurarSeletores() {
  // Quando muda a disciplina
  selDisciplina.addEventListener("change", async () => {
    const disciplinaId = selDisciplina.value;
    resetTurma();
    limparNotasETabela();
    spanFormula.textContent = "";
    SIGLAS = [];
    atualizarCabecalhoComponentes();
    atualizarStatusNeutro();

    if (!disciplinaId) {
      atualizarStatusNeutro();
      return;
    }

    await carregarFormulaPorDisciplina(disciplinaId);
    await carregarComponentes(disciplinaId);
    await carregarTurmasPorDisciplina(disciplinaId);
    atualizarStatusNeutro();
  });

  // Quando muda a turma
  selTurma.addEventListener("change", async () => {
    const turmaId = selTurma.value;
    limparNotasETabela();
    if (!turmaId) {
      atualizarStatusNeutro();
      btnExportarCsv.disabled = true;
      return;
    }
    await carregarAlunosDaTurma(turmaId);
  });

  // Exportar CSV
  btnExportarCsv.addEventListener("click", () => {
    try {
      exportarCsv();
    } catch (erro) {
      console.error("Erro ao exportar CSV:", erro);
      alert("Erro ao exportar o arquivo CSV.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  configurarSeletores();
  carregarDisciplinas();
});