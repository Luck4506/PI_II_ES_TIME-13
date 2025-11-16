/* Autor: Henrique Young de Azevedo 25005651 */

let ra = ''
let nome = ''

function capturarEntradas(){

    ra = document.querySelector('#aluno_ra').value;
    nome = document.querySelector('#aluno_nome').value;
}

function validarEntradas(){

    capturarEntradas()

    if (ra === '' || nome === '')
    {
        window.alert('Por favor, preencha todos os campos!');
        return false;
    }

    else if(isNaN(ra))
    {
        window.alert('Esse RA não é um número.');
        return false;        
    }

    else if(Number(ra) < 0)
    {
        window.alert('O RA não pode ser um número negativo.');
        return false;
    }

    return true;

}

function cadastrarAluno(){
    
    if(validarEntradas() === true){

        const dados = {
            ra: ra,
            nome: nome,           
        }

        fetch('http://localhost:3000/aluno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())

        .then(data => {
            window.alert('Aluno cadastrado na turma com sucesso!')
            console.log(data)
        })

        .catch(error => {
            window.alert('Erro ao cadastrar aluno na turma.')
            console.log(error)
        })
    }
}

console.log("Script de aluno_turma.js carregado com sucesso!")