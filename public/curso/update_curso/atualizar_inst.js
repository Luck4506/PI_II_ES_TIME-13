
async function atualizarCurso(){
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const id_instituicao=document.getElementById("id_instituicao").value.trim();
    const nome_antigo=document.getElementById("nome_antigo").value.toLowerCase().trim();
    const nome_novo=document.getElementById("nome_novo").value.toLowerCase().trim();
    
    //validando os dados enviados.
    const valido= await verificar_inputs(id_instituicao,nome_antigo,nome_novo);
    if (valido){
        const dados={ nome: nome_int, sigla: sigla_int_nova };
        try{
        const resposta = await fetch('/instituicao/atualizar', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify(dados)
        });
        if (!resposta.ok){
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return;
        }
        const data=await resposta.json();
        if (data === true){
            console.log("Sigla Atualizada com sucesso!");
            alert('Sigla atualizada com sucesso !');
            botao_cadastrar.disabled = false;
            return true;
        }else{
            alert('Nome de instituição nao existe !');
            botao_cadastrar.disabled = false;
            return false;
            
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
    }else{
        console.log("Erro ao atualizar!");
        botao_cadastrar.disabled = false;
        return;
    }
}
async function verificar_inputs(id_instituicao,nome_antigo,nome_novo){
    if(id_instituicao === ""||nome_antigo===""||nome_novo===""){
        alert('Preencha todos os campos!');
        return false;
    }
    if(isNaN(id_instituicao)||!isNaN(nome_antigo)||!isNaN(nome_novo)){
        alert('Dados Invalidos!');
        return false;
    }
    
    const dados={id_instituicao,nome_antigo};
    try{
        const resposta = await fetch('/curso/verificar', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify(dados)
        });
        if (!resposta.ok){
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return;
        }
        const data=await resposta.json();
        if (data && data.id){
            console.log("Curso existe! (Finalizado verificacao de inputs)");
            return true;
        }else{
            console.log("Id ou curso nao existe !");
            return false;
            
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
    //se tudo der certo.
    return true;
}