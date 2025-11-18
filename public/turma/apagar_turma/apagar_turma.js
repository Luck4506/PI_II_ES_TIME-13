//Codigo de autoria de Joao Pedro Diniz

// Pega o elemento modal de confirmação na tela
const modal = document.querySelector('#verificacao-modal');

// Função principal que apaga a turma apos a confirmacao
async function apagarTurma() {
    //pega o codigo do formulario
    const codigo_turma = document.getElementById("codigo_turma").value.trim();
    //apaga a relacao de alunos com a turma
    apagarRelacaoTurma(codigo_turma);
    //apaga a turma
    apagarTurmaDb(codigo_turma);
    window.alert('Turma apagada com suucesso!');
    //esconde o modal de confirmacao
    modal.style.display = 'none';
    //limpa os campos
    limparCampos();
}
// Função que checa os dados e mostra o modal de confirmacao para apagar
async function validarInput() {
    //pega os dados do formulario
    const codigo_turma = document.getElementById("codigo_turma").value.trim();
    const nome = document.getElementById("nome_turma").value.toLowerCase().trim();
    //pega o botao para evitar varios envios
    const botao = document.getElementById("btn-apagar");
    //desativa ele
    botao.disabled = true;
    // Checa se os dados estão em um formato invalido ou vazios
    if(nome===""||codigo_turma===""||isNaN(codigo_turma)||!isNaN(nome)){
        window.alert('Dados Invalidos!');
        botao.disabled = false;// Reativa o botão em caso de erro
        limparCampos();
        return;
    }
    // Checa no servidor se a turma realmente existe
    if(!await existeTurma(codigo_turma,nome)){
        window.alert('Turma nao encontrada.');
        botao.disabled = false;// Reativa o botão em caso de erro
        limparCampos();
        return;
    }
    modal.style.display = 'flex'; //faz o modal aparecer na tela
    botao.disabled = false;// Reativa o botão em sucesso
}
// procura no servidor se tem uma turma  com esse código e nome
async function existeTurma(codigo,nome) {
    // Prepara os dados da turma para enviar
    const dados = { codigo_turma:codigo,nome:nome };
    try {
        // Envia o pedido de verificacao para o servidor
        const resposta = await fetch('/turma/verificarTurma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return resposta.json();// Retorna a resposta (true/false) do servidor
    } catch (erro) {
        //tratamento de erro de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// apaga todas as associacoes de alunos ligados à turma
async function apagarRelacaoTurma(codigo) {
    // Prepara o código da turma para enviar
    const dados = { codigo_turma:codigo };
    try {
        // Faz a chamada para a rota de apagar as associacoes
        const resposta = await fetch('/turma/apagarRelacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return resposta.json();
    } catch (erro) {
        //tratamento de erro de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// apaga a turma em si do banco de dados
async function apagarTurmaDb(codigo) {
    const dados = { codigo_turma:codigo };
    try {
        // Faz a chamada para a rota de apagar a turma
        const resposta = await fetch('/turma/apagarTurma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return resposta.json();
    } catch (erro) {
        //tratamento de erro de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao para limpar os campos dos formularios
function limparCampos(){
    document.getElementById("codigo_turma").value="";
    document.getElementById("nome_turma").value="";
}