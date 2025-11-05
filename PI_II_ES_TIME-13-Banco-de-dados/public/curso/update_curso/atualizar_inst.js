
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
        const novoNomeJaExiste=await verificar_existe(id_instituicao,nome_novo);
        if(novoNomeJaExiste){
            botao_cadastrar.disabled = false;
            return;
        }else{
            const atualizado=await enviarNovosDados(nome_antigo,nome_novo,id_instituicao);
            if(atualizado){
                alert("Nome do curso atualizado!");
                console.log("Nome do curso atualizado com sucesso!");
                botao_cadastrar.disabled = false;
                limparCampos();
                return;
            }
        }
        
    }else{
        botao_cadastrar.disabled = false;
        limparCampos();
        return;
    }
}
async function verificar_inputs(id_instituicao,nome_antigo,nome_novo){
    if(id_instituicao === ""||nome_antigo===""||nome_novo===""){
        alert('Preencha todos os campos!');
        return false;
    }
    if(isNaN(id_instituicao)||!isNaN(nome_antigo)||!isNaN(nome_novo)||nome_antigo===nome_novo){
        alert('Dados Invalidos!');
        return false;
    }
    
    const dados={instituicao_id: id_instituicao, nome: nome_antigo};
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
        if (data.existeInst) {
            console.log("Curso e id instituicao existem!");
            return true;
        } else {
        console.log("Curso ou id instituicao não existe!");
        return false;
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
}
async function enviarNovosDados(nome_antigo,nome_novo,instituicao_id){
    const dados={nome_antigo,nome_novo,instituicao_id};
    try{
        const resposta = await fetch('/curso/atualizar', {
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
        if (data){
            return true;
        }else{
            return false;
            
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
}
async function verificar_existe(id_instituicao,nome_novo){
    const dados={instituicao_id: id_instituicao, nome: nome_novo};
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
        if (data.existeInst) {
            alert("Nome novo do curso ja existe no db!");
            console.log("Novo nome existe no db!")
            limparCampos();
            return true;
        } else {
        return false;
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
}
function limparCampos(){
    document.getElementById("id_instituicao").value = "";
    document.getElementById("nome_antigo").value = "";
    document.getElementById("nome_novo").value = "";
}