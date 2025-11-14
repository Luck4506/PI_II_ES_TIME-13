const btn = document.querySelector('button#btn-recuperar-senha');
btn?.addEventListener('click', (e) => { e.preventDefault(); recuperarSenha(); });
document.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault());
document.querySelector('#verify-btn').addEventListener('click', verificarCodigo);
document.querySelector('#sair-btn').addEventListener('click', sair);
document.querySelector('#sairAtualizar-btn').addEventListener('click', sair);
document.querySelector('#atualizar-btn').addEventListener('click', atualizarSenha);

const modalVerify = document.querySelector('#verificacao-modal');
const modalSenha = document.querySelector('#recuperarSenha-modal');
let email = '';
let senha = '';
let senhaIgual = '';
async function validarEntradas() {
  capturarEntradas();
  if (email === ''||!isNaN(email)) {
    alert('Por favor, digite seu email!');
    return false;
  }
  if (!(await existeEmail(email))){
    alert('Email não registrado');
    return false;
  }
  return true;
}

function capturarEntradas() {
  email = document.querySelector('#email').value;
}
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
//manda requisição para o servidor para redefinir a senha
async function recuperarSenha() {
  if (!await validarEntradas()) return;
  modalVerify.style.display = 'flex';
  await enviarCodigo(email);

}
function verificarCodigo(){
    capturarEntradas();
    const tentativa=document.getElementById("input-modal").value.trim();
    if(verificarInputCodigo(tentativa)){
        if(tentativa===String(codigoCorreto)){
            window.alert('Codigo verificado com sucesso!');
            modalVerify.style.display = 'none';
            modalSenha.style.display='flex';

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
async function atualizarSenha(){
  if(verificarInputSenha()){
    await updateSenha(email);
    modalSenha.style.display='none';
    sair();
  }
}
function verificarInputSenha(){
  capturarEntradasSenha();
  if(senha==''||senhaIgual==''||senha!=senhaIgual){
    window.alert('Dados Invalidos!');
    return false;
  }
  return true;
}
async function updateSenha(email) {
  const dados = {
        email:email,
        senha:senha
    };
    try {
     await fetch('/updateSenhaDb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
  } catch (erro) {
    console.error('Erro ao enviar email:', erro);
    return false;
  }
}
function capturarEntradasSenha() {
  senha = document.querySelector('#input-senha-modal').value;
  senhaIgual = document.querySelector('#input-senha-segundo-modal').value;
}
function sair(){
    window.location.href = "/login";
    return;
}