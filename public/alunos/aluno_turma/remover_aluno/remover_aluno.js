/* Autor: Henrique Young de Azevedo 25005651 */

// Função para validar as entradas dos campos.
function validarEntradas(){
    
    const ra = document.querySelector('#aluno_ra').value.trim(); // Obtém o valor do campo RA e remove espaços em branco.
    const turma_id = document.querySelector('#turma_id').value.trim(); // Obtém o valor do campo turma_id e remove espaços em branco.

    if (!ra || !turma_id) // Verifica se os campos são undefined, null ou '' (vazio).
    {
        window.alert('Por favor, preencha os campos!');
        return null;
    }

    else if (isNaN(ra) || isNaN(turma_id)) // Verifica se o RA e Turma ID são números.
    {
        window.alert('RA ou Turma ID não é um número!');
        return null;
    }

    else if (Number(ra) < 0 || Number(turma_id) < 0) // Verifica se o RA e Turma ID são números positivos ou iguais a zero.
    {
        window.alert('RA e Turma ID não podem ser um número negativo!');
        return null;
    }

    return { ra, turma_id }; // Retorna o RA e Turma ID validados.

}

// Função para excluir o aluno.
function excluirAluno(){

    const dados = validarEntradas(); // Valida as entradas antes de excluir o aluno da turma.
    if(dados === null) return; // Sai da função se a validação falhar.

    const { ra, turma_id } = dados; // Desestrutura os dados validados.

    fetch(`http://localhost:3000//turma/${turma_id}/aluno/${ra}`, { // Requisição para o servidor.
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
console.log("Script de remover_aluno.js carregado com sucesso!");