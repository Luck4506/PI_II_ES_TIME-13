/* Autor: Henrique Young de Azevedo 25005651 */

// Variáveis globais para capturar entradas
let ra = '';
let cod_turma = '';

// Função para capturar entradas do usuário
function capturarEntradas(){

    ra = document.querySelector('#aluno_ra').value.trim(); // Trim para remover espaços em branco.
    cod_turma = document.querySelector('#cod_turma').value.trim();
}

// Função para validar entradas do usuário
function validarEntradas(){

    capturarEntradas();

    if (ra === '' || cod_turma === '') // Verifica se algum campo está vazio
    {
        window.alert('Por favor, preencha todos os campos!');
        return false;
    }

    // Verifica se os valores são numéricos.
    else if(isNaN(ra))
    {
        window.alert('Esse RA não é um número.');
        return false;        
    }

    else if(isNaN(cod_turma))
    {
        window.alert('Esse Código da turma não é um número.');
        return false;        
    }

    // Verifica se os valores não são negativos.
    else if(Number(ra) < 0)
    {
        window.alert('O RA não pode ser um número negativo.');
        return false;
    }

    else if(Number(cod_turma) < 0)
    {
        window.alert('O Código da turma não pode ser um número negativo.');
        return false;
    }

    return true; // Retorna true se os valores passaram por todas as validações sem serem barrados.

}

// Função para cadastrar o aluno na turma
function cadastrarAluno(){
    
    // Valida as entradas antes de cadastrar o aluno na turma.
    if(validarEntradas() === true){

        const dados = { // Objeto JavaScript com o RA do aluno e Código da turma.
            ra_aluno: Number(ra),        // antes era ra
            codigo_turma: Number(cod_turma), // antes era cod_turma
}

        fetch('/turma/adicionar-aluno', { // Requisição para o servidor.

            method: 'POST', // Método da requisição.

            // requisição é dividida em duas partes: headers e body.
            headers: {
                'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON.
            },
            body: JSON.stringify(dados) // Converte os dados para JSON e os envia no corpo da requisição.
        })
        .then(response => response.json()) // Lê o corpo da resposta HTTP (JSON), faz o parsing
                                           // e retorna uma Promise que resolve em um objeto JS.

        .then(data => { // 'data' é o objeto JS resultante do parsing do JSON da resposta.
            window.alert('Aluno cadastrado na turma com sucesso!'); // Alerta de sucesso.
            console.log(data); // Exibe o objeto data no console.
        })

        .catch(error => { // Em caso de erro, exibe um alerta de erro e loga o erro no console.
            window.alert('Erro ao cadastrar aluno na turma.');
            console.log(error);
        })

    } else{
        console.log('Validação de entradas falhou.'); // Exibe no console que a validação falhou.
    }
}

// Mensagem de indicação de que o script foi carregado com sucesso.
console.log("Script de aluno_turma.js carregado com sucesso!")

document.addEventListener('DOMContentLoaded', () => {
    const botoes = document.querySelectorAll('#aluno_button');
    botoes.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            cadastrarAluno();
        });
    });
});