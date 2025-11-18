/* Autor: Henrique Young de Azevedo 25005651 */

// Variáveis globais para os campos da disciplina.
let nome = '';
let curso_ID = '';
let sigla = '';
let codigo = '';
let periodo_curso = '';

// Função para capturar entradas dos campos.
function capturarEntradas(){

    nome = document.querySelector('#disciplina-nome').value
    curso_ID = document.querySelector('#disciplina-curso').value
    sigla = document.querySelector('#disciplina-sigla').value
    codigo = document.querySelector('#disciplina-codigo').value
    periodo_curso = document.querySelector('#disciplina-periodo').value
}

// Função para validar as entradas dos campos.
function validarEntradas(){

    capturarEntradas(); // Captura as entradas antes de validar.

    if (nome === '' || curso_ID ==='' || sigla === '' || codigo === '' || periodo_curso === '') // Verifica se algum campo está vazio.
    {
        window.alert('Por favor, preencha todos os campos!');
        return false;;
    }

    else if (sigla.length != 2){ // Verifica se a sigla tem exatamente 2 caracteres.
        window.alert('O campo "Sigla" deve ter exatamente 2 caracteres!');
        return false;
    }

    else if (isNaN(curso_ID)){ // Verifica se o ID do curso é um número.
        window.alert('O campo "ID do Curso" precisa ser um número!');
        return false;
    }

    else if (isNaN(periodo_curso)){ // Verifica se o período do curso é um número.
        window.alert('O campo "Período" precisa ser um número!');
        return false;
    }

    return true; // Retorna true se o valor passou por todas as validações sem ser barrado.

}

// Função para cadastrar a disciplina.
function cadastrarDisciplina(){
    
    if(validarEntradas() === true){ // Valida as entradas antes de cadastrar a disciplina.

        const dados = { // Objeto JavaScript com os dados da disciplina.
            curso_ID: curso_ID,
            nome: nome,
            sigla: sigla,
            codigo: codigo,
            periodo_curso: periodo_curso            
        }

        fetch('http://localhost:3000/disciplina', { // Requisição para o servidor.

            method: 'POST', // Método da requisição.

            // Requisição é dividida em duas partes: headers e body.
            headers: {
                'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON.
            },
            body: JSON.stringify(dados) // Converte os dados para JSON e os envia no corpo da requisição.
        })
        .then(response => response.json()) // Lê o corpo da resposta HTTP (JSON), faz o parsing
                                           // e retorna uma Promise que resolve em um objeto JS.

        .then(data => { // 'data' é o objeto JS resultante do parsing do JSON da resposta.
            window.alert('Disciplina cadastrada com sucesso!') // Alerta de sucesso.
            console.log(data) // Exibe o objeto data no console.
        })

        .catch(error => { // Em caso de erro, exibe um alerta de erro e loga o erro no console.
            window.alert('Erro ao cadastrar disciplina.')
            console.log(error)
        })

    } else{
        console.log('Validação de entradas falhou.'); // Exibe no console que a validação falhou.
    }
}

// Mensagem de confirmação de que o script foi carregado com sucesso.
console.log("Script de add_disciplina.js carregado com sucesso!")