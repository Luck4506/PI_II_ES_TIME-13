async function apagarCurso(){
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const instituicao_id=document.getElementById("instituicao_id").value.toLowerCase().trim();
    const nome=document.getElementById("nome_curso").value.toLowerCase().trim();
    //validando os dados enviados.
    const valido= await verificar_inputs(instituicao_id,nome,botao_cadastrar);
    //se for valido manda os dados para o db
    if (valido){

        const pegarIdCursoPorNomeEIdInst = await pegarIdCurso(instituicao_id,nome);
        console.log('Id curso:',pegarIdCursoPorNomeEIdInst);


        const temDisciplina = await existeDisciplina(pegarIdCursoPorNomeEIdInst);
        console.log('Tem disciplina:', temDisciplina);

        if(!temDisciplina){
            const apagado=await apagarCursoDb(instituicao_id,nome);
            if (apagado){
                console.log("Curso apagada com sucesso!")
                alert('Curso apagada com sucesso!');
                botao_cadastrar.disabled = false;
                limparCampos();
                return;
            }
        }else{
            alert('Apague todas as disciplinas para apagar curso!')
            botao_cadastrar.disabled = false;
            limparCampos();
            return;
        }
        
    }else{
        limparCampos();
        botao_cadastrar.disabled = false;
        return;
    }
}
async function verificar_inputs(instituicao_id,nome){
    if(nome === ""||instituicao_id===""||!isNaN(nome)||isNaN(instituicao_id)){
        alert('Dados Invalidos!');
        console.log("Dados Invalidos!")
        return false;
    }else{
        
        const dados = { instituicao_id:instituicao_id, nome:nome};

    try {
        const resposta = await fetch('/curso/verificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        const data=await resposta.json();
        if (data.existeInst) {
            console.log("Curso e id instituicao existem!");
            return true;
        } else {
            console.log("Curso ou id instituicao não existe!");
            alert("Id de instituicao ou nome de curso nao existe!");
            return false;
        }
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
    }
    
}
async function apagarCursoDb(instituicao_id,nome) {
    const dados = { instituicao_id:instituicao_id,nome: nome};

    try {
        const resposta = await fetch('/curso/apagar', {
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
async function pegarIdCurso(instituicao_id,nome) {
    const dados = { nome: nome,instituicao_id:instituicao_id};

    try {
        const resposta = await fetch('/curso/verificar/pegarid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        const { cursoId } = await resposta.json();
        return cursoId;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

function limparCampos(){
    document.getElementById("instituicao_id").value = "";
    document.getElementById("nome_curso").value = "";
}
async function existeDisciplina(curso_id) {
    const dados = {curso_id:curso_id};

    try {
        const resposta = await fetch('/curso/verificar/disciplina', {
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

