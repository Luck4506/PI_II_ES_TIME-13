//Codigo de autoria de Pedro Vinicius Romanato
// Função assíncrona para verificar se o usuário está associado a alguma instituição.
async function verificarInstituicao() {
    try {
        // Faz uma requisição POST para verificar a associação com a instituição.
        const resp = await fetch('/verificarTemInstituicao', {
            method: 'POST',
            // Envia cookies/credenciais para autenticação no mesmo domínio.
            credentials: 'same-origin' 
        });
        // Converte a resposta para JSON. Espera um objeto com a propriedade 'temInstituicao'.
        const data = await resp.json();
        // Se o usuário NÃO tiver instituição associada
        if (!data.temInstituicao) {
            // Redireciona o usuário para a página de menu de seleção de instituição/cadastro.
            window.location.href = '/menu';
            return;
        }
    } catch (err) {
        // Captura e loga qualquer erro de rede ou na requisição.
        console.error("Erro ao verificar instituição:", err);
    }
}

// Ouve o evento de carregamento completo do DOM (Document Object Model)
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Executa a checagem de instituição primeiro.
    await verificarInstituicao();
    
    // 2. Obtém os dados da sessão do usuário.
    try {
        // Faz a requisição GET para a rota de sessao/autenticacao.
        const resposta = await fetch("/api/session", { credentials: "same-origin" });
        
        // Se a resposta for OK (status 200-299)
        if (resposta.ok) {
            // Extrai os dados da sessao, que incluem informacoes do usuario.
            const data = await resposta.json();
            // Pega o nome do usuario dentro do objeto de dados.
            const nome = data?.user?.nome;
            // Seleciona o elemento onde a saudacao sera exibida.
            const saudacaoElemento = document.getElementById("saudacao");

            // Se o nome e o elemento existirem, exibe a saudacao.
            if (nome && saudacaoElemento) {
                saudacaoElemento.textContent = `Olá, ${nome}!`;
            }
        // Se a resposta for 401 (Nao Autorizado - sem sessao/logado)
        } else if (resposta.status === 401) {
            // Redireciona o usuario para a página de login.
            window.location.href = "/login";
        }
    } catch (err) {
        // Captura e loga qualquer erro durante a busca dos dados da sessao.
        console.error("Erro ao obter dados da sessão:", err);
    }
});

// Ouve o evento de carregamento completo do DOM
document.addEventListener("DOMContentLoaded", () => {
    // Seleciona todos os botoes que ativam um dropdown (menu suspenso)
    const dropdownButtons = document.querySelectorAll(".dropdown-btn");

    // Itera sobre cada botao encontrado
    dropdownButtons.forEach(btn => {
        // Adiciona um listener de clique em cada botao
        btn.addEventListener("click", () => {
            // Pega o elemento pai do botao (que geralmente e o container do dropdown)
            const parent = btn.parentElement;

            // Abre/fecha somente o dropdown clicado, alternando a classe "open"
            parent.classList.toggle("open");
        });
    });
});

// Ouve o evento de carregamento do DOM e chama a funcao de carregar turmas
document.addEventListener("DOMContentLoaded", carregarTurmasDocente);

// Funcao assincrona para carregar a lista de turmas associadas ao docente logado
async function carregarTurmasDocente() {
    try {
        // Faz a requisicao POST para buscar as turmas do docente
        const resp = await fetch("/turma/listarDoDocente", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        // Se a requisicao falhar (status de erro)
        if (!resp.ok) {
            console.error("Erro ao buscar turmas");
            return;
        }

        // Converte a resposta para JSON (espera-se uma lista de turmas)
        const dados = await resp.json();
        // Seleciona o corpo da tabela/lista onde as turmas serao exibidas
        const corpo = document.getElementById("lista-turmas");

        // Limpa o conteudo atual da lista/tabela
        corpo.innerHTML = "";

        // Se a lista de dados estiver vazia
        if (dados.length === 0) {
            // Insere uma mensagem de "nenhuma turma encontrada"
            corpo.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center">Nenhuma turma encontrada!</td>
                </tr>
            `;
            return;
        }

        // Itera sobre cada turma ('t')
        dados.forEach(t => {
            // Adiciona uma nova linha (tr) na lista/tabela
            corpo.innerHTML += `
                <tr>
                    <td>${t.CODIGO_TURMA}</td>
                    <td>${t.NOME_DISCIPLINA}</td>
                    <td>${t.NOME_TURMA ?? "-"}</td> </tr>
            `;
        });

    } catch (erro) {
        // Captura e loga erros durante o processo de carregamento
        console.error("Erro ao carregar turmas:", erro);
    }
}