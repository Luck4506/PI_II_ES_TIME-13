document.querySelector('#btn-cadastrar').addEventListener('click', cadastrarUsuario) // Quando o botão for clicado, a função chamada 'cadastrarUsuario' será executada.
document.querySelector('#verify-btn').addEventListener('click', verificarCodigo);
document.querySelector('#sair-btn').addEventListener('click', sair);
const modal = document.querySelector('#verificacao-modal');
let nome = ''
let email = ''
//precisa adicionar verificacao se o email ja existe no db...
let telefone = ''
let senha = ''
let senhaConfirmacao = ''

function capturarEntradas(){

    nome = document.querySelector('#nome').value
    email = document.querySelector('#email').value
    telefone = document.querySelector('#telefone').value
    senha = document.querySelector('#senha').value
    senhaConfirmacao = document.querySelector('#confirmar-senha').value

}

function validarEntradas(){

    capturarEntradas()

    if (nome == '' || email == '' || telefone == '' || senha == '' || senhaConfirmacao == '')
    {
        window.alert('Por favor, preencha todos os campos!')
        return false
    }

    else if (senha != senhaConfirmacao){
        window.alert('As senhas precisam ser iguais!')
        return false
    }

    else{
        return true
    }
}


async function cadastrarUsuario(){
    if (validarEntradas() == true){
        modal.style.display = 'flex';
        enviarCodigo(email);
    }
}
function gerarCodigo(){
    codigo = (Math.floor(Math.random() * 90000) + 10000);
    return codigo;
}
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
function verificarCodigo(){
    capturarEntradas();
    const tentativa=document.getElementById("input-modal").value.trim();
    if(verificarInputCodigo(tentativa)){
        if(tentativa===String(codigoCorreto)){
            window.alert('Codigo verificado com sucesso!');
            modal.style.display = 'none';
            enviarCadastroDb();
        }else{
            window.alert('Codigo diferente do enviado no email!');
            document.getElementById("input-modal").value = "";
        }
    }
}
function verificarInputCodigo(codigo){
    if(codigo==''||isNaN(codigo)){
        window.alert('Dados Invalidos!');
        return false;
    }else{
        return true;
    }
}
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
function sair(){
    window.location.href = "/login";
    return;
}
console.log("Script de cadastro.js carregado com sucesso!");
