async function atualizarTurma() {
    const codigo_turma = document.getElementById("id_turma").value.trim();
    const nome_antigo = document.getElementById("nome_antigo").value.toLowerCase().trim();
    const nome_novo = document.getElementById("nome_novo").value.toLowerCase().trim();
    const botao = document.getElementById("btn-atualizar");
    botao.disabled = true;
    if(await validarInput(codigo_turma,nome_antigo,nome_novo)){
        if(enviarUpdateDb(codigo_turma,nome_antigo,nome_novo)){
            window.alert('Turma Atualizada com Sucesso!');
            limparCampos();
            botao.disabled = false;
        }
    }else{
        limparCampos();
        botao.disabled = false;
    }
}
async function enviarUpdateDb(codigo,nome_antigo,nome_novo) {
    const dados = { codigo_turma:codigo,nome_antigo:nome_antigo,nome_novo };
    try {
        const resposta = await fetch('/turma/atualizarTurma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) {
             console.error('Falha ao cadastrar turma. Status:', resposta.status);
             return false; 
        }
        return true;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function validarInput(codigo,nome_antigo,nome_novo) {
    if(codigo==""||nome_antigo==""||nome_novo==""||isNaN(codigo)||!isNaN(nome_antigo)||!isNaN(nome_novo)){
        window.alert('Dados Invalidos!');
        return false;
    }
    if(!await existeTurma(codigo,nome_antigo)){
        window.alert('Turma nao existe!');
        return false;
    }
    const id=await pegarIdDisciplina(codigo);
    if(await existeNome(id,nome_novo)){
        window.alert('Nome de turma ja existe!');
        return false;
    }
    return true;

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
async function pegarIdDisciplina(turma_id) {
    const dados = { turma_id:turma_id};
    try {
        const resposta = await fetch('/turma/pegarIdDisciplina', {
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
async function existeNome(codigo,nome) {
    const dados = { codigo_disciplina:codigo,nome:nome };
    try {
        const resposta = await fetch('/turma/verificarNomeTurma', {
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
    document.getElementById("id_turma").value = "";
    document.getElementById("nome_antigo").value = "";
    document.getElementById("nome_novo").value = "";
}
