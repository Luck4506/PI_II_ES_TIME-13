
const disciplina = document.getElementById('disciplina');
const expr = document.getElementById('expr');
const erros = document.getElementById('erros');

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

// “Salvar” - SEM O BACK BD
btnSalvar.addEventListener('click', () => {
    const resultado = validarExpressaoBasica(expr.value);
    if (!resultado.ok) {
        alert('Corrija os erros antes de salvar.');
        return;
    }
    //SE DER COLOCAR O ALERTA, SE NÃO, APAGAR
    alert('Fórmula “salva” (exemplo, sem servidor).');
});

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

function parentesesOk(str) {
    let c =0;
    for (const ch of str){
        if(ch === '(') c++;
        else if(ch === ')'){
        c--;
        if (c < 0)return false;
        }
    }
    return c===0;
}