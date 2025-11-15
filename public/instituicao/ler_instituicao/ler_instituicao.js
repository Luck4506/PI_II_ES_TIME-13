//funcao principal quue lista as instituicoes
async function lerInstituicoes() {
    // Faz a requisicao GET para a rota que lista todas as instituicoes
    const resp = await fetch("/instituicao/listar");
    // Verifica se a resposta da requisicao nao foi bem-sucedida
    if (!resp.ok) {
        console.error("Erro na requisição:", resp.status); // Exibe o erro no console
        return; // Interrompe a funcao
    }
    // Converte os dados da resposta para o formato JSON
    const dados = await resp.json();

    // Seleciona o elemento HTML onde a lista de instituicoes sera exibida (body da tabela)
    const corpo = document.getElementById("tabela_instituicoes");
    // Limpa qualquer conteudo anterior dentro do corpo da tabela
    corpo.innerHTML = "";
    // Verifica se o 'corpo' (elemento da tabela) tem 'length' 0
    // (A checagem mais comum seria se 'dados.length === 0' para ver se o array de dados esta vazio)
    if (corpo.length === 0) {
        alert("Nenhuma institicao encontrada"); // Alerta o usuario
    } else {
        // Para cada instituicao ('inst') no array de dados
        dados.forEach(inst => {
            // Adiciona uma nova linha (<tr>) na tabela com os dados da instituicao
            corpo.innerHTML += `
      <tr>
        <td>${inst.INSTITUICAO_ID}</td>
        <td>${inst.NOME}</td>
        <td>${inst.SIGLA}</td>
      </tr>`;
        });
    }
};
// Executa a funcao para carregar a lista de instituicoes assim que o script e iniciado
lerInstituicoes();