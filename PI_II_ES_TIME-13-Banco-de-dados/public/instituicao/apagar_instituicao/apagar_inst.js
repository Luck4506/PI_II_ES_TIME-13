async function apagar(){
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const nome_int=document.getElementById("instituicao-nome").value.toLowerCase().trim();
    const sigla_int=document.getElementById("instituicao-sigla").value.toLowerCase().trim();
    //validando os dados enviados.
    const valido= await verificar_inputs(nome_int,sigla_int,botao_cadastrar);
    //se for valido manda os dados para o db
    document.getElementById("instituicao-nome").value = "";
    document.getElementById("instituicao-sigla").value = "";
    if (valido){
        const pegarIdInstPorNome = await pegarIdPorNome(nome_int);

        const temDocente = await existeDocente(pegarIdInstPorNome);
        console.log('Tem docente:', temDocente);

        const temCurso = await existeCurso(pegarIdInstPorNome);
        console.log('Tem curso:', temCurso);

        if (!temDocente) {
            if(!temCurso){
                const apagado=await apagarInstituicao(nome_int,sigla_int);
                if (apagado){
                    console.log("Instituicao apagada com sucesso!");
                    alert('Instituicao apagada com sucesso!');
                    botao_cadastrar.disabled = false;
                    return;
                }else{
                    console.log("Dados nao encontrados!");
                    alert('Nome ou Sigla nao encontrado!');
                    botao_cadastrar.disabled = false;
                    return;
                }
            }else{
                alert("Ainda existe Curso(s) registrados nessa instituicao!");
                console.log("Ainda existe Curso(s) relacionados a essa instituicao!");
                botao_cadastrar.disabled = false;
                return;
            }
            
        }else{
            alert("Ainda existe docente(s) registrados nessa instituicao!");
            console.log("Ainda existe docente(s) relacionados a essa instituicao!");
            botao_cadastrar.disabled = false;
            return;
        }
    }else{
        botao_cadastrar.disabled = false;
        return;
    }
}
async function verificar_inputs(nome,sigla,botao){
    if(nome === ""||sigla===""||!isNaN(nome)||!isNaN(sigla)){
        alert('Dados Invalidos!');
        botao.disabled = false;
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
        if (data){
            console.log("Todos dados sao validos!");
            return true;
        }else{
            console.log("Instituicao nao existe!");
            alert('Instituicao nao existe!');
            return false;
        }
    }catch (erro){
        console.error('Erro no servidor:',erro);
        return false;
    }
}
async function apagarInstituicao(nome_int, sigla_int) {
    const dados = { nome: nome_int, sigla: sigla_int};

    try {
        const resposta = await fetch('/instituicao/apagar', {
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
async function pegarIdPorNome(nome_int) {
    const dados = { nome: nome_int};

    try {
        const resposta = await fetch('/instituicao/verificar/pegarid', {
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
async function existeDocente(instituicao_id) {
    const dados = { instituicao_id: instituicao_id};

    try {
        const resposta = await fetch('/instituicao/verificar/existeDocente', {
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
        return resultado.existe;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function existeCurso(instituicao_id) {
    const dados = { instituicao_id: instituicao_id};

    try {
        const resposta = await fetch('/instituicao/verificar/existeCurso', {
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
        return resultado.existe;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

