//Codigo de autoria de Joao Pedro Diniz
// Função principal para criar uma turma, verificando os dados e enviando para o servidor
async function criarTurma() {
    //pega os dados do form
    const codigo_disciplina = document.getElementById("codigo_disciplina").value.trim();
    const nome_disciplina = document.getElementById("nome_turma").value.toLowerCase().trim();
    //pega o botao para evitar varios envios ao mesmo tempo
    const botao = document.getElementById("btn-cadastrar");
    //desativa o click
    botao.disabled = true;
    // Verifica se os dados de entrada são válidos
    if(await verificarInput(codigo_disciplina,nome_disciplina)){
        // Se válidos, tenta enviar os dados para o banco de dados
        if(enviarDadosDb(codigo_disciplina,nome_disciplina)){
            window.alert('Turma Cadastrada com Sucesso!');
            // Limpa os campos de entrada
            limparCampos();
            // Reabilita o botão
            botao.disabled = false;
        }
    }else{
        // Se os dados não são válidos, reabilita o botão e limpa os campos
        botao.disabled = false;
        limparCampos();
    }
}
// Função para enviar os dados da turma para o servidor
async function enviarDadosDb(codigo,nome) {
    // Prepara os dados
    const dados = { codigo_disciplina:codigo,nome:nome };
    try {
        // Envia uma solicitação para o servidor
        const resposta = await fetch('/turma/cadastrarTurma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        // Verifica se a resposta do servidor foi bem-sucedida
        if (!resposta.ok) {
             console.error('Falha ao cadastrar turma. Status:', resposta.status);
             return false; 
        }
        // Se foi bem-sucedida, retorna verdadeiro
        return true;
    } catch (erro) {
        // Se houve erro na conexão, mostra no console e retorna falso
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// Função para verificar se os dados de entrada são válidos
async function verificarInput(codigo,nome){
    // Verifica se o código ou nome estão vazios, se o código não é um número, ou se o nome é um número
    if(codigo==""||nome==""||isNaN(codigo)||!isNaN(nome)){
        window.alert('Dados Invalidos!');
        return false;
    }
    // Verifica se a disciplina com esse código existe
    if(!await disciplinaExiste(codigo)){
        window.alert('Disciplina nao existe!');
        return false;
    }
    // Verifica se já existe uma turma com esse nome para a disciplina
    if(await existeNome(codigo,nome)){
        window.alert('Nome de turma ja existe!');
        return false;
    }
    // Se tudo passou, retorna verdadeiro
    return true;
}
// Função para verificar se uma disciplina existe no servidor
async function disciplinaExiste(codigo) {
    // Prepara os dados
    const dados = { codigo_disciplina:codigo };
    try {
        // Envia solicitação para verificar a disciplina
        const resposta = await fetch('/turma/verificarDisciplina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        // Retorna a resposta do servidor (verdadeiro ou falso)
        return await resposta.json();
    } catch (erro) {
        // Se erro, mostra no console e retorna falso
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// Função para verificar se o nome da turma já existe para a disciplina
async function existeNome(codigo,nome) {
    // Prepara os dados
    const dados = { codigo_disciplina:codigo,nome:nome };
    try {
        // Envia solicitação para verificar o nome
        const resposta = await fetch('/turma/verificarNome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        // Retorna a resposta do servidor (verdadeiro ou falso)
        return await resposta.json();
    } catch (erro) {
        // Se erro, mostra no console e retorna falso
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// Função para limpar os campos de entrada
async function limparCampos() {
    // Define os campos como vazio
    document.getElementById("codigo_disciplina").value = "";
    document.getElementById("nome_turma").value = "";
}