/* Preciso melhorar a parte de tratamento de erros desse arquivo */
function validarEntradas(){
    const id = Number(document.querySelector('#disciplina-codigo').value)

    if (id == '')
    {
        window.alert('Por favor, preencha o campo!')
        return null
    }

    else if (Number.isNaN(id) || id <= 0){
        window.alert('Informe um ID numérico válido!')
        return null
    }

    else {
        return id
    }

}

function excluirDisciplina(){
    const id = validarEntradas()
    if(!id) return

    fetch(`http://localhost:3000/disciplina/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())

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