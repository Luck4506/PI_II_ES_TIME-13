
let codigo_disciplina = ''
let nome = ''
let sigla = ''
let descricao = ''

function capturarEntradas(){

    codigo_disciplina = document.querySelector('#componente_cod_disciplina').value
    nome = document.querySelector('#componente_nome').value
    sigla = document.querySelector('#componente_sigla').value
    descricao = document.querySelector('#componente_descricao').value
}

function validarEntradas(){

    capturarEntradas()

    if (codigo_disciplina == '' || nome == '' || sigla == '' || descricao == '')
    {
        window.alert('Por favor, preencha todos os campos!')
        return false
    }

    else if (sigla.length != 2){
        window.alert('O campo "Sigla" deve ter exatamente 2 caracteres!')
        return false
    }

    else if (isNaN(codigo_disciplina)){
        window.alert('O campo "Código da Disciplina Correspondente" precisa ser um número!')
        return false
    }

    else {
        return true
    }

}

function criarComponente(){
    
    if(validarEntradas() == true){

        const dados = {
            codigo_disciplina: codigo_disciplina,
            nome: nome,
            sigla: sigla,
            descricao: descricao,
        }

        fetch('http://localhost:3000/componente-nota', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())

        .then(data => {
            window.alert('Componente de nota cadastrado com sucesso!')
            console.log(data)
        })

        .catch(error => {
            window.alert('Erro ao criar componente de nota.')
            console.log(error)
        })
    }
}

console.log("Script de criar_comp.js carregado com sucesso!")