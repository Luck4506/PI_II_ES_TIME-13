
async function adicionar(){

    const botao_cadastrar=document.getElementById("btn-cadastrar");
    
    //desativa clicar o botao novamente.
    botao_cadastrar.disabled = true;

    //pegar os dados do index
    const nome_int=document.getElementById("instituicao-nome").value.toLowerCase().trim();
    const sigla_int=document.getElementById("instituicao-sigla").value.toLowerCase().trim();

    //variavel que verifica a validade dos inputs
    const valido= await verificar_inputs(nome_int,sigla_int);

    if (valido){

        //se tudo der certo faz o cadastro da instituicao
        const realizarCadastro=await cadastrarInstituicao(nome_int,sigla_int);
        if(realizarCadastro){
            const instituicao_id=await pegarIdPorNome(nome_int);
            const realizarCadastroRelacao=await cadastrarRelacao(instituicao_id);
            if(realizarCadastroRelacao){
                console.log("Instituicao cadastrada!");
            alert("Instituicao Cadastrada!");
            botao_cadastrar.disabled = false;
            limparCampos();
            return;
            }
        }
    }else{

        //se nao der certo nao faz o cadastro da instituicao
        botao_cadastrar.disabled = false;
        limparCampos();
        return;
    }
}
async function verificar_inputs(nome,sigla){

    //verifica se os campos estao vazios
    if(nome === ""||sigla===""){
        alert("Preencha todos os campos!");
        return false;
    }

    //verifica se os campos nao tem somente numeros
    if(!isNaN(nome)||!isNaN(sigla)){
        alert("Dados Invalidos!");
        return false;
    }

    //verifica se existe o nome
    const dados={nome};
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
        const existe = await resposta.json();
        if (existe === true) {
            alert("Nome já existe!");
            console.log("Erro na verificacao: nome ja existe");
            return false;
        } else {
            console.log("Todos os inputs são válidos!");
            return true;
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
}
async function cadastrarInstituicao(nome_int, sigla_int) {
    const dados2 = { nome: nome_int, sigla: sigla_int};

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
async function cadastrarRelacao(instituicao_id) {
    const dados={instituicao_id};
    try{
        const resposta = await fetch('/instituicao/cadastrarRelacao', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify(dados)
        });

        if (!resposta.ok){
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return;
        }
        const sucesso = await resposta.json();
        if (sucesso === true) {
            return true;
        } else {
            console.log("Erro ao criar relacao");
            return false;
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
}
async function pegarIdPorNome(nome_int) {
    const dados={nome_int};
    try{
        const resposta = await fetch('/instituicao/verificar/pegarid', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify(dados)
        });

        if (!resposta.ok){
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return;
        }
        const sucesso = await resposta.json();
        if (sucesso) {
            return sucesso;
        } else {
            console.log("Erro ao pegar id");
            return false;
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
}


async function limparCampos() {
    document.getElementById("instituicao-nome").value = "";
    document.getElementById("instituicao-sigla").value = "";
    
}
