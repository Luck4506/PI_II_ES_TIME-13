//funcao principal quue lista as instituicoes
async function lerInstituicoes() {
    //faz a requisicao (fetch) para a rota que lista as instituicoes
    const resp = await fetch("/instituicao/listar");
    //se a resposta nao for OK
    if (!resp.ok) {
        console.error("Erro na requisição:", resp.status); //exibe o erro no console
        return; //para a execucao da funcao
    }
    //converte os dados da resposta em JSON
    const dados = await resp.json();

    //seleciona o elemento 'tbody' da tabela pelo ID
    const corpo = document.getElementById("tabela_instituicoes");
    //limpa qualquer conteudo que ja exista na tabela
    corpo.innerHTML = "";
    //verifica se o 'corpo' (elemento da tabela) tem 'length' 0
    if (corpo.length === 0) {
        alert("Nenhuma institicao encontrada");
    } else {
        //para cada instituicao ('inst') dentro dos 'dados'
        dados.forEach(inst => {
            //adiciona uma nova linha (tr) formatada ao HTML da tabela
            corpo.innerHTML += `
      <tr>
        <td>${inst.INSTITUICAO_ID}</td>
        <td>${inst.NOME}</td>
        <td>${inst.SIGLA}</td>
      </tr>`;
        });
    }
};
//executa a funcao para carregar a lista ao iniciar a pagina
lerInstituicoes();

//funcao principal de entrar na instituicao
async function entrar() {
    //pega o botao de cadastrar pelo ID
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    //desativa o botao para evitar cliques duplos
    botao_cadastrar.disabled = true;
    //pega o valor do input 'instituicao-id' e remove espacos
    const instituicao_id = document.getElementById("instituicao-id").value.trim();
    //chama a funcao que verifica se o ID e valido
    const valido = await verificar_inputs(instituicao_id);
    //se for valido
    if (valido) {
        //chama a funcao que registra a entrada (cria a relacao)
        const entrar = await entrarInstituicao(instituicao_id);
        //se a entrada for bem-sucedida
        if (entrar) {
            alert("Entrou na instituicao com Sucesso!");
            //reativa o botao
            botao_cadastrar.disabled = false;
            //limpa o campo de ID
            limparCampos();
            return; //finaliza a funcao
        }
    } else {
        //se nao for valido (retorno do 'verificar_inputs')
        limparCampos(); //limpa o campo
        botao_cadastrar.disabled = false; //reativa o botao
        return; //finaliza a funcao
    }
}
//funcao que valida o ID da instituicao
async function verificar_inputs(instituicao_id) {
    //verifica se o campo esta vazio ou se nao e um numero
    if (instituicao_id === "" || isNaN(instituicao_id)) {
        alert('Dados inválidos!');
        console.log("Dados inválidos!");
        return false; //retorna invalido
    }

    try {
        //faz a primeira verificacao: se o ID da instituicao existe no DB
        const respId = await fetch('/instituicao/verificarExisteId', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instituicao_id }) //envia o ID no corpo
        });

        //se a requisicao falhar
        if (!respId.ok) {
            console.error('Erro ao verificar id:', await respId.text());
            return false;
        }
        //pega a resposta (true/false) se a instituicao existe
        const existeInst = await respId.json();
        //se a instituicao nao existir
        if (!existeInst) {
            alert("Id de instituição não existe!");
            return false; //retorna invalido
        }

        //faz a segunda verificacao: se o docente ja esta na instituicao
        const respDoc = await fetch('/instituicao/verificarExisteDocente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instituicao_id }) //envia o mesmo ID
        });

        //se a requisicao falhar
        if (!respDoc.ok) {
            console.error('Erro ao verificar docente:', await respDoc.text());
            return false;
        }
        //pega a resposta (true/false) se a relacao ja existe
        const existeRelacao = await respDoc.json();

        //se a relacao ja existir
        if (existeRelacao) {
            alert("Docente já cadastrado nessa instituição!");
            return false; //retorna invalido
        }

        //se passou por todas as verificacoes, retorna valido
        return true;

    } catch (erro) { //captura erros de rede (servidor offline, etc)
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao que efetivamente cria a relacao (docente_instituicao) no DB
async function entrarInstituicao(instituicao_id) {
    //inicia o bloco try...catch
    try {
        //faz a requisicao para a rota que cadastra a relacao
        const resposta = await fetch('/instituicao/entrarInstituicao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instituicao_id }) //envia o ID
        });
        //se a requisicao falhar
        if (!resposta.ok) {
            console.error('Erro ao entrar na instituição:', await resposta.text());
            return false;
        }
        //pega a confirmacao
        const data = await resposta.json();
        //retorna true se 'data' tiver valor, false se nao tiver (!!)
        return !!data;
    } catch (erro) { //captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao para limpar o campo de input
async function limparCampos() {
    //define o valor do input 'instituicao-id' como vazio
    document.getElementById("instituicao-id").value = "";
}