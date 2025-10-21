document.querySelector('button#btn-recuperar-senha').addEventListener('click', recuperarSenha)

function recuperarSenha(){
    document.querySelector('p#mensagem-recuperacao').innerHTML = 'Se o endereço de e-mail informado estiver cadastrado em nosso sistema, você receberá uma mensagem com instruções para redefinir sua senha.'

}