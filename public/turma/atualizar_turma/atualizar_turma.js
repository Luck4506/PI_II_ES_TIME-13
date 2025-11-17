//Codigo de autoria de Joao Pedro Diniz

// Função principa de atualizar turma
async function atualizarTurma() {
    //pega os dados do forms
    const codigo_turma = document.getElementById("id_turma").value.trim();
    const nome_antigo = document.getElementById("nome_antigo").value.toLowerCase().trim();
    const nome_novo = document.getElementById("nome_novo").value.toLowerCase().trim();
    //pega o botao para evitar repetir o click nele
    const botao = document.getElementById("btn-atualizar");
    //desativa ele
    botao.disabled = true;
    // Se os dados passarem na validação
    if(await validarInput(codigo_turma,nome_antigo,nome_novo)){
        //envia a atualização para o servidor
        if(enviarUpdateDb(codigo_turma,nome_antigo,nome_novo)){
            window.alert('Turma Atualizada com Sucesso!');
            //limpa os campos
            limparCampos();
            // Reativa o botão.
            botao.disabled = false;
        }
    }else{
        // Se falhar na validação, limpa os campos.
        limparCampos();
        // Reativa o botao.
        botao.disabled = false;
    }
}
// Envia os novos dados para o servidor salvar no Banco de Dados.
async function enviarUpdateDb(codigo,nome_antigo,nome_novo) {
    // Prepara os dados
    const dados = { codigo_turma:codigo,nome_antigo:nome_antigo,nome_novo };
    try {
        // Faz a chamada para o servidor de atualização.
        const resposta = await fetch('/turma/atualizarTurma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (!resposta.ok) {
             console.error('Falha ao atualizar turma. Status:', resposta.status);
             return false; 
        }
        return true;
    } catch (erro) {
        //checa se houve erro e da log no console e retorna false
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//valida os inputs se sao validos para atualizar o nome da turma
async function validarInput(codigo,nome_antigo,nome_novo) {
    // Valida se os campos estão preenchidos corretamente (tipo de dado)
    if(codigo==""||nome_antigo==""||nome_novo==""||isNaN(codigo)||!isNaN(nome_antigo)||!isNaN(nome_novo)){
        window.alert('Dados Invalidos!');
        return false;
    }
    // Verifica se a turma que está sendo atualizada realmente existe
    if(!await existeTurma(codigo,nome_antigo)){
        window.alert('Turma nao existe!');
        return false;
    }
    // Pega o ID da disciplina
    const id=await pegarIdDisciplina(codigo);
    // Verifica se o novo nome já está em uso em outra turma da mesma disciplina
    if(await existeNome(id,nome_novo)){
        window.alert('Nome de turma ja existe!');
        return false;
    }
    return true; // Dados válidos

}
// Pergunta ao servidor se uma turma existe pelo código e nome atual
async function existeTurma(codigo,nome) {
    const dados = { codigo_turma:codigo,nome:nome };
    try {
        // Envia a requisição para verificação.
        const resposta = await fetch('/turma/verificarTurma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return resposta.json();// Retorna o resultado da verificação (true/false)
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// pega o id da disciplina usando o id da turma
async function pegarIdDisciplina(turma_id) {
    const dados = { turma_id:turma_id};
    try {
        // Envia a requisição para pegar o id
        const resposta = await fetch('/turma/pegarIdDisciplina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return resposta.json();// Retorna o ID da disciplina.
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// Checa se o NOVO nome já é usado em outra turma, dentro da mesma disciplina
async function existeNome(codigo,nome) {
    // Usa o código da disciplina e o nome(novo)
    const dados = { codigo_disciplina:codigo,nome:nome };
    try {
        const resposta = await fetch('/turma/verificarNomeTurma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return resposta.json();// Retorna o resultado (true/false).
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// Função de apoio para deixar os campos do formulário vazios.
function limparCampos(){
    document.getElementById("id_turma").value = "";
    document.getElementById("nome_antigo").value = "";
    document.getElementById("nome_novo").value = "";
}
