/* Autor: Henrique Young de Azevedo 25005651 */

// Função para validar o ID da disciplina.
function validarId(id){

    if(id === undefined || id === null || id === ''){ // Verifica se o campo é undefined, null ou vazio.
        throw new Error('Campo vazio.');
    }

    id = Number(id); // Converte para número.

    if(Number.isNaN(id)){ // Verifica se é um número.
        throw new Error('Esse ID não é um número.')
    }

    if(!Number.isInteger(id)){ // Verifica se é um número inteiro.
        throw new Error('Esse ID não é um inteiro.');
    }

    if(id <= 0){ // Verifica se é positivo e diferente de zero.
        throw new Error('Valor inválido para ID. Digite um número inteiro positivo diferente de zero.');
    }

    return id; // Retorna o ID validado.
}

// Função para listar os componentes de nota da disciplina.
async function preencherTabela(){ // dados é o JSON

    try{
        let disciplinaId_Str = document.getElementById('componente_disc_id').value.trim(); // Obtém o valor do campo de ID da Disciplina e remove espaços em branco desnecessários.
        const disciplinaId = validarId(disciplinaId_Str); // Valida o ID da disciplina.

        const dados = await fetch(`/componentes-nota/${disciplinaId}`) // Requisição para o servidor.
            .then(response => { // Lança a resposta da requisição como argumento para a arrow function.

            // Verifica se a resposta foi bem-sucedida.
            if(!response.ok){
                throw new Error("Não foi possível buscar o recurso.");
            }            

            return response.json(); // Lê o corpo da resposta HTTP (JSON), faz o parsing
                                    // e retorna uma Promise que resolve em um objeto JS.
        })

        const tbody = document.querySelector(".table tbody"); // Constante representando o <tbody>
        tbody.innerHTML = ""; // Limpa a tabela.

        // text-muted, classe do Bootstrap, deixa o texto cinza.

        // Verifica se o array está vazio ou não é um array.
        if(!Array.isArray(dados) || dados.length === 0){
            tbody.innerHTML = `<tr><td colspan="5" class = "text-muted">Nenhum registro encontrado.</td></tr>`; // Mescla as colunas horizontalmente (colspan). Restando uma única célula (intersecção).
            return;
        }

        dados.forEach(item => { // Para cada elemento do array de objetos JSON.
            
            const tr = document.createElement("tr");
            tr.innerHTML =
            `
                <th>${item.id}</th>
                <td>${item.codigo_disciplina}</td>
                <td>${item.nome}</td>
                <td>${item.sigla}</td>
                <td>${item.descricao}</td>
            `;

            tbody.append(tr); // Insere a(s) nova(s) linha(s) no tbody ( corpo da tabela --> <tbody>[...]</tbody> );
        })
    }
    catch(error){ // Captura qualquer erro ocorrido no bloco try.
        console.error(error);
    }
}