/* Autor: Henrique Young de Azevedo 25005651 */

// Variáveis globais para os campos do componente de nota.
let codigo_disciplina = ''
let nome = ''
let sigla = ''
let descricao = ''

// Função para capturar as entradas dos campos.
function capturarEntradas(){

    codigo_disciplina = document.querySelector('#componente_cod_disciplina').value
    nome = document.querySelector('#componente_nome').value
    sigla = document.querySelector('#componente_sigla').value
    descricao = document.querySelector('#componente_descricao').value
}

// Função para validar as entradas dos campos.
function validarEntradas(){

    capturarEntradas(); // Captura os valores dos campos. 

    if (codigo_disciplina == '' || nome == '' || sigla == '' || descricao == '') // Verifica se algum campo está vazio.
    {
        window.alert('Por favor, preencha todos os campos!');
        return false;
    }

    // Verifica se a sigla tem exatamente 2 caracteres.
    else if (sigla.length != 2){
        window.alert('O campo "Sigla" deve ter exatamente 2 caracteres!');
        return false;
    }

    // Verifica se o código da disciplina é um número.
    else if (isNaN(codigo_disciplina)){
        window.alert('O campo "Código da Disciplina Correspondente" precisa ser um número!');
        return false;
    }

    return true; // Retorna true se o valor passou por todas as validações sem ser barrado.

}

// Função para criar o componente de nota.
function criarComponente(){
    
    if(validarEntradas() == true){ // Valida as entradas antes de criar o componente.

        const dados = { // Objeto JavaScript com os dados do componente de nota.
            codigo_disciplina: codigo_disciplina,
            nome: nome,
            sigla: sigla,
            descricao: descricao,
        }

        fetch('http://localhost:3000/componente-nota', { // Requisição para o servidor.

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
            window.alert('Componente de nota cadastrado com sucesso!')
            console.log(data)
        })

        .catch(error => { // Captura os erros na requisição e exibe um alerta.
            window.alert('Erro ao criar componente de nota.')
            console.log(error)
        })
    }
}

// Mensagem de confirmação de que o script foi carregado.
console.log("Script de criar_comp.js carregado com sucesso!")