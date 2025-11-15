
let nome = ''
let curso_ID = ''
let sigla = ''
let codigo = ''
let periodo_curso = ''

function capturarEntradas(){

    nome = document.querySelector('#disciplina-nome').value
    curso_ID = document.querySelector('#disciplina-curso').value
    sigla = document.querySelector('#disciplina-sigla').value
    codigo = document.querySelector('#disciplina-codigo').value
    periodo_curso = document.querySelector('#disciplina-periodo').value
}

function validarEntradas(){

    capturarEntradas()

    if (nome == '' || curso_ID == '' || sigla == '' || codigo == '' || periodo_curso == '')
    {
        window.alert('Por favor, preencha todos os campos!')
        return false
    }

    else if (sigla.length != 2){
        window.alert('O campo "Sigla" deve ter exatamente 2 caracteres!')
        return false
    }

    else if (isNaN(curso_ID)){
        window.alert('O campo "ID do Curso" precisa ser um número!')
        return false
    }

    else if (isNaN(periodo_curso)){
        window.alert('O campo "Período" precisa ser um número!')
        return false
    }

    else {
        return true
    }

}

function cadastrarDisciplina(){
    
    if(validarEntradas() == true){

        const dados = {
            curso_ID: curso_ID,
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

console.log("Script de add_disciplina.js carregado com sucesso!")