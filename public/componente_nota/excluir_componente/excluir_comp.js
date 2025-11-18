/* Autor: Henrique Young de Azevedo 25005651 */

// Função para validar as entradas dos campos.
function validarEntradas(){
    const id_Str = document.querySelector('#componente_nota_id').value.trim(); // Obtém o valor do campo ID e remove espaços em branco.

    if (!id_Str) // Verifica se o campo é undefined, null ou '' (vazio).
    {
        window.alert('Por favor, preencha o campo!')
        return null;
    }

    const id = Number(id_Str); // Converte o valor para número.

    if (!Number.isInteger(id) || id <= 0){ // Verifica se o ID é um número inteiro positivo.
        window.alert('Informe um ID numérico válido (inteiro positivo)!')
        return null;
    }

    return id; // Retorna o ID validado.

}

// Função para excluir o componente de nota.
function excluirComponente(){

    const id = validarEntradas(); // Valida a entrada antes de excluir o componente.
    if(id === null) return; // Sai da função se a validação falhar.

    fetch(`http://localhost:3000/componente-nota/${id}`, { // Requisição para o servidor.
        method: 'DELETE' // Método da requisição.
    })
    .then(response => { // A resposta da requisição é passada como argumento para a arrow function.

        // Verifica se a resposta foi bem-sucedida.
        if(!response.ok){
            throw new Error(`Falha na exclusão - HTTP ${response.status}`);
        }
        return response.json();  // Lê o corpo da resposta HTTP (JSON), faz o parsing
                                // e retorna uma Promise que resolve em um objeto JS.
    })

    .then(data => { // 'data' é o objeto JS resultante do parsing do JSON da resposta.
        window.alert('Componente de nota excluído com sucesso!');
        console.log(data);
    })

    .catch(error => { // Captura erros na cadeia de Promises e exibe um alerta.
        window.alert('Erro ao excluir componente de nota.');
        console.log(error);
    })
}

// Mensagem de confirmação de que o script foi carregado com sucesso.
console.log("Script de excluir_comp.js carregado com sucesso!");