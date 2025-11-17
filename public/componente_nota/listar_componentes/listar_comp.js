/* Autor: Henrique Young de Azevedo 25005651 */

function validarId(id){

    if(id === undefined || id === null || id === ''){
        throw new Error('Campo vazio.');
    }

    id = Number(id);

    if(Number.isNaN(id)){
        throw new Error('Esse ID não é um número.')
    }

    if(!Number.isInteger(id)){
        throw new Error('Esse ID não é um inteiro.');
    }

    if(id <= 0){
        throw new Error('Valor inválido para ID. Digite um número inteiro positivo diferente de zero.');
    }

    return id;
}

async function preencherTabela(){ // dados é o JSON

    try{
        let disciplinaId_Str = document.getElementById('componente_disc_id').value.trim();
        const disciplinaId = validarId(disciplinaId_Str);

        const dados = await fetch(`/componentes-nota/${disciplinaId}`)
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
    catch(error){
        console.error(error);
    }
}