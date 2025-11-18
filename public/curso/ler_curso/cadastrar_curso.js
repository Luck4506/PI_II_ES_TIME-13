//Codigo de autoria de Pedro Vinicius Romanato e Joao Pedro Diniz
async function listarCurso() {
    // Pega o ID da instituição do campo de input
    const id_inst = document.getElementById("id_instituicao").value;
    // Seleciona o botão de submissão/ação
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    // Desabilita o botão para evitar cliques múltiplos durante o processamento
    botao_cadastrar.disabled = true;

    // Chama a função de validação para verificar o input e a existência da instituição
    const valido = await verificar_inputs(id_inst, botao_cadastrar);
    
    // Se a validação for bem-sucedida (instituição existe)
    if (valido) {
        // Faz a requisição POST para buscar a lista de cursos
        const resp = await fetch("/curso/listar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Envia o ID da instituição no corpo da requisição
            body: JSON.stringify({ instituicao_id: Number(id_inst) })
        });

        // Verifica se houve erro na resposta HTTP
        if (!resp.ok) {
            console.error("Erro na requisição:", resp.status);
            return;
        }
        
        // Reativa o botão de submissão
        botao_cadastrar.disabled = false;
        // Converte a resposta para JSON (espera-se uma lista de cursos)
        const dados = await resp.json();

        // Seleciona o corpo da tabela onde os cursos serão listados
        const corpo = document.getElementById("tabela_curso");
        // Limpa qualquer conteúdo anterior na tabela
        corpo.innerHTML = "";

        // Se nenhum curso foi retornado (lista vazia)
        if (dados.length === 0) {
            alert("Nenhum curso encontrado!");
        } else {
            // Itera sobre a lista de cursos e insere uma linha (<tr>) na tabela para cada um
            dados.forEach(curso => {
                corpo.innerHTML += `
          <tr>
            <td>${curso.CURSO_ID}</td>
            <td>${curso.NOME}</td>
          </tr>`;
            });
        }
    }
}

  
// Função assíncrona para validar o ID e verificar a existência da instituição no servidor
async function verificar_inputs(id, botao) {
    // Validação básica: verifica se o campo está vazio
    if (id === "") {
        alert("Preencha todos os campos!");
        botao.disabled = false; // Reativa o botão em caso de falha de validação
        return false;
    }
    // Validação básica: verifica se o valor não é um número
    if (isNaN(Number(id))) {
        alert("Dados Inválidos!");
        botao.disabled = false; // Reativa o botão
        return false;
    }

    // Dados para verificação da instituição (necessário converter para Number)
    const dados = { instituicao_id: Number(id) };

    try {
        // Faz a requisição para verificar a existência da instituição
        const resposta = await fetch('/curso/verifyInstituicao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Se a requisição HTTP falhar (ex: erro 401, 500)
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }

        // Pega a resposta do backend (true se a instituição existir, false caso contrário)
        const existeInstituicao = await resposta.json();

        // Se a instituição existir
        if (existeInstituicao) {
            console.log("Instituição existe!.");
            // Limpa o campo de input antes de retornar true
            document.getElementById("id_instituicao").value = "";
            return true; 
            
        } else {
            // Se a instituição não for encontrada
            alert("Instituição não encontrada!");
            botao.disabled = false; // Reativa o botão
            // Limpa o campo de input antes de retornar false
            document.getElementById("id_instituicao").value = "";
            return false;
        }

    } catch (erro) {
        // Captura e loga erros de rede/servidor (falha na conexão)
        console.error('Erro no servidor:', erro);
        return false;
    }
}