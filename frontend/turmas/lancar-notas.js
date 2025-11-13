const formulaEl = document.getElementById('formula');
const tbody = document.getElementById('tbody');
const btnSalvar = document.getElementById('btnSalvar');
const btnRecarregar = document.getElementById('btnRecarregar');
const selTurma = document.getElementById('turma');
const selDisciplina = document.getElementById('disciplina');

// ---------- exemplo do chat gpt pq ta sem back ----------
let EXPRESSAO = '(P1 + P2 + T1) / 3';     // [BD]: virá de /disciplinas/:id/formula
const SIGLAS = ['P1', 'P2', 'T1'];        // [BD]: pode vir de /disciplinas/:id/componentes (siglas)
const ALUNOS = [                          // [BD]: virá de /turmas/:id/alunos
  { id: '11111', nome: 'Abel Antimônio' },
  { id: '11112', nome: 'Bianca Nióbio' },
  { id: '11113', nome: 'Carla Polônio' }
];
//--------------------------------------------------------//
const NOTAS = {}; // id aluno

//tabela
function montarTabela() {
    tbody.innerHTML = '';

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

        SIGLAS.forEach(sigla => {
        const td = document.createElement('td');
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.min = '0';
        inp.max = '10';
        inp.step = '0.01';
        inp.className = 'input-nota';

        inp.addEventListener('input', () =>{
            const v = parseFloat(inp.value);
            if (!NOTAS[aluno.id]) NOTAS[aluno.id] = {};
            NOTAS[aluno.id][sigla] = Number.isFinite(v) ? v : undefined;
            atualizarFinal(aluno.id);
        });

        td.appendChild(inp);
        tr.appendChild(td);
    });

    // Nf
    const tdFinal = document.createElement('td');
    tdFinal.className = 'nota-final';
    tdFinal.dataset.aluno = aluno.id;
    tdFinal.textContent = '-';
    tr.appendChild(tdFinal);

    tbody.appendChild(tr);
    });
}

function atualizarFinal(alunoId){
  // Se faltar alguma nota pedida na expressão siglas - não calcula
    const mapa = {};
    for (const s of SIGLAS){
        const v = NOTAS[alunoId]?.[s];
        if (!Number.isFinite(v)) {
        setFinal(alunoId, '-');
        return;
        }
        mapa[s] = v;
    }

    const r = avaliarExpressao(EXPRESSAO, mapa);
    setFinal(alunoId, Number.isFinite(r) ? r.toFixed(2) : '-');
    }

    function setFinal(alunoId, valor){
    const cell = tbody.querySelector(`.nota-final[data-aluno="${alunoId}"]`);
    if (cell) cell.textContent = valor;
}


function avaliarExpressao(exprStr, mapaValores) {
    let exprNum = exprStr;

    const tokens = exprStr.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
    const vistos = new Set();
    for (const tk of tokens){
        if (vistos.has(tk)) continue;
        vistos.add(tk);
        const valor = Number(mapaValores[tk]);
        if (!Number.isFinite(valor)) return NaN;
        exprNum = exprNum.replace(new RegExp(`\\b${tk}\\b`, 'g'), String(valor));
    }

    // Só números e conta
    const seguro = /^[0-9+\-*/().\s]+$/;
    if (!seguro.test(exprNum)) return NaN;

    try {
        
        const fn = new Function(`return (${exprNum});`);
        const r = Number(fn());
        return Number.isFinite(r) ? r : NaN;
    } catch {
        return NaN;
    }
}

//ADC OS BOTÕES NO BACK
btnSalvar.addEventListener('click', () => {
  // TODO [BD]: substituir por PUT /turmas/:id/notas com o objeto NOTAS
  // (No servidor, recalcular finais pela fórmula da DISCIPLINA da turma e persistir.)
    alert('Notas “salvas” (exemplo, sem servidor).');
});

btnRecarregar.addEventListener('click', () => {
  // TABELA BD TURMA - NOMES
    Object.keys(NOTAS).forEach(k => delete NOTAS[k]);
    montarTabela();
});

function init() {
  // BUSCAR TURMA POR DISCIPLINA 
    formulaEl.textContent = EXPRESSAO;
    montarTabela();
}

// TROCA DE TURMA BD
selTurma.addEventListener('change', init);

init();