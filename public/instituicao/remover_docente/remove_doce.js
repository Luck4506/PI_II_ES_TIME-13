//Codigo de autoria de Pedro Vinicius Romanato e Joao Pedro Diniz
async function remover() {
    // Seleciona o botao de cadastro (usado para acionar a acao)
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    // Desabilita o botao para evitar multiplas requisicoes
    botao_cadastrar.disabled = true;
    // Pega o ID da instituicao do input e limpa/formata
    const instituicao_id = document.getElementById("instituicao_id").value.toLowerCase().trim();
    // Pega o ID do docente do input e limpa/formata
    const docente_id = document.getElementById("docente_id").value.toLowerCase().trim();
    // Chama a funcao que verifica se os inputs sao validos e se a relacao existe
    const valido = await verificar_inputs(instituicao_id, docente_id);
    // Se a validacao for bem-sucedida
    if (valido) {
        // Tenta remover a relacao no banco de dados
        const removido = await removerRelacao(instituicao_id, docente_id);
        // Se a remocao for bem-sucedida
        if (removido) {
            limparCampos(); // Limpa os campos de input
            alert("Docente removido com sucesso!"); // Alerta de sucesso
            botao_cadastrar.disabled = false; // Reativa o botao
            return;
        }
    } else {
        // Se a validacao falhar
        limparCampos(); // Limpa os campos de input
        botao_cadastrar.disabled = false; // Reativa o botao
        return;
    }
}
//funcao que verifica os inputs e a existencia da relacao
async function verificar_inputs(instituicao_id, docente_id) {
    // Verifica se os campos estao vazios ou se nao sao numeros
    if (instituicao_id === "" || docente_id === "" || isNaN(instituicao_id) || isNaN(docente_id)) {
        alert('Dados Invalidos!');
        return false;
    }
    // Verifica se a relacao (docente-instituicao) existe no DB
    const existe = await existeRelacao(instituicao_id, docente_id);
    // Se a relacao existir, a verificacao e bem-sucedida
    if (existe) {
        return true;
    } else {
        // Se a relacao nao existir, informa o usuario
        alert("Relacao entre Instituicao e docente inexistente");
        return false;
    }
}
//funcao que envia os dados para apagar a relacao no servidor
async function removerRelacao(instituicao_id, docente_id) {
    // Cria o objeto com os IDs para enviar ao backend
    const dados = { instituicao_id: instituicao_id, docente_id: docente_id };

    try {
        // Faz a requisicao para a rota de remover a relacao
        const resposta = await fetch('/instituicao/removerRelacao', {
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
        // Retorna a resposta do backend (indicando sucesso/falha da remocao)
        return await resposta.json();
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao que verifica se a relacao ja existe
async function existeRelacao(instituicao_id, docente_id) {
    // Cria o objeto com os IDs para verificar
    const dados = { instituicao_id: instituicao_id, docente_id };

    try {
        // Faz a requisicao para a rota de verificar existencia
        const resposta = await fetch('/instituicao/verificar/existeRelacao', {
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
        // Pega a resposta (true/false)
        const resultado = await resposta.json();
        return resultado;
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao para limpar os campos de input
async function limparCampos() {
    // Limpa o campo do ID da instituicao
    document.getElementById("instituicao_id").value = "";
    // Limpa o campo do ID do docente
    document.getElementById("docente_id").value = "";
}