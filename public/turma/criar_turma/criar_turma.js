async function criarTurma() {
    const codigo_disciplina = document.getElementById("codigo_disciplina").value.trim();
    const nome_disciplina = document.getElementById("nome_turma").value.toLowerCase().trim();
    const botao = document.getElementById("btn-cadastrar");
    botao.disabled = true;
    if(await verificarInput(codigo_disciplina,nome_disciplina)){
        if(enviarDadosDb(codigo_disciplina,nome_disciplina)){
            window.alert('Turma Cadastrada com Sucesso!');
            limparCampos();
            botao.disabled = false;
        }
    }else{
        botao.disabled = false;
        limparCampos();
    }
}
async function enviarDadosDb(codigo,nome) {
    const dados = { codigo_disciplina:codigo,nome:nome };
    try {
        const resposta = await fetch('/turma/cadastrarTurma', {
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
async function verificarInput(codigo,nome){
    if(codigo==""||nome==""||isNaN(codigo)||!isNaN(nome)){
        window.alert('Dados Invalidos!');
        return false;
    }
    if(!await disciplinaExiste(codigo)){
        window.alert('Disciplina nao existe!');
        return false;
    }
    if(await existeNome(codigo,nome)){
        window.alert('Nome de turma ja existe!');
        return false;
    }
    return true;
}
async function disciplinaExiste(codigo) {
    const dados = { codigo_disciplina:codigo };
    try {
        const resposta = await fetch('/turma/verificarDisciplina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return await resposta.json();
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function existeNome(codigo,nome) {
    const dados = { codigo_disciplina:codigo,nome:nome };
    try {
        const resposta = await fetch('/turma/verificarNome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return await resposta.json();
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function limparCampos() {
    document.getElementById("codigo_disciplina").value = "";
    document.getElementById("nome_turma").value = "";
}