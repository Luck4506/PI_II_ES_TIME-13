/* Autor: Henrique Young de Azevedo 25005651 */

// Função para validar as entradas dos campos.
function validarEntradas(){
    const id_Str = document.querySelector('#disciplina-codigo').value.trim(); // Captura o valor do campo 'Código da Disciplina' e remove espaços em branco nas extremidades.

    if (!id_Str) // Verifica se o código da disciplina é undefined, null ou uma string vazia.
    {
        window.alert('Por favor, preencha o campo!')
        return null;
    }

    const id = Number(id_Str); // Converte o código da disciplina para número.

    if (!Number.isInteger(id) || id <= 0){ // Verifica se o ID é um número inteiro positivo.
        window.alert('Informe um ID numérico válido (inteiro positivo)!')
        return null;
    }

    return id; // Retorna o ID após ter passado por todas as validações sem ser barrado.

}

// Função para excluir a disciplina.
function excluirDisciplina(){

    const id = validarEntradas(); // Valida as entradas antes de excluir a disciplina.
    if(id === null) return; // Sai da função se a validação falhar.

    fetch(`http://localhost:3000/disciplina/${id}`, { // Requisição para o servidor.
        method: 'DELETE' // Método da requisição.
    })
    .then(response => { // Resposta da requisição é passada como argumento para a arrow function.

        // Verifica se a resposta da requisição foi bem-sucedida.
        if(!response.ok){
            throw new Error(`Falha na exclusão - HTTP ${response.status}`);
        }
        return response.json(); // Lê o corpo da resposta HTTP (JSON), faz o parsing e retorna uma Promise.
                                // que resolve em um objeto JS.
    })

    .then(data => { // 'data' é o objeto JS resultante do parsing do JSON da resposta.
        window.alert('Disciplina excluída com sucesso!')
        console.log(data)
    })

    .catch(error => { // Captura erros na requisição e exibe um alerta.
        window.alert('Erro ao excluir disciplina.')
        console.log(error)
    })
}

// Mensagem de confirmação de carregamento do script.
console.log("Script de delete_disciplina.js carregado com sucesso!")