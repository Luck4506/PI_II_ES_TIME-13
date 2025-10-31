
async function adicionar(){
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const nome_int=document.getElementById("instituicao-nome").value.toLowerCase().trim();
    const sigla_int=document.getElementById("instituicao-sigla").value.toLowerCase().trim();
    //informar o usuario que algo esta acontecendo visualmente.
    botao_cadastrar.innerText = "Processando...";
    //validando os dados enviados.
    const valido= await verificar_inputs(nome_int,sigla_int,botao_cadastrar);
    //se for valido manda os dados para o db
    if (valido){
        const realizarCadastro=await cadastrarInstituicao(nome_int,sigla_int);
        if(realizarCadastro){
            console.log("Instituicao cadastrada!");
            alert("Instituicao Cadastrada!");
            botao_cadastrar.disabled = false;
            botao_cadastrar.innerText="Adicionar";
            return;
        }
    }else{
        console.log("Erro ao cadastrar!");
        botao_cadastrar.disabled = false;
        return;
    }
}
async function verificar_inputs(nome,sigla,botao){
    if(nome === ""||sigla===""){
        botao.innerText="Preencha todos os campos!";
        return false;
    }
    if(!isNaN(nome)||!isNaN(sigla)){
        botao.innerText="Dados Invalidos!";
        return false;
    }
    const dados={nome,sigla};
    try{
        const resposta = await fetch('/instituicao/verificar', {
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
            botao.innerText="Nome ou Sigla ja existe !"
            return false;
        }else{
            console.log("Todos dados sao validos! (Finalizado verificacao de inputs)");
            return true;
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
    //se tudo der certo.
    return true;
}
async function cadastrarInstituicao(nome_int, sigla_int) {
    const docente_id = 1; // ID fixo de teste (depois pode pegar da sessão)
    const dados2 = { nome: nome_int, sigla: sigla_int, docente_id };

    try {
        const resposta = await fetch('/instituicao/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados2)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro no cadastro:', erro);
            return false;
        }

        const data2 = await resposta.json();
        if (data2) return true;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
