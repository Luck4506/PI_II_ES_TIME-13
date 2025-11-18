//codigo de autoria Pedro Viniciuus Romanato e Lucas Soares goncalves
// Configuração dos Event Listeners para botões de interação
document.querySelector('#btn-cadastrar').addEventListener('click', cadastrarUsuario) // Quando o botão for clicado, a função chamada 'cadastrarUsuario' será executada.
document.querySelector('#verify-btn').addEventListener('click', verificarCodigo);
document.querySelector('#sair-btn').addEventListener('click', sair);
document.querySelector('#sairSenha-btn').addEventListener('click', sair);
document.querySelector('#recuperar-btn').addEventListener('click',recuperar );
// Seleção dos modais de verificação de código e recuperação de senha
const modalVerify = document.querySelector('#verificacao-modal');
const modalSenha = document.querySelector('#recuperarSenha-modal');
// Variáveis globais para armazenar os dados de entrada do formulário
let nome = ''
let email = ''
let telefone = ''
let senha = ''
let senhaConfirmacao = ''
// Função para capturar os valores dos campos de entrada do formulário
function capturarEntradas(){

    nome = document.querySelector('#nome').value
    email = document.querySelector('#email').value
    telefone = document.querySelector('#telefone').value
    senha = document.querySelector('#senha').value
    senhaConfirmacao = document.querySelector('#confirmar-senha').value

}
// Função de validação das entradas do formulário e verificação de email no DB
async function validarEntradas(){
    // Verifica se todos os campos estão preenchidos
    capturarEntradas();
    if (nome == '' || email == '' || telefone == '' || senha == '' || senhaConfirmacao == '')
    {
        window.alert('Por favor, preencha todos os campos!')
        return false
    }
    // Verifica se as senhas são iguais
    if (senha != senhaConfirmacao){
        
        window.alert('As senhas precisam ser iguais!')
        return false
    }
    const existe = await existeEmail(email);
    if (existe){
        // Exibe modal para recuperação de senha se o email existir
        modalSenha.style.display = 'flex';
        return false;
    }
        return true;
}

// Função principal para iniciar o processo de cadastro do usuário
async function cadastrarUsuario(){
    // Se as entradas forem válidas, exibe o modal de verificação e envia o código
    if (await validarEntradas()){
        modalVerify.style.display = 'flex';
        enviarCodigo(email);
    }
}
// Função para gerar um código numérico de 5 dígitos
function gerarCodigo(){
    codigo = (Math.floor(Math.random() * 90000) + 10000);
    return codigo;
}
// Função assíncrona para enviar o código de verificação por email
async function enviarCodigo(email){
    codigoCorreto=gerarCodigo();//variavel global para usar na verificacao do modal
    console.log(codigoCorreto);
    const dados = {
        email:email,
        codigo:codigoCorreto
    };
    try {
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
// Função para verificar se o código digitado pelo usuário confere com o código enviado
function verificarCodigo(){
    capturarEntradas();
    const tentativa=document.getElementById("input-modal").value.trim();
    if(verificarInputCodigo(tentativa)){
        if(tentativa===String(codigoCorreto)){
            window.alert('Codigo verificado com sucesso!');
            modalVerify.style.display = 'none';
            enviarCadastroDb();
        }else{
            window.alert('Codigo diferente do enviado no email!');
            document.getElementById("input-modal").value = "";
        }
    }
}
// Função assíncrona que verifica se o email já está cadastrado no back-end
async function existeEmail(email){
    try {
        const resp = await fetch("/verificarEmailCadastrado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const resultado = await resp.json();
        return resultado;
    }
    catch (erro) {
        console.error("Erro ao verificar email:", erro);
        return false;
    }
}
// Função para validar o input do código de verificação
function verificarInputCodigo(codigo){
    if(codigo==''||isNaN(codigo)){
        window.alert('Dados Invalidos!');
        return false;
    }else{
        return true;
    }
}
// Função para enviar os dados do novo usuário para o back-end gravar no banco de dados
function enviarCadastroDb(){
    const dados = {
    nome: nome,
    email: email,
    telefone: telefone,
    senha: senha
    }

    fetch('/cadastrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())

    .then(data => {
        window.alert('Usuário cadastrado com sucesso!')
        console.log(data)
    })

    .catch(error => {
        window.alert('Erro ao cadastrar usuário.')
        console.error(error)
    })
}
// Função de navegação para a tela de login
function sair(){
    window.location.href = "/login";
    return;
}
// Função de navegação para a tela de recuperação de senha
function recuperar(){
    window.location.href = "/recuperar_senha/";
    return;
}
console.log("Script de cadastro.js carregado com sucesso!");
