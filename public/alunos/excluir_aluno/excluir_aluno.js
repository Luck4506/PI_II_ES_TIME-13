
function validarEntradas(){
    const ra = document.querySelector('#aluno_ra').value.trim();

    if (!ra) // undefined, null e '' (vazio)
    {
        window.alert('Por favor, preencha o campo!');
        return null;
    }

    else if (isNaN(ra))
    {
        window.alert('Esse RA não é um número!');
        return null;
    }

    else if (ra < 0)
    {
        window.alert('RA não pode ser um número negativo!');
        return null;
    }

    return ra;

}

function excluirDisciplina(){

    const ra = validarEntradas();
    if(ra === null) return;

    fetch(`http://localhost:3000/aluno/${ra}`, {
        method: 'DELETE'
    })
    .then(response => {

        if(!response.ok){
            throw new Error(`Falha na exclusão - HTTP ${response.status}`);
        }
        return response.json();
    })

    .then(data => {
        window.alert('Aluno excluído com sucesso!');
        console.log(data);
    })

    .catch(error => {
        window.alert('Erro ao excluir aluno.');
        console.log(error);
    })
}

console.log("Script de excluir_aluno.js carregado com sucesso!");