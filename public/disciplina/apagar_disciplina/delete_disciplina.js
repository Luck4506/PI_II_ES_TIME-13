/* Autor: Henrique Young de Azevedo 25005651 */

function validarEntradas(){
    const id_Str = document.querySelector('#disciplina-codigo').value.trim();

    if (!id_Str) // undefined, null e '' (vazio)
    {
        window.alert('Por favor, preencha o campo!')
        return null;
    }

    const id = Number(id_Str);

    if (!Number.isInteger(id) || id <= 0){
        window.alert('Informe um ID numérico válido (inteiro positivo)!')
        return null;
    }

    else {
        return id;
    }

}

function excluirDisciplina(){

    const id = validarEntradas();
    if(id === null) return;

    fetch(`http://localhost:3000/disciplina/${id}`, {
        method: 'DELETE'
    })
    .then(response => {

        if(!response.ok){
            throw new Error(`Falha na exclusão - HTTP ${response.status}`);
        }
        return response.json();
    })

    .then(data => {
        window.alert('Disciplina excluída com sucesso!')
        console.log(data)
    })

    .catch(error => {
        window.alert('Erro ao excluir disciplina.')
        console.log(error)
    })
}

console.log("Script de delete_disciplina.js carregado com sucesso!")