//Codigo de autoria de Pedro Vinicius Romanato
async function apagar() {
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const nome_int = document.getElementById("instituicao-nome").value.toLowerCase().trim();
    const sigla_int = document.getElementById("instituicao-sigla").value.toLowerCase().trim();
    //validando os dados enviados.
    const valido = await verificar_inputs(nome_int, sigla_int, botao_cadastrar);
    //se for valido manda os dados para o db
    // Limpa os campos do formulario, independentemente do resultado
    document.getElementById("instituicao-nome").value = "";
    document.getElementById("instituicao-sigla").value = "";
    //se os inputs forem validos
    if (valido) {
        // Pega o ID da instituicao usando o nome
        const pegarIdInstPorNome = await pegarIdPorNome(nome_int);
        //feito e fuuncional
        // Verifica se ha docentes vinculados a esse ID
        const temDocente = await existeDocente(pegarIdInstPorNome);
        console.log('Tem docente:', temDocente);
        //arumar tudo do curso antes de implementar
        // Verifica se ha cursos vinculados a esse ID
        const temCurso = await existeCurso(pegarIdInstPorNome);
        console.log('Tem curso:', temCurso);

        // Se NAO houver docentes...
        if (!temDocente) {

            // Se TAMBEM NAO houver cursos...
            if (!temCurso) {
                // Tenta apagar a instituicao
                const apagado = await apagarInstituicao(nome_int, sigla_int);
                // Se o 'apagar' retornar sucesso...
                if (apagado) {
                    console.log("Instituicao apagada com sucesso!");
                    alert('Instituicao apagada com sucesso!');
                    // Reativa o botao
                    botao_cadastrar.disabled = false;
                    return;
                } else {
                    // Se 'apagado' for falso (nao encontrou ou nao apagou)
                    console.log("Dados nao encontrados!");
                    alert('Nome ou Sigla nao encontrado!');
                    botao_cadastrar.disabled = false;
                    return;
                }
            } else {
                // Se 'temCurso' for verdadeiro
                alert("Ainda existe Curso(s) registrados nessa instituicao!");
                console.log("Ainda existe Curso(s) relacionados a essa instituicao!");
                // Reativa o botao
                botao_cadastrar.disabled = false;
                return;
            }

        } else {
            // Se 'temDocente' for verdadeiro
            alert("Ainda existe docente(s) registrados nessa instituicao!");
            console.log("Ainda existe docente(s) relacionados a essa instituicao!");
            // Reativa o botao
            botao_cadastrar.disabled = false;
            return;
        }
    } else {
        // Se 'valido' for falso (veio do verificar_inputs)
        // Reativa o botao
        botao_cadastrar.disabled = false;
        return;
    }
}
//funcao que verifica os inputs de nome e sigla
async function verificar_inputs(nome, sigla, botao) {
    //Verifica se campos estao vazios ou se sao apenas numeros
    if (nome === "" || sigla === "" || !isNaN(nome) || !isNaN(sigla)) {
        alert('Dados Invalidos!');
        // Reativa o botao imediatamente
        botao.disabled = false;
        return false;
    }
    // Cria objeto com nome e sigla
    const dados = { nome, sigla };
    try {
        // Faz requisicao para verificar se NOME e SIGLA existem e batem
        const resposta = await fetch('/instituicao/verificarNomeSigla', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        // Se a requisicao falhar
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return;
        }
        // Pega a resposta (true/false)
        const data = await resposta.json();
        // Se 'data' for true (instituicao existe)
        if (data) {
            console.log("Todos dados sao validos!");
            return true;
        } else {
            // Se 'data' for false (instituicao nao existe)
            console.log("Instituicao nao existe!");
            alert('Instituicao nao existe!');
            return false;
        }
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao que envia os dados para apagar a instituicao
async function apagarInstituicao(nome_int, sigla_int) {
    // Cria objeto com os dados
    const dados = { nome: nome_int, sigla: sigla_int };

    try {
        // Faz a requisicao para a rota de 'apagar'
        const resposta = await fetch('/instituicao/apagar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Se a requisicao falhar
        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        // Retorna a resposta do backend (provavelmente true/false ou contagem de linhas)
        return await resposta.json();
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao que pega o id da instituicao pelo nome
async function pegarIdPorNome(nome_int) {
    // Cria objeto com o nome
    const dados = { nome: nome_int };

    try {
        // Faz requisicao para a rota que busca ID pelo nome
        const resposta = await fetch('/instituicao/verificar/pegarid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Se a requisicao falhar
        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        // Retorna a resposta (o ID)
        return await resposta.json();
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao que verifica se existe docente na instituicao
async function existeDocente(instituicao_id) {
    // Cria objeto com o ID da instituicao
    const dados = { instituicao_id: instituicao_id };

    try {
        // Faz requisicao para verificar relacao com docente
        const resposta = await fetch('/instituicao/verificar/existeDocente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Se a requisicao falhar
        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        // Pega a resposta (espera-se um objeto ex: {existe: true})
        const resultado = await resposta.json();
        // Retorna o valor da chave 'existe'
        return resultado.existe;
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao que verifica se existe curso na instituicao
async function existeCurso(instituicao_id) {
    // Cria objeto com o ID da instituicao
    const dados = { instituicao_id: instituicao_id };

    try {
        // Faz requisicao para verificar relacao com curso
        const resposta = await fetch('/instituicao/verificar/existeCurso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Se a requisicao falhar
        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        // Pega a resposta (espera-se um objeto ex: {existe: true})
        const resultado = await resposta.json();
        // Retorna o valor da chave 'existe'
        return resultado.existe;
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}