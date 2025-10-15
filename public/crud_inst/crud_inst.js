const { text } = require("express");

async function adicionar(){
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const nome_int=document.getElementById("instituicao-nome").value.trim();
    const nome_curso=document.getElementById("instituicao-curso").value.trim();
    //informar o usuario que algo esta acontecendo visualmente.
    botao_cadastrar.innerText = "Processando...";
    //validando os dados enviados.
    const valido= await verificar_inputs(nome_int,nome_curso,botao_cadastrar);
    //se for valido manda os dados para o db
    if (valido) {
        try {
        const resposta = await fetch("/adicionar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            instituicao: nome_int,
            curso: nome_curso,
            }),
        });

        const dados = await resposta.json();
        //se tiver salvo no db retorna um .json de (sucesso:boolean=true ou false)
        if (dados.sucesso) {
            botao_cadastrar.innerText = "Cadastro realizado com sucesso!";
            console.log("✅ Inserido no banco com sucesso!");
        } else {
            botao_cadastrar.innerText = "Erro ao inserir no banco!";
        }
        } catch (erro) {
        console.error("Erro na requisição:", erro);
        botao_cadastrar.innerText = "Erro de conexão com o servidor!";
        }
    }
    botao_cadastrar.disabled = false;
}
async function verificar_inputs(nome,curso,botao){
    if(nome === ""||curso===""){
        botao.innerText="Preencha todos os campos!";
        return false;
    }
    if(!isNaN(nome)||!isNaN(curso)){
        botao.innerText="Dados Invalidos!";
        return false;
    }
    const existeInstituicao=await pesq_dado_no_db("instituicao",nome);
    if(existeInstituicao){
        botao.innerText="Nome de inst. ja existente";
        return false;
    }
    const existeCurso=await pesq_dado_no_db("curso",nome);
    if(existeCurso){
        botao.innerText="Nome de curso ja existente";
        return false; 
    }
    //se tudo der certo.
    return true;
        
}
//primeiro feito para aprender como funcionar para replicar com proximas funcoes
async function pesq_dado_no_db(campo,valor){
     try {
        const resposta = await fetch("/verificar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ campo, valor })
        });

        const dados = await resposta.json();
        return dados.existe; // true se já existe, false se não
    } catch (erro) {
        console.error("Erro ao verificar no banco:", erro);
        return false; // Em caso de erro, retorna false pra não travar
    }
}