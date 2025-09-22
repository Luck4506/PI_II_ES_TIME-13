document.querySelector('#btn-cadastrar').addEventListener('click', cadastrarUsuario)

let nome = ''
let email = ''
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
        window.alert('As senhas precisão ser iguais!')
        return false
    }

    else{
        return true
    }
}


function cadastrarUsuario(){
    if (validarEntradas() == true){

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
            // Aqui você pode exibir mensagem de sucesso
            window.alert('Usuário cadastrado com sucesso!')
            console.log(data)
        })

        .catch(error => {
            window.alert('Erro ao cadastrar usuário.')
            console.error(error)
        })

    }
}