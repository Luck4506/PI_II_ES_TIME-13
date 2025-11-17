//Codigo de autoria de Pedro Vinicius Romanato
async function atualizar() {
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const nome_int = document.getElementById("instituicao-nome").value.toLowerCase().trim();
    const sigla_int_antiga = document.getElementById("instituicao-sigla-antiga").value.toLowerCase().trim();
    const sigla_int_nova = document.getElementById("instituicao-sigla-nova").value.toLowerCase().trim();
    //informar o usuario que algo esta acontecendo visualmente.
    // (Ainda sem implementacao visual)

    //validando os dados enviados.
    // Chama a funcao que verifica os inputs e a existencia da instituicao
    const valido = await verificar_inputs(nome_int, sigla_int_antiga, sigla_int_nova, botao_cadastrar);
    // Se a validacao for bem-sucedida
    if (valido) {
        // Cria o objeto de dados com o nome e a NOVA sigla
        const dados = { nome: nome_int, sigla: sigla_int_nova };
        try {
            // Faz a requisicao POST para a rota de atualizar
            const resposta = await fetch('/instituicao/atualizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            // Verifica se a resposta da requisicao falhou
            if (!resposta.ok) {
                alert('Erro ao tentar autenticar.');
                console.warn('HTTP error:', resposta.status, resposta.statusText);
                return;
            }
            // Pega a resposta do backend (espera-se 'true' ou 'false')
            const data = await resposta.json();
            // Se o retorno for 'true' (atualizado com sucesso)
            if (data === true) {
                console.log("Sigla Atualizada com sucesso!");
                alert('Sigla atualizada com sucesso !');
                // Reativa o botao
                botao_cadastrar.disabled = false;
                return true;
            } else {
                // Se 'data' for falso (nome da instituicao nao existe ou nao houve alteracao)
                alert('Nome de instituição nao existe !');
                // Reativa o botao
                botao_cadastrar.disabled = false;
                return false;

            }
        } catch (erro) {
            // Captura erros de rede
            console.error('Erro no servidor:', erro);
            return false;
        }
    } else {
        // Se a validacao falhar
        console.log("Erro ao atualizar!");
        return;
    }
}
//funcao que verifica os inputs e a existencia da instituicao com a sigla antiga
async function verificar_inputs(nome, sigla_antiga, sigla_nova, botao) {
    // Verifica se algum campo esta vazio
    if (nome === "" || sigla_nova === "" || sigla_antiga === "") {
        alert('Preencha todos os campos!');
        // Reativa o botao
        botao.disabled = false;
        return false;
    }
    // Verifica se os campos contem apenas numeros
    if (!isNaN(nome) || !isNaN(sigla_nova) || !isNaN(sigla_antiga)) {
        alert('Dados Invalidos!');
        // Reativa o botao
        botao.disabled = false;
        return false;
    }

    // Cria o objeto de dados com o NOME e a SIGLA ANTIGA (para verificacao)
    const dados = { nome, sigla: sigla_antiga };
    try {
        // Faz a requisicao para verificar se a instituicao com NOME e SIGLA ANTIGA existe
        const resposta = await fetch('/instituicao/atualizar/verificar', {
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
        // Pega a resposta do backend (true/false)
        const data = await resposta.json();
        // Se 'data' for verdadeiro (instituicao existe e dados batem)
        if (data) {
            console.log("Todos dados sao validos!");
            return true;
        } else {
            // Se 'data' for falso (instituicao nao existe)
            alert("Nome de instituição nao existe !");
            return false;

        }
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}