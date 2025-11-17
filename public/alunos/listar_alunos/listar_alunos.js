/* Autor: Henrique Young de Azevedo 25005651 */

// Função para validar o ID da turma.
function validarId(id){

    if(id === undefined || id === null || id === ''){ // Verifica se o campo é undefined, null ou '' (vazio).
        throw new Error('Campo vazio.');
    }

    id = Number(id); // Converte a string para número.

    if(Number.isNaN(id)){ // Verifica se a conversão resultou em NaN (Not a Number).
        throw new Error('Esse ID não é um número.')
    }

    if(!Number.isInteger(id)){ // Verifica se o número é um inteiro.
        throw new Error('Esse ID não é um inteiro.');
    }

    if(id <= 0){ // Verifica se o número é positivo e diferente de zero.
        throw new Error('Valor inválido para ID. Digite um número inteiro positivo diferente de zero.');
    }

    return id; // Retorna o ID validado.
}

async function preencherTabela(){ // dados é o JSON

    try{
        let turmaId_Str = document.getElementById('aluno_cod_turma').value.trim(); // Pega o código da turma do input (string).
        const turmaId = validarId(turmaId_Str); // Valida o código da turma.

        const dados = await fetch('/alunos') // <-- Falta a rota (por enquanto está listando sem filtro).
            .then(response => {

            if(!response.ok){
                throw new Error("Não foi possível buscar o recurso.");
            }            

            return response.json();
        })

        const tbody = document.querySelector(".table tbody"); // Constante representando o <tbody>
        tbody.innerHTML = ""; // Limpa a tabela.

        // text-muted, classe do Bootstrap, deixa o texto cinza.

        if(!Array.isArray(dados) || dados.length === 0){
            tbody.innerHTML = `<tr><td colspan="5" class = "text-muted">Nenhum registro encontrado.</td></tr>`; // Mescla as colunas horizontalmente (colspan). Restando uma única célula (intersecção).
            return;
        }

        dados.forEach(item => { // Para cada elemento do array de objetos JSON.
            
            const tr = document.createElement("tr"); // Dava para ter declarado uma constante para cada elemento criado e inserido
            tr.innerHTML =                           // valores no .textContent (desse modo: tdNome.textContent = data.nome); 
            `
                <th>${item.ra}</th>
                <td>${item.nome}</td>
                <td>${item.criado_em}</td>
            `;

            tbody.append(tr); // Insere a(s) nova(s) linha(s) no tbody ( corpo da tabela --> <tbody>[...]</tbody> );
        })
    }
    catch(error){
        console.error(error);
    }
}