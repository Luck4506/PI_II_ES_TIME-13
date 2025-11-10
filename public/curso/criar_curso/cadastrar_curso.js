
async function criarCurso(){
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const id_inst=document.getElementById("instituicao_id").value.trim();
    const nome_curso=document.getElementById("nome_curso").value.toLowerCase().trim();
    //validando os dados enviados.
    const valido= await verificar_inputs(id_inst, nome_curso, botao_cadastrar);
    //se for valido manda os dados para o db
    if (valido){
        const valido_aux=await verificar_inputs_aux(id_inst,nome_curso);
        if(valido_aux){
            const estaInstiticao=await verificarDentroDaInstituuicao(id_inst);
            if(estaInstiticao){
                const realizarCreate=await createCurso(id_inst,nome_curso);
                if(realizarCreate){
                    const curso_id=await pegarIdCurso(nome_curso,id_inst);
                    const realizarCreateRelacao=await createRelacao(curso_id);
                    if(realizarCreateRelacao){
                        console.log("Curso cadastrado!");
                        alert("Curso Cadastrado!");
                        botao_cadastrar.disabled = false;
                        limparCampos(id_inst,nome_curso);
                        return;
                    }
                }
            }
            botao_cadastrar.disabled = false;
            limparCampos(id_inst,nome_curso);
            return;
        }else{
            botao_cadastrar.disabled = false;
            limparCampos(id_inst,nome_curso);
            return;
        }
    }else{
        console.log("Erro ao criar curso!");
        botao_cadastrar.disabled = false;
        limparCampos(id_inst,nome_curso);
        //funcaozinha de limpar os campos depois de envialos
        return;
    }
}
async function verificar_inputs(id, nome, botao) {
    // Validação básica
    if (id === "" || nome === "") {
        alert("Preencha todos os campos!");
        botao.disabled = false;
        return false;
    }
    if (isNaN(Number(id)) || !isNaN(Number(nome))) {
        alert("Dados Inválidos!");
        botao.disabled = false;
        return false;
    }

    // Dados para verificação da instituição
    const dados = { instituicao_id: Number(id) };

    try {
        const resposta = await fetch('/curso/verifyInstituicao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }

        const existeInstituicao = await resposta.json(); // espera receber true ou false

        if (existeInstituicao) {
            console.log("Instituição existe!");
            return true;
        } else {
            alert("Instituição não encontrada!");
            botao.disabled = false;
            return false;
        }

    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function verificar_inputs_aux(id, nome) {

    // Dados para verificação da instituição
    const dados = { instituicao_id: Number(id), nome };

    try {
        const resposta = await fetch('/curso/verifyCurso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }

        const existeCurso = await resposta.json(); // espera receber true ou false

        if (existeCurso) {
            alert("Curso ja existe nessa instituicao!");
            return false;
        } else {
            return true;
        }

    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function createCurso(id,nome) {
    const dados = { instituicao_id: id, nome: nome};

    try {
        const resposta = await fetch('/curso/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro no cadastro:', erro);
            return false;
        }

        const data = await resposta.json();
        return data;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

async function createRelacao(curso_id) {
    const dados = { curso_id: curso_id };

    try {
        const resposta = await fetch('/curso/cadastrarRelacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro no cadastro:', erro);
            return false;
        }

        const data = await resposta.json();
        return data;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function pegarIdCurso(nome,instituicao_id) {
    const dados = {nome: nome,instituicao_id:instituicao_id};

    try {
        const resposta = await fetch('/curso/verificar/pegarid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro no cadastro:', erro);
            return false;
        }

        const sucesso = await resposta.json();
        return sucesso;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function verificarDentroDaInstituuicao(instituicao_id) {
  const dados = { instituicao_id:instituicao_id };
    try {
        const resposta = await fetch('/curso/verifyEstaInstituicao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }
        const estaDentroInstituicao = await resposta.json();
        if (estaDentroInstituicao) {
            return true;
        } else {
            alert("Entre na instituicao para criar um curso!");
            return false;
        }
  } catch (erro) {
    console.error('Erro no servidor:', erro);
    return false;
  }
}
function limparCampos(id,nome){
    document.getElementById("instituicao_id").value = "";
    document.getElementById("nome_curso").value = "";
}
