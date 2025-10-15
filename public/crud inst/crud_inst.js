const { text } = require("express");

function adicionar(){
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    const nome_int=document.getElementById("instituicao-nome").value.trim();
    const nome_curso=document.getElementById("instituicao-curso").value.trim();
    botao_cadastrar.innerText = "Processando...";
    if(verificar_inputs(nome_int,nome_curso,botao_cadastrar)){
        console.log("cadastro realizado");
    }
}
function verificar_inputs(nome,curso,botao){
    const nome_inst_tabela="nome";
    const nome_curso_tabela="nome";
    if(nome === ""||curso===""){
        botao.innerText="Preencha todos os campos!";
        return false;
    }else{
        if(!isNaN(nome)||!isNaN(curso)){
            botao.innerText="Dados Invalidos!";
            return false;
        }else{
            if(pesq_dado_no_db(nome_inst_tabela,nome)){
                botao.innerText="Nome de inst. ja existente";
                return false;
            }else{
                if(pesq_dado_no_db(nome_curso_tabela,curso)){
                   botao.innerText="Nome de curso ja existente";
                    return false; 
                }else{
                    //se tudo der certo.
                    botao.innerText="Cadastro realizado!"
                    return true;
                }
            }
        }
    }
}
function pesq_dado_no_db(nome_na_tabela,dado){
    
}