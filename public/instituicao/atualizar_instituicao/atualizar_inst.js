
async function atualizar(){
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const nome_int=document.getElementById("instituicao-nome").value.toLowerCase().trim();
    const sigla_int_nova=document.getElementById("instituicao-sigla").value.toLowerCase().trim();
    //informar o usuario que algo esta acontecendo visualmente.
    
    //validando os dados enviados.
    const valido= await verificar_inputs(nome_int,sigla_int_nova,botao_cadastrar);
    document.getElementById("instituicao-nome").value = "";
    document.getElementById("instituicao-sigla").value = "";
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
async function verificar_inputs(nome,sigla_nova,botao){
    if(nome === ""||sigla_nova===""){
        alert('Preencha todos os campos!');
        botao.disabled = false;
        return false;
    }
    if(!isNaN(nome)||!isNaN(sigla_nova)){
        alert('Dados Invalidos!');
        botao.disabled = false;
        return false;
    }
    
    const dados={nome,sigla_nova};
    try{
        const resposta = await fetch('/instituicao/atualizar/verificar', {
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
            console.log("Todos dados sao validos! (Finalizado verificacao de inputs)");
            return true;
        }else{
            botao.innerText="Nome de instituição nao existe !"
            return false;
            
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
    //se tudo der certo.
    return true;
}