async function remover(){
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    botao_cadastrar.disabled = true;
    const instituicao_id=document.getElementById("instituicao_id").value.toLowerCase().trim();
    const docente_id=document.getElementById("docente_id").value.toLowerCase().trim();
    const valido = await verificar_inputs(instituicao_id,docente_id);
    if (valido){
        const removido=await removerRelacao(instituicao_id,docente_id);
        if(removido){
            limparCampos();
            alert("Docente removido com sucesso!");
            botao_cadastrar.disabled = false;
            return;
        }
    }else{
        limparCampos();
        botao_cadastrar.disabled = false;
        return;
    }
}
async function verificar_inputs(instituicao_id,docente_id){
    if(instituicao_id === ""||docente_id===""||isNaN(instituicao_id)||isNaN(docente_id)){
        alert('Dados Invalidos!');
        return false;
    }
    const existe = await existeRelacao(instituicao_id,docente_id);
    if(existe){
        return true;
    }else{
        alert("Relacao entre Instituicao e docente inexistente");
        return false;
    }
}
async function removerRelacao(instituicao_id,docente_id) {
    const dados = { instituicao_id:instituicao_id, docente_id:docente_id};

    try {
        const resposta = await fetch('/instituicao/removerRelacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        return await resposta.json();
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function existeRelacao(instituicao_id,docente_id) {
    const dados = { instituicao_id: instituicao_id,docente_id};

    try {
        const resposta = await fetch('/instituicao/verificar/existeRelacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        const resultado = await resposta.json();
        return resultado;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function limparCampos(){
    document.getElementById("instituicao_id").value="";
    document.getElementById("docente_id").value="";
}
