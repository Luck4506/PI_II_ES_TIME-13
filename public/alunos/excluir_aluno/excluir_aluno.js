/* Autor: Henrique Young de Azevedo 25005651 */

// Função para validar as entradas dos campos.
function validarEntradas(){
    
    const ra = document.querySelector('#aluno_ra').value.trim(); // Obtém o valor do campo RA e remove espaços em branco.

    if (!ra) // Verifica se o campo é undefined, null ou '' (vazio).
    {
        window.alert('Por favor, preencha o campo!');
        return null;
    }

    else if (isNaN(ra)) // Verifica se o RA é um número.
    {
        window.alert('Esse RA não é um número!');
        return null;
    }

    else if (ra < 0) // Verifica se o RA é um número positivo ou igual a zero.
    {
        window.alert('RA não pode ser um número negativo!');
        return null;
    }

    return ra; // Retorna o RA validado.

}

// Função para excluir o aluno.
function excluirAluno(){

    const ra = validarEntradas(); // Valida a entrada antes de excluir o aluno.
    if(ra === null) return; // Sai da função se a validação falhar.

    fetch(`http://localhost:3000/aluno/${ra}`, { // Requisição para o servidor.
        method: 'DELETE' // Método da requisição.
    })

    // Encadeamento de Promises para tratar a resposta da requisição.
    .then(response => { // A resposta da requisição é passada como argumento para a arrow function.

        // Verifica se a resposta foi bem-sucedida.
        if(!response.ok){
            throw new Error(`Falha na exclusão - HTTP ${response.status}`);
        }
        return response.json(); // Lê o corpo da resposta HTTP (JSON), faz o parsing
                                // e retorna uma Promise que resolve em um objeto JS.
    })

    .then(data => { // 'data' é o objeto JS resultante do parsing do JSON da resposta.
        window.alert('Aluno excluído com sucesso!'); // Alerta de sucesso.
        console.log(data); // Exibe o objeto data no console.
    })

    .catch(error => { // Captura erros na cadeia de Promises e exibe um alerta.
        window.alert('Erro ao excluir aluno.');
        console.log(error);
    })
}

// Mensagem de confirmação de que o script foi carregado.
console.log("Script de excluir_aluno.js carregado com sucesso!");