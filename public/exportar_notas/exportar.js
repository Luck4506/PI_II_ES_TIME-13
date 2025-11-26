//Codigo feito por LUCAS SOARES GONÇALVES

const spanFormula = document.getElementById("formula");
// Corpo da tabela que exibirá linhas de alunos, notas dos componentes e nota final.
const tbody = document.getElementById("tbody");
const selTurma = document.getElementById("turma");
const selDisciplina = document.getElementById("disciplina");
const statusExportacao = document.getElementById("statusExportacao");
const btnExportarCsv = document.getElementById("btnExportarCsv");

// Expressão da fórmula usada para calcular a nota final (ex.: "(P1 + P2 + T1) / 3").
let EXPRESSAO = "";        
// Vetor com as siglas dos componentes de nota da disciplina (ex.: ["P1", "P2", "T1"]).
let SIGLAS = [];           
// Componentes completos da disciplina selecionada (id, sigla, nome, etc.).
let COMPONENTES = [];      
let ALUNOS = [];           // Alunos da turma selecionada [{ ra, nome }]
// Mapa de notas em memória no formato { [ra]: { [sigla]: valor } }.
const NOTAS = {};          

// Atualiza o cabeçalho com as siglas dos componentes
// Seleciona os cabeçalhos das colunas de componentes de nota (P1, P2, T1 etc.).
function atualizarCabecalhoComponentes() {
  // Esses <th> serão atualizados com as siglas armazenadas no vetor SIGLAS.
  const ths = document.querySelectorAll("th.th-componente");

  // Para cada cabeçalho, pega a sigla correspondente pelo índice.
  ths.forEach((th, index) => {
    const sigla = SIGLAS[index];

    if (!sigla) {
      // Se não existir sigla para este índice, esconde a coluna da tabela.
      th.textContent = "";
      th.style.display = "none";
      return;
    }

    // Quando há sigla, mostra o cabeçalho com o texto da sigla do componente.
    th.textContent = sigla; // apenas a sigla
    th.style.display = "";
  });
}

// Limpa todas as notas e a tabela
// Remove todas as notas carregadas em memória e limpa as linhas da tabela na tela.
function limparNotasETabela() {
  // Apaga todas as propriedades do objeto NOTAS, reiniciando o mapa de notas.
  Object.keys(NOTAS).forEach((k) => delete NOTAS[k]);
  // Remove todas as linhas exibidas no <tbody> da tabela.
  tbody.innerHTML = "";
}

// Reseta o select de disciplina
// Volta o select de disciplina para o estado inicial (apenas a opção padrão).
function resetDisciplina() {
  // Substitui qualquer lista anterior de disciplinas pela opção de instrução.
  selDisciplina.innerHTML = '<option value="">Selecione a disciplina</option>';
}

// Reseta o select de turma
// Limpa e desabilita o select de turma até que uma disciplina válida seja escolhida.
function resetTurma() {
  // Remove todas as turmas anteriores e deixa apenas a opção padrão.
  selTurma.innerHTML = '<option value="">Selecione a turma</option>';
  // Impede interação com o select de turma enquanto não houver dados carregados.
  selTurma.disabled = true;
}

// Atualiza status inicial da exportação
// Define mensagem neutra quando disciplina e turma ainda não foram selecionadas.
function atualizarStatusNeutro() {
  // Informa ao usuário que precisa selecionar disciplina e turma antes de exportar.
  statusExportacao.textContent =
    "Selecione uma disciplina e uma turma para verificar se a exportação está disponível.";
  // Garante que o botão de exportação permaneça desabilitado nesse estado.
  btnExportarCsv.disabled = true;
}


// Monta a tabela com alunos e componentes
// Constrói dinamicamente a tabela de alunos, componentes de nota e nota final.
function montarTabela() {
  // Limpa qualquer conteúdo anterior do corpo da tabela.
  tbody.innerHTML = "";

  // Se ainda não há alunos carregados, não há linhas para montar.
  if (!ALUNOS || ALUNOS.length === 0) {
    return;
  }

  ALUNOS.forEach((aluno) => {
    // Cria uma nova linha de tabela para representar o aluno atual.
    const tr = document.createElement("tr");

    // Usa o RA normalizado como identificador único para a linha e para o mapa de notas.
    // RA já normalizado no objeto ALUNOS
    const ra = aluno.ra;
    // Armazena o RA no dataset da linha para facilitar buscas posteriores.
    tr.dataset.ra = ra;

    // Matrícula
    // Cria a célula de matrícula (RA) do aluno.
    const tdMat = document.createElement("td");
    tdMat.textContent = ra;
    tr.appendChild(tdMat);

    // Nome
    // Cria a célula que exibirá o nome do aluno.
    const tdNome = document.createElement("td");
    tdNome.textContent = aluno.nome;
    tr.appendChild(tdNome);

    // Colunas de componentes de nota 
    // Para cada componente de nota da disciplina, cria uma coluna correspondente.
    SIGLAS.forEach((sigla) => {
      // Cria uma célula para exibir a nota do componente identificado pela sigla.
      const td = document.createElement("td");
      // Marca a célula com a classe usada depois para localizar e preencher as notas.
      td.className = "td-nota";
      // Salva a sigla do componente no dataset, para sabermos qual nota pertence aqui.
      td.dataset.sigla = sigla;
      td.textContent = "-"; // será preenchido com as notas carregadas
      tr.appendChild(td);
    });

    // Coluna de Nota Final (calculada na hora)
    // Cria a célula responsável por exibir a nota final calculada para o aluno.
    const tdFinal = document.createElement("td");
    // Usa uma classe específica para localizar a coluna de nota final posteriormente.
    tdFinal.className = "td-nota-final";
    tdFinal.textContent = "-";
    tr.appendChild(tdFinal);

    // Adiciona a linha montada ao corpo da tabela.
    tbody.appendChild(tr);
  });
}

// Preenche as notas dos componentes na tabela
// Percorre a tabela e preenche cada célula de componente com a nota armazenada em NOTAS.
function preencherNotasNaTabela() {
  // Seleciona todas as linhas de alunos que já foram montadas na tabela.
  const linhas = tbody.querySelectorAll("tr");

  linhas.forEach((tr) => {
    // Recupera o RA associado à linha, usado como chave no mapa de notas.
    const ra = tr.dataset.ra;
    if (!ra) return;

    // Localiza todas as células de nota (uma por componente) dentro da linha.
    const notaCells = tr.querySelectorAll("td.td-nota");
    notaCells.forEach((td) => {
      // Identifica qual componente de nota (sigla) esta célula representa.
      const sigla = td.dataset.sigla;
      // Busca no mapa NOTAS o valor correspondente a esse RA e a essa sigla.
      const valor = NOTAS[ra]?.[sigla];
      td.textContent = Number.isFinite(valor) ? valor.toString() : "-";
    });
  });
}


// Carrega disciplinas disponíveis
// Busca no back-end as disciplinas que possuem fórmula cadastrada e preenche o select.
async function carregarDisciplinas() {
  try {
    // Limpa todo o estado anterior (selects, tabela, fórmula e siglas) antes de recarregar.
    resetDisciplina();
    resetTurma();
    limparNotasETabela();
    spanFormula.textContent = "";
    SIGLAS = [];
    atualizarCabecalhoComponentes();
    atualizarStatusNeutro();

    // Chama a rota que retorna as disciplinas disponíveis para cálculo de nota final.
    const resp = await fetch("/formula/disciplinas");
    if (!resp.ok) {
      throw new Error("Falha ao buscar disciplinas");
    }

    // Converte a resposta HTTP em uma lista de objetos disciplina.
    const disciplinas = await resp.json(); // [{ id, nome, ... }]
    // Para cada disciplina, cria uma opção no select de disciplinas da interface.
    disciplinas.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.nome;
      selDisciplina.appendChild(opt);
    });
  } catch (erro) {
    // Registra no console detalhes do erro ocorrido ao carregar disciplinas.
    console.error("Erro ao carregar disciplinas para exportação:", erro);
    // Exibe mensagem genérica para o usuário informando que houve falha na carga.
    alert("Erro ao carregar disciplinas.");
  }
}

// Carrega turmas da disciplina selecionada
// Dada uma disciplina, carrega as turmas associadas a ela e preenche o select de turmas.
async function carregarTurmasPorDisciplina(idDisciplina) {
  try {
    // Limpa a lista de turmas e o conteúdo da tabela ao trocar de disciplina.
    resetTurma();
    limparNotasETabela();

    // Se nenhuma disciplina estiver selecionada, volta para o estado neutro.
    if (!idDisciplina) {
      atualizarStatusNeutro();
      return;
    }

    // Requisita ao servidor as turmas vinculadas à disciplina informada.
    const resp = await fetch(`/turma/por_disciplina/${idDisciplina}`);
    if (!resp.ok) {
      throw new Error("Falha ao buscar turmas da disciplina");
    }

    // Converte a resposta em uma lista de turmas com identificador e nome.
    const turmas = await resp.json(); // [{ id, nome }]
    // Cria uma opção para cada turma retornada, tratando variações de campos.
    turmas.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id ?? t.codigo_turma ?? t.CODIGO_TURMA;
      opt.textContent = t.nome ?? t.nome_turma ?? t.NOME_TURMA;
      selTurma.appendChild(opt);
    });

    selTurma.disabled = turmas.length === 0;
  } catch (erro) {
    // Log de erro caso ocorra falha na busca de turmas.
    console.error("Erro ao carregar turmas:", erro);
    // Alerta o usuário de que não foi possível carregar as turmas.
    alert("Erro ao carregar turmas da disciplina.");
  }
}

// Carrega a fórmula da disciplina
// Carrega a fórmula de cálculo da nota final para a disciplina selecionada.
async function carregarFormulaPorDisciplina(idDisciplina) {
  try {
    // Limpa a expressão e o texto exibido antes de carregar a nova fórmula.
    EXPRESSAO = "";
    spanFormula.textContent = "";

    // Se nenhuma disciplina estiver selecionada, apenas mostra mensagem padrão.
    if (!idDisciplina) {
      spanFormula.textContent = "(nenhuma fórmula carregada)";
      return;
    }

    // Solicita ao back-end a fórmula vinculada à disciplina informada.
    const resp = await fetch(`/formula/por_disciplina/${idDisciplina}`);
    if (!resp.ok) {
      spanFormula.textContent = "(sem fórmula cadastrada)";
      return;
    }

    // Converte a resposta em objeto e tenta ler a expressão considerando variações de nome.
    const dados = await resp.json();
    EXPRESSAO =
      dados.EXPRESSAO ||
      dados.Expressao ||
      dados.expressao ||
      "";
    spanFormula.textContent = EXPRESSAO || "(sem fórmula cadastrada)";

    console.log("Fórmula carregada para disciplina", idDisciplina, "=>", EXPRESSAO, dados);
  } catch (erro) {
    // Em caso de erro na comunicação ou parsing, registra o erro no console.
    console.error("Erro ao carregar fórmula da disciplina:", erro);
    // Mostra ao usuário que houve problema ao carregar a fórmula.
    spanFormula.textContent = "(erro ao carregar fórmula)";
  }
}

// Carrega os componentes de nota da disciplina
// Carrega os componentes de nota (P1, P2, T1, etc.) da disciplina selecionada.
async function carregarComponentes(idDisciplina) {
  try {
    // Limpa a lista de siglas e a tabela para reconstrução com a nova configuração.
    SIGLAS = [];
    limparNotasETabela();

    // Se nenhuma disciplina for escolhida, apenas atualiza cabeçalhos e encerra.
    if (!idDisciplina) {
      atualizarCabecalhoComponentes();
      return;
    }

    // Busca no servidor os componentes de nota da disciplina especificada.
    const resp = await fetch(`/componentes-nota/${idDisciplina}`);
    if (!resp.ok) {
      throw new Error("Falha ao buscar componentes de nota");
    }

    // Converte a resposta em uma lista de componentes com id, sigla e nome.
    const componentes = await resp.json(); // [{ id, sigla, nome }]
    console.log("Componentes carregados para disciplina", idDisciplina, componentes);
    // Armazena a lista completa de componentes e extrai apenas as siglas para SIGLAS.
    COMPONENTES = componentes;
    SIGLAS = componentes.map((c) => c.sigla ?? c.SIGLA);
    atualizarCabecalhoComponentes();

    // Se já existem alunos carregados, reconstrói a tabela e atualiza notas e status.
    if (ALUNOS && ALUNOS.length > 0) {
      montarTabela();
      await carregarNotasDeTodosComponentesDaTurma();
      preencherNotasNaTabela();
      calcularNotasFinaisParaTodos();
      atualizarStatusExportacao();
    }
  } catch (erro) {
    // Log de erro caso a busca de componentes falhe.
    console.error("Erro ao carregar componentes de nota:", erro);
    // Informa o usuário sobre a falha na carga dos componentes.
    alert("Erro ao carregar componentes de nota.");
  }
}

// Carrega alunos da turma escolhida
// Carrega os alunos da turma selecionada e prepara a tela para exibir suas notas.
async function carregarAlunosDaTurma(idTurma) {
  try {
    // Limpa qualquer dado antigo de notas e linhas da tabela antes de carregar nova turma.
    limparNotasETabela();

    // Se nenhuma turma válida foi escolhida, volta para estado neutro e interrompe.
    if (!idTurma) {
      atualizarStatusNeutro();
      return;
    }

    // Solicita ao servidor a lista de alunos vinculados à turma informada.
    const resp = await fetch(`/turma/${idTurma}/alunos`);
    if (!resp.ok) {
      throw new Error("Falha ao buscar alunos da turma");
    }

    // Converte a resposta em uma lista de objetos aluno.
    const alunos = await resp.json();
    console.log("Alunos carregados para turma", idTurma, alunos);
    // Normaliza cada aluno para o formato { ra, nome }, independente do nome dos campos retornados.
    ALUNOS = alunos.map((a) => ({
      ra: a.ra_aluno ?? a.RA_ALUNO ?? a.ra ?? a.RA ?? a.id,
      nome: a.nome ?? a.NOME ?? a.nome_aluno ?? a.NOME_ALUNO
    }));

    // Constrói a tabela na interface com a nova lista de alunos.
    montarTabela();
    // Em seguida, busca todas as notas já lançadas para os componentes desta turma.
    await carregarNotasDeTodosComponentesDaTurma();
    // Preenche as células com os valores de notas carregados do servidor.
    preencherNotasNaTabela();
    // Calcula e exibe a nota final de cada aluno com base na fórmula configurada.
    calcularNotasFinaisParaTodos();
    // Atualiza mensagem de status indicando se já é possível exportar.
    atualizarStatusExportacao();
  } catch (erro) {
    // Registra no console detalhes de eventual erro ao buscar os alunos.
    console.error("Erro ao carregar alunos da turma:", erro);
    // Exibe alerta informando que não foi possível carregar os alunos.
    alert("Erro ao carregar alunos da turma.");
  }
}

// Carrega notas de todos os componentes para a turma
// Para cada componente configurado, busca as notas já lançadas para a turma atual e preenche NOTAS.
async function carregarNotasDeTodosComponentesDaTurma() {
  // Lê o identificador da turma atualmente selecionada.
  const turmaId = selTurma.value;
  console.log("carregarNotasDeTodosComponentesDaTurma() - turmaId:", turmaId, "COMPONENTES:", COMPONENTES);

  // Se não houver turma ou componentes, não há notas para carregar.
  if (!turmaId) return;
  if (!COMPONENTES || COMPONENTES.length === 0) return;

  for (const componente of COMPONENTES) {
    try {
      // Descobre o ID do componente de nota, tratando diferentes nomes de campo.
      const compId = componente.id ?? componente.ID ?? componente.componente_nota_id ?? componente.COMPONENTE_NOTA_ID;
      // Se não constar um ID válido, ignora este componente e passa para o próximo.
      if (!compId) continue;

      console.log("Buscando lançamentos para turma", turmaId, "componente", componente);
      // Busca no servidor os lançamentos de nota desse componente para a turma.
      const resp = await fetch(`/lancamento-nota/${turmaId}/${compId}`);
      // Se a resposta não for bem-sucedida, pula este componente sem interromper o laço.
      if (!resp.ok) {
        continue;
      }

      // Converte a resposta em uma lista de lançamentos (RA e valor da nota).
      const lancamentos = await resp.json();
      console.log("Lançamentos recebidos para componente", componente.sigla ?? componente.SIGLA, lancamentos);

      lancamentos.forEach((l) => {
        // Obtém o RA do aluno a partir do lançamento, tratando variações de campo.
        const ra = l.ra_aluno ?? l.RA_ALUNO ?? l.ra ?? l.RA;
        // Lê o valor bruto da nota que veio do back-end.
        const valorBruto = l.valor ?? l.VALOR;
        // Converte a nota para número para permitir validações e cálculos.
        const valorNum = Number(valorBruto);
        if (!Number.isFinite(valorNum)) {
          return;
        }
        // Se ainda não existir um mapa de notas para esse RA, inicializa o objeto.
        if (!NOTAS[ra]) NOTAS[ra] = {};
        // Determina a sigla usada como chave (P1, P2, T1 etc.) para esse componente.
        const sigla = componente.sigla ?? componente.SIGLA;
        NOTAS[ra][sigla] = valorNum;
      });
    } catch (erro) {
      // Em caso de erro na busca de notas de um componente específico, registra o problema no console.
      console.error(`Erro ao carregar notas existentes do componente ${componente.sigla}:`, erro);
    }
  }
}

// Calcula a nota final de um aluno
// Calcula a nota final de um aluno substituindo as siglas na fórmula pelos valores numéricos.
function calcularNotaFinalParaAluno(ra) {
  // Se não existe fórmula configurada, não é possível calcular a nota final.
  if (!EXPRESSAO || !EXPRESSAO.trim()) return undefined;
  // Se não há notas armazenadas para esse RA, retorna indefinido.
  if (!NOTAS[ra]) return undefined;

  // Faz uma cópia da expressão original para ir substituindo as siglas.
  let expr = EXPRESSAO;

  for (const sigla of SIGLAS) {
    // Recupera a nota do componente correspondente à sigla para este aluno.
    const valor = NOTAS[ra][sigla];
    // Se algum componente não possuir nota válida, interrompe o cálculo da nota final.
    if (!Number.isFinite(valor)) {
      return undefined;
    }
    // Cria expressão regular para substituir apenas ocorrências isoladas da sigla.
    const regex = new RegExp(`\\b${sigla}\\b`, "g");
    // Substitui a sigla na expressão pelo valor numérico da nota.
    expr = expr.replace(regex, valor.toString());
  }

  try {
    // Avalia a expressão matemática gerada com base nas notas dos componentes.
    const resultado = eval(expr); // já usado em nota_final.js
    if (!Number.isFinite(resultado)) return undefined;
    return Number(resultado.toFixed(2));
  } catch (e) {
    // Caso a expressão seja inválida ou cause erro, registra no console e retorna indefinido.
    console.error("Erro ao avaliar expressão da nota final:", e);
    return undefined;
  }
}

// Calcula a nota final de todos os alunos
// Percorre as linhas da tabela e preenche a coluna de nota final para cada aluno.
function calcularNotasFinaisParaTodos() {
  // Seleciona todas as linhas de alunos exibidas atualmente na tabela.
  const linhas = tbody.querySelectorAll("tr");

  linhas.forEach((tr) => {
    // Lê o RA associado à linha para identificar o aluno nas estruturas em memória.
    const ra = tr.dataset.ra;
    if (!ra) return;

    // Localiza a célula responsável por exibir a nota final daquele aluno.
    const tdFinal = tr.querySelector("td.td-nota-final");
    if (!tdFinal) return;

    // Calcula a nota final do aluno invocando a função de cálculo com base na fórmula.
    const notaFinal = calcularNotaFinalParaAluno(ra);
    tdFinal.textContent = Number.isFinite(notaFinal) ? notaFinal.toString() : "-";
  });
}


// Verifica se todos os alunos têm notas completas
// Verifica se todos os alunos possuem nota lançada em todos os componentes da disciplina.
function verificarNotasCompletas() {
  // Vetor que armazenará as pendências (aluno, RA e componente sem nota).
  const pendencias = [];

  ALUNOS.forEach((aluno) => {
    // Para cada aluno, obtém o mapa de notas utilizando o RA como chave.
    const ra = aluno.ra;
    const mapa = NOTAS[ra] || {};

    SIGLAS.forEach((sigla) => {
      // Recupera a nota do componente atual (sigla) para esse aluno.
      const valor = mapa[sigla];
      if (!Number.isFinite(valor)) {
        const nome = aluno.nome;
        // Caso não exista nota válida, adiciona uma pendência com RA, nome e sigla.
        pendencias.push({ ra, nome, sigla });
      }
    });
  });

  // Retorna se está tudo ok (sem pendências) e a lista detalhada das pendências encontradas.
  return {
    ok: pendencias.length === 0,
    pendencias,
  };
}

// Atualiza status para liberar ou bloquear a exportação
// Atualiza a mensagem e o botão de exportação com base na existência ou não de pendências.
function atualizarStatusExportacao() {
  // Se não há alunos ou componentes carregados, ainda não é possível exportar.
  if (!ALUNOS.length || !SIGLAS.length) {
    atualizarStatusNeutro();
    return;
  }

  // Consulta se todas as notas estão completas ou se ainda há pendências.
  const { ok, pendencias } = verificarNotasCompletas();

  if (!ok) {
    // Monta uma lista resumida de mensagens de exemplo com algumas pendências.
    const mensagens = pendencias.slice(0, 5).map(
      (p) => `RA ${p.ra} (${p.nome}) sem nota em ${p.sigla}`
    );
    // Mensagem base explicando por que a exportação está bloqueada.
    let msg =
      "Ainda há notas pendentes. A exportação só é permitida quando todas as notas forem lançadas.";
    if (mensagens.length) {
      msg += " Exemplos: " + mensagens.join("; ") + (pendencias.length > 5 ? " ..." : "");
    }
    // Atualiza o texto na tela e mantém o botão de exportação desabilitado.
    statusExportacao.textContent = msg;
    btnExportarCsv.disabled = true;
  } else {
    // Quando não há pendências, libera a exportação e informa isso ao usuário.
    statusExportacao.textContent =
      "Todas as notas dos componentes foram lançadas. Você pode exportar o CSV.";
    btnExportarCsv.disabled = false;
  }
}

// Exporta os dados em arquivo CSV
// Gera o conteúdo CSV com base na tabela de alunos/notas e dispara o download do arquivo.
function exportarCsv() {
  // Confere novamente se todas as notas estão completas antes de exportar.
  const { ok, pendencias } = verificarNotasCompletas();

  // Se ainda houver qualquer pendência, impede a exportação e alerta o usuário.
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

  // Se não há alunos carregados, não faz sentido gerar um CSV.
  if (!ALUNOS.length) {
    alert("Não há alunos para exportar.");
    return;
  }

  // Atualiza a coluna de nota final na tabela antes de montar o arquivo CSV.
  calcularNotasFinaisParaTodos();

  // Define a primeira linha do CSV com os nomes das colunas.
  const cabecalho = ["Matricula", "Aluno", ...SIGLAS, "NotaFinal"];

  // Vetor de linhas que representará todo o conteúdo do CSV.
  const linhas = [cabecalho];

  const linhasTabela = tbody.querySelectorAll("tr");
  linhasTabela.forEach((tr) => {
    // Lê o RA armazenado no dataset da linha.
    const ra = tr.dataset.ra;
    // Localiza o objeto aluno correspondente a esse RA no vetor ALUNOS.
    const aluno = ALUNOS.find((a) => String(a.ra) === String(ra));
    const nome = aluno ? aluno.nome : "";
    // Recupera o mapa de notas do aluno atual através do RA.
    const mapaNotas = NOTAS[ra] || {};
    // Para cada sigla de componente, pega a nota correspondente para montar a linha do CSV.
    const notasComp = SIGLAS.map((sigla) => {
      const v = mapaNotas[sigla];
      return Number.isFinite(v) ? String(v) : "";
    });
    // Busca na linha a célula de nota final para extrair o valor exibido.
    const tdNotaFinal = tr.querySelector("td.td-nota-final");
    const notaFinalTexto = tdNotaFinal ? tdNotaFinal.textContent ?? "" : "";
    // Monta o array que representa uma linha completa (RA, nome, notas, nota final).
    const linha = [ra, nome, ...notasComp, notaFinalTexto];
    linhas.push(linha);
  });

  // Monta o CSV 
  // Converte o array de linhas em uma string CSV, escapando aspas e separando com ';'.
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

  // Cria um Blob com o conteúdo CSV para possibilitar o download como arquivo.
  const blob = new Blob([conteudoCsv], { type: "text/csv;charset=utf-8;" });

  // Gera um carimbo de data/hora para compor o nome do arquivo de exportação.
  const agora = new Date();
  const yyyy = agora.getFullYear();
  const mm = String(agora.getMonth() + 1).padStart(2, "0");
  const dd = String(agora.getDate()).padStart(2, "0");
  const hh = String(agora.getHours()).padStart(2, "0");
  const mi = String(agora.getMinutes()).padStart(2, "0");
  const ss = String(agora.getSeconds()).padStart(2, "0");

  // Recupera os textos da turma e da disciplina selecionadas para incluir no nome do arquivo.
  const turmaTexto =
    selTurma.options[selTurma.selectedIndex]?.textContent?.trim() ?? "Turma";
  const disciplinaTexto =
    selDisciplina.options[selDisciplina.selectedIndex]?.textContent?.trim() ?? "Disciplina";

  const disciplinaSlug = disciplinaTexto.replace(/\s+/g, "_");
  const turmaSlug = turmaTexto.replace(/\s+/g, "_");

  // Monta o nome final do arquivo CSV com data, hora, turma e disciplina.
  const nomeArquivo = `${yyyy}-${mm}-${dd}_${hh}${mi}${ss}-${turmaSlug}_${disciplinaSlug}.csv`;

  // Dispara download
  // Cria uma URL temporária apontando para o Blob com o conteúdo CSV.
  const url = URL.createObjectURL(blob);
  // Cria dinamicamente uma âncora <a> para simular o clique de download.
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoga a URL temporária para liberar recursos de memória após o download.
  URL.revokeObjectURL(url);
}


// Configura eventos dos selects e botões
// Configura os eventos de mudança nos selects e o clique no botão de exportação.
function configurarSeletores() {
  // Quando o usuário altera a disciplina selecionada:
  // Quando muda a disciplina
  selDisciplina.addEventListener("change", async () => {
    // Lê o ID da disciplina selecionada no select.
    const disciplinaId = selDisciplina.value;
    // Limpa turmas, notas, fórmula e siglas da seleção anterior antes de recarregar.
    resetTurma();
    limparNotasETabela();
    spanFormula.textContent = "";
    SIGLAS = [];
    atualizarCabecalhoComponentes();
    atualizarStatusNeutro();

    // Se a disciplina não for válida, volta ao status neutro e não continua o fluxo.
    if (!disciplinaId) {
      atualizarStatusNeutro();
      return;
    }

    // Carrega fórmula, componentes e turmas associadas à disciplina escolhida.
    await carregarFormulaPorDisciplina(disciplinaId);
    await carregarComponentes(disciplinaId);
    await carregarTurmasPorDisciplina(disciplinaId);
    atualizarStatusNeutro();
  });

  // Quando o usuário altera a turma selecionada:
  // Quando muda a turma
  selTurma.addEventListener("change", async () => {
    // Lê o ID da turma selecionada.
    const turmaId = selTurma.value;
    // Limpa dados atuais da tabela antes de carregar uma nova turma.
    limparNotasETabela();
    // Se nenhuma turma for selecionada, volta ao estado neutro e desabilita o botão.
    if (!turmaId) {
      atualizarStatusNeutro();
      btnExportarCsv.disabled = true;
      return;
    }
    // Carrega alunos, notas e recalcula tudo para a turma escolhida.
    await carregarAlunosDaTurma(turmaId);
  });

  // Ao clicar no botão de exportação, tenta gerar o CSV.
  // Exportar CSV
  btnExportarCsv.addEventListener("click", () => {
    try {
      // Executa o fluxo de geração e download do arquivo CSV.
      exportarCsv();
    } catch (erro) {
      // Em caso de qualquer erro na exportação, registra no console.
      console.error("Erro ao exportar CSV:", erro);
      // Mostra um alerta genérico para o usuário informando que a exportação falhou.
      alert("Erro ao exportar o arquivo CSV.");
    }
  });
}

// Inicialização da página ao carregar
// Quando o DOM for carregado, inicializa a tela configurando eventos e carregando disciplinas.
document.addEventListener("DOMContentLoaded", () => {
  // Configura listeners dos selects e do botão de exportação.
  configurarSeletores();
  // Carrega a lista inicial de disciplinas disponíveis para exportação.
  carregarDisciplinas();
});