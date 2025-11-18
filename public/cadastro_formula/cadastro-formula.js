//codigo de autoria de Isabela Aparecida Paslauski Pinto
// Seleção de elementos principais do DOM
const disciplina = document.getElementById('disciplina');
const expr = document.getElementById('expr');
const erros = document.getElementById('erros');
// Listener para carregar as disciplinas ao iniciar a página
document.addEventListener('DOMContentLoaded', carregarDisciplinas);
// Função que busca a lista de disciplinas na API e preenche o dropdown
async function carregarDisciplinas() {
    try {
        const resp = await fetch('/formula/disciplinas');
        if (!resp.ok) {
            throw new Error('Falha ao buscar disciplinas');
        }

        const disciplinas = await resp.json(); // [{ id, nome }]

        disciplina.innerHTML = '<option value="">Selecione a disciplina</option>';

        disciplinas.forEach((d) => {
            const opt = document.createElement('option');
            opt.value = d.id;     
            opt.textContent = d.nome;
            disciplina.appendChild(opt);
        });

    } catch (erro) {
        console.error('Erro ao carregar disciplinas:', erro);
        alert('Erro ao carregar as disciplinas para o cadastro de fórmula.');
    }
}

// Seleção dos botões de ação e atalho
const btnSalvar = document.getElementById('btnSalvar');
const btnMediaAritmetica = document.getElementById('btnMediaAritmetica');
const btnPonderadaEx = document.getElementById('btnPonderadaEx');
const btnLimpar = document.getElementById('btnLimpar');

// Atalho: MÉDIA ARITMÉTICA → (P1 + P2 + T1) / 3
btnMediaAritmetica.addEventListener('click', () => {
    expr.value = '(P1 + P2 + T1) / 3';
    validarEMostrarErros();
});

// Atalho: PONDERADA
btnPonderadaEx.addEventListener('click', () => {
    expr.value = 'P1*0.4 + P2*0.3 + T1*0.3';
    validarEMostrarErros();
});

// Limpar 
btnLimpar.addEventListener('click', () => {
    expr.value = '';
    validarEMostrarErros();
});

// Validar enquanto digita
expr.addEventListener('input', validarEMostrarErros);

// “Salvar” - envia para o back-end gravar no BD
btnSalvar.addEventListener('click', async () => {
    const texto = expr.value.trim();
    const resultado = validarExpressaoBasica(texto);

    if (!resultado.ok) {
        alert('Corrija os erros antes de salvar.');
        return;
    }

    const idDisciplina = disciplina.value;
    if (!idDisciplina) {
        alert('Selecione uma disciplina.');
        return;
    }

    try {
        // Requisição POST para o endpoint de cadastro de fórmula
        const resp = await fetch('/formula/cadastrar_formula', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idDisciplina: Number(idDisciplina),
                expressao: texto,
            }),
        });

        if (!resp.ok) {
            const erroTexto = await resp.text().catch(() => '');
            console.error('Erro ao salvar fórmula:', resp.status, erroTexto);
            alert('Ocorreu um erro ao salvar a fórmula.');
            return;
        }

        let dados = null;
        try {
            dados = await resp.json();
        } catch (_) {
            // se não vier JSON, segue com mensagem padrão
        }

        alert(dados?.mensagem || 'Fórmula salva com sucesso!');
    } catch (erro) {
        console.error('Erro inesperado ao salvar fórmula:', erro);
        alert('Erro inesperado ao salvar a fórmula.');
    }
});
// Exibe os erros de validação da expressão no elemento 'erros'
function validarEMostrarErros() {
    const texto = expr.value.trim();
    const v = validarExpressaoBasica(texto);

    if (!texto) {
        erros.textContent = '';
        return;
    }

    erros.textContent = v.ok ? '' : 'Erros:\n- ' + v.erros.join('\n- ');
}

// Validação - não vazia,  números, espaços, + - * / ( ), parênteseS
function validarExpressaoBasica(exprStr) {
    const msgs = [];
    if (!exprStr) {
        msgs.push('A expressão está vazia.');
        return { ok: false, erros: msgs };
    }

    const permitido = /^[0-9+\-*/().\sA-Za-z_]+$/;
    if (!permitido.test(exprStr)) {
        msgs.push('Use apenas números, + - * / ( ) e variáveis (ex.: P1, P2, T1, P3, X...).');
    }

    if (!parentesesOk(exprStr)) {
        msgs.push('Parênteses faltando.');
    }

    return { ok: msgs.length === 0, erros: msgs };
}
// Verifica o balanceamento dos parênteses
function parentesesOk(str) {
    let c =0;
    for (const ch of str){
        if(ch === '(') c++;
        else if(ch === ')'){
        c--;
        // Garante que nunca fecha um parêntese sem ter aberto um antes
        if (c < 0)return false;
        }
    }
    // Retorna verdadeiro se o número final de aberturas e fechamentos for zero
    return c===0;
}