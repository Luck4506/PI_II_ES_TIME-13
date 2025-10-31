
let nome = ''
let sigla = ''
let codigo = ''
let periodo_curso = ''

function capturarEntradas(){

    nome = document.querySelector('#disciplina-nome').value
    sigla = document.querySelector('#disciplina-sigla').value
    codigo = document.querySelector('#disciplina-codigo').value
    periodo_curso = document.querySelector('#disciplina-periodo').value
}

function validarEntradas(){

    capturarEntradas()

    if (nome == '' || sigla == '' || codigo == '' || periodo_curso == '')
    {
        window.alert('Por favor, preencha todos os campos!')
        return false
    }

    else if (sigla.length != 2){
        window.alert('O campo sigla deve ter exatamente 2 caracteres!')
        return false
    }

    else if (isNaN(periodo_curso)){
        window.alert('O campo "periodo_curso" precisa ser um número!')
    }

    else {
        return true
    }

}

function cadastrarDisciplina(){
    if(validarEntradas() == true){

        const dados = {
            nome: nome,
            sigla: sigla,
            codigo: codigo,
            periodo_curso: periodo_curso            
        }

        fetch('http://localhost:3000/disciplina', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())

        .then(data => {
            window.alert('Disciplina cadastrada com sucesso!')
            console.log(data)
        })

        .catch(error => {
            window.alert('Erro ao cadastrar disciplina.')
            console.log(error)
        })
    }
}

console.log("Script de disciplina.js carregado com sucesso!")