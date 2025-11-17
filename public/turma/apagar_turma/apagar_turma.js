const modal = document.querySelector('#verificacao-modal');
let codigo_turma = document.getElementById("codigo_turma").value.trim();
let nome = document.getElementById("nome_turma").value.toLowerCase().trim();
async function apagarTurma() {
    await apagarRelacaoTurma(codigo_turma);
    await apagarTurmaDb(codigo_turma);
    window.alert('Turma apagada com suucesso!');
    modal.style.display = 'none';
    limparCampos();
}
async function validarInput() {
    const botao = document.getElementById("btn-apagar");
    botao.disabled = true;

    if(nome===""||codigo_turma===""||isNaN(codigo_turma)||!isNaN(nome)){
        window.alert('Dados Invalidos!');
        botao.disabled = false;
        limparCampos();
        return;
    }
    if(!await existeTurma(codigo_turma,nome)){
        window.alert('Turma nao encontrada.');
        botao.disabled = false;
        limparCampos();
        return;
    }
    modal.style.display = 'flex';
    botao.disabled = false;
}
async function existeTurma(codigo,nome) {
    const dados = { codigo_turma:codigo,nome:nome };
    try {
        const resposta = await fetch('/turma/verificarTurma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return resposta.json();
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function apagarRelacaoTurma(codigo_turma) {
    const dados = { codigo_turma:codigo };
    try {
        const resposta = await fetch('/turma/apagarRelacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return resposta.json();
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
function limparCampos(){
    document.getElementById("turma_id").value="";
    document.getElementById("nome_turma").value="";
}