async function cadastraDisciplina() {

    const botao_cadastrar=document.getElementById("btn-cadastrar");
    botao_cadastrar.disabled = true;

    const nome=document.getElementById("disciplina-nome").value.trim();
    const sigla=document.getElementById("disciplina-sigla").value.trim();
    const codigo=document.getElementById("disciplina-codigo").value.trim();
    const periodo=document.getElementById("disciplina-periodo").value.trim();
    
    const valido=await verificarInput(nome,sigla,codigo,periodo,botao_cadastrar);
    if (valido){
        try {
        const resposta = await fetch("/adicionar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            nome,
            sigla,
            codigo,
            periodo
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
async function verificarInput(nome,sigla,codigo,periodo,botao) {
    if(nome===""||sigla===""||codigo===""||periodo===""){
        botao.innerText="Preencha todos os campos!";
        return false;
    }
    if(!isNaN(nome)||!isNaN(sigla)||!isNaN(periodo)){
        botao.innerText="Dados invalidos!";
        return false;
    }
    if(isNaN(codigo)){
        botao.innerText="Codigo so pode ser numero!";
        return false;
    }
    const existeDisciplina=await pesq_dado_no_db("nome",nome)
    if(existeDisciplina){
        botao.innerText="Disciplina ja existe!";
        return false;
    }
    const existeCodigo=await pesq_dado_no_db("codigo",codigo)
    if(existeCodigo){
        botao.innerText="Codigo de disc. ja existe!";
        return false;
    }
    //se tudo tiver certo
    return true;
}
async function pesq_dado_no_db(campo,valor) {
    try{
        const resposta=await fetch("/verificarDisciplina", {
            method: "POST",
            headers: {"Content-type":"application/json"},
            body: JSON.stringify({campo,valor})
        });
        const dados=await resposta.json();
        return dados.existe;
    }catch (erro){
        console.log("Erro ao verificar no banco:", erro);
        return false;
    }
}