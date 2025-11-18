//Codigo de autoria de Pedro Vinicius Romanato e Joao Pedro Diniz
// Seleção de elementos e configuração de listeners de eventos.

// Seleciona o botão de recuperação de senha e adiciona um listener para iniciar o processo.
const btn = document.querySelector('button#btn-recuperar-senha');
// Impede o comportamento padrão (se houver) e chama a função de recuperação.
btn?.addEventListener('click', (e) => { e.preventDefault(); recuperarSenha(); });

// Impede o comportamento padrão de submissão do formulário.
document.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault());

// Listener para o botão de verificar código no modal.
document.querySelector('#verify-btn').addEventListener('click', verificarCodigo);
// Listener para o botão de sair (fechar e ir para login).
document.querySelector('#sair-btn').addEventListener('click', sair);
// Listener para o botão de sair após atualização (fechar e ir para login).
document.querySelector('#sairAtualizar-btn').addEventListener('click', sair);
// Listener para o botão de atualizar a senha.
document.querySelector('#atualizar-btn').addEventListener('click', atualizarSenha);

// Seleção dos modais de verificação e de atualização de senha.
const modalVerify = document.querySelector('#verificacao-modal');
const modalSenha = document.querySelector('#recuperarSenha-modal');

// Variáveis globais para armazenar dados do usuário e do processo.
let email = '';
let senha = '';
let senhaIgual = ''; // Senha para comparação (confirmação).
let codigoCorreto; // Variável global para armazenar o código gerado.

// Função assíncrona para validar as entradas iniciais (apenas o email).
async function validarEntradas() {
    // Captura o valor do email do input.
    capturarEntradas();
    
    // Validação 1: O email não pode ser vazio ou consistir apenas em números.
    if (email === ''||!isNaN(email)) {
        alert('Por favor, digite seu email!');
        return false;
    }
    
    // Validação 2: Verifica se o email está registrado no banco de dados.
    if (!(await existeEmail(email))){
        alert('Email não registrado');
        return false;
    }
    
    return true;
}

// Função para capturar o valor do email do campo de input.
function capturarEntradas() {
    email = document.querySelector('#email').value;
}

// Função assíncrona que envia uma requisição para verificar se o email está cadastrado.
async function existeEmail(email){
    try {
        const resp = await fetch("/verificarEmailCadastrado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        // Retorna o resultado da verificação (espera-se um booleano).
        const resultado = await resp.json();
        return resultado;
    }
    catch (erro) {
        console.error("Erro ao verificar email:", erro);
        return false;
    }
}

// Função para gerar um código numérico de 5 dígitos (entre 10000 e 99999).
function gerarCodigo(){
    codigo = (Math.floor(Math.random() * 90000) + 10000);
    return codigo;
}

// Função assíncrona que gera o código e envia a requisição para o servidor mandar o email.
async function enviarCodigo(email){
    codigoCorreto = gerarCodigo();//variavel global para usar na verificacao do modal
    
    const dados = {
        email:email,
        codigo:codigoCorreto
    };
    
    try {
        // Envia requisição para o servidor enviar o código por email.
        await fetch('/enviarCodigoEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    } catch (erro) {
        console.error('Erro ao enviar email:', erro);
        return false;
    }
}

//manda requisição para o servidor para redefinir a senha
async function recuperarSenha() {
    // Verifica a validade do email, se inválido, encerra a função.
    if (!await validarEntradas()) return;
    
    // Exibe o modal de verificação de código.
    modalVerify.style.display = 'flex';
    // Envia o email com o código.
    await enviarCodigo(email);

}

// Função chamada ao clicar no botão 'Verificar' do modal de código.
function verificarCodigo(){
    // Captura o email.
    capturarEntradas(); 
    // Pega o valor digitado pelo usuário no modal.
    const tentativa=document.getElementById("input-modal").value.trim();
    
    // Verifica se o input do código é válido (não vazio e numérico).
    if(verificarInputCodigo(tentativa)){
        // Compara a tentativa do usuário com o código gerado.
        if(tentativa===String(codigoCorreto)){
            // Sucesso na verificação.
            window.alert('Codigo verificado com sucesso!');
            // Fecha o modal de verificação.
            modalVerify.style.display = 'none';
            // Abre o modal de recuperação/atualização de senha.
            modalSenha.style.display='flex';

        }else{
            // Falha na verificação.
            window.alert('Codigo diferente do enviado no email!');
            // Limpa o campo de código.
            document.getElementById("input-modal").value = "";
        }
    }
}

// Função de validação simples do código digitado pelo usuário.
function verificarInputCodigo(codigo){
    // Verifica se é vazio ou não numérico.
    if(codigo==''||isNaN(codigo)){
        window.alert('Dados Invalidos!');
        return false;
    }else{
        return true;
    }
}

// Função chamada ao clicar no botão 'Atualizar Senha'.
async function atualizarSenha(){
    // Verifica se as senhas digitadas são válidas e iguais.
    if(verificarInputSenha()){
        // Se válido, envia a nova senha para o servidor.
        await updateSenha(email);
        // Fecha o modal de atualização de senha.
        modalSenha.style.display='none';
        // Redireciona para a página de login.
        sair();
    }
}

// Função de validação para as novas senhas.
function verificarInputSenha(){
    // Captura os valores dos campos de senha.
    capturarEntradasSenha();
    // Verifica se os campos estão vazios ou se as senhas não são iguais.
    if(senha==''||senhaIgual==''||senha!=senhaIgual){
        window.alert('Dados Invalidos!');
        return false;
    }
    return true;
}

// Função assíncrona para enviar a nova senha criptografada para o banco de dados.
async function updateSenha(email) {
    const dados = {
        email:email,
        senha:senha
    };
    
    try {
        // Envia requisição para atualizar a senha no DB.
        await fetch('/updateSenhaDb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    } catch (erro) {
        console.error('Erro ao atualizar a senha:', erro); // O console log diz "email", mas a função atualiza a senha.
        return false;
    }
}

// Função para capturar os valores dos campos de nova senha.
function capturarEntradasSenha() {
    senha = document.querySelector('#input-senha-modal').value;
    senhaIgual = document.querySelector('#input-senha-segundo-modal').value;
}

// Função para redirecionar o usuário para a página de login.
function sair(){
    window.location.href = "/login";
    return;
}