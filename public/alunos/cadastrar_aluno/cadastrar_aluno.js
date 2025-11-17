/* Autor: Henrique Young de Azevedo 25005651 */

// Variáveis globais para o RA e Nome do aluno.
let ra = '';
let nome = '';

// Função para capturar as entradas dos campos.
function capturarEntradas(){

    ra = document.querySelector('#aluno_ra').value.trim(); // Trim para remover espaços em branco.
    nome = document.querySelector('#aluno_nome').value.trim();
}

// Função para validar as entradas dos campos.
function validarEntradas(){

    capturarEntradas();

    // Verifica se os campos estão vazios.
    if (ra === '' || nome === '')
    {
        window.alert('Por favor, preencha todos os campos!');
        return false;
    }

    // Verifica se o RA é um número.
    else if(isNaN(ra))
    {
        window.alert('Esse RA não é um número.');
        return false;        
    }

    // Verifica se o RA é um número positivo ou igual a zero.
    else if(Number(ra) < 0)
    {
        window.alert('O RA não pode ser um número negativo.');
        return false;
    }

    return true; // Retorna true se o valor passou por todas as validações sem ser barrado.

}

// Função para cadastrar o aluno.
function cadastrarAluno(){
    
    // Valida as entradas antes de cadastrar o aluno.
    if(validarEntradas() === true){

        const dados = { // Objeto JavaScript com os dados do aluno.
            ra: ra,
            nome: nome,           
        }

        fetch('http://localhost:3000/aluno', { // Requisição para o servidor.

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
            window.alert('Aluno cadastrado com sucesso!'); // Alerta de sucesso.
            console.log(data); // Exibe o objeto data no console.
        })

        .catch(error => { // Em caso de erro, exibe um alerta de erro e loga o erro no console.
            window.alert('Erro ao cadastrar aluno.');
            console.log(error);
        })

    } else{
        console.log('Validação de entradas falhou.'); // Exibe no console que a validação falhou.
    }
}

// Mensagem de confirmação de que o script foi carregado.
console.log("Script de cadastrar_aluno.js carregado com sucesso!")