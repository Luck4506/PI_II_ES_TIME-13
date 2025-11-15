// Função assíncrona para buscar e listar os docentes associados a um curso específico
async function listarDocenteCurso(){
    // Pega o ID do curso do campo de input
    const curso_id = document.getElementById("curso_id").value;
    // Seleciona o botão de submissão/ação
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    // Desabilita o botão para evitar cliques múltiplos durante o processamento
    botao_cadastrar.disabled = true;
    
    // Chama a função de validação para verificar o input e a existência do curso
    const valido = await verificar_inputs(curso_id);
    
    // Se a validação for bem-sucedida (curso existe)
    if (valido){
        // Limpa o campo de input após a validação
        document.getElementById("curso_id").value = "";
        
        // Dados a serem enviados na requisição para listar docentes
        const dados1 = { curso_id:curso_id };
        
        // Faz a requisição POST para a rota que lista docentes por curso
        const resp = await fetch("/docente/curso/listar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados1)
        });

        // Verifica se houve erro na resposta HTTP
        if (!resp.ok) {
            console.error("Erro na requisição:", resp.status);
            return;
        }
        
        // Reativa o botão de submissão
        botao_cadastrar.disabled = false;
        // Converte a resposta para JSON (espera-se uma lista de docentes)
        const dados = await resp.json();

        // Seleciona o corpo da tabela onde os docentes serão listados
        const corpo = document.getElementById("tabela_docente");
        // Limpa qualquer conteúdo anterior na tabela
        corpo.innerHTML = "";

        // Se nenhum docente foi encontrado
        if (dados.length === 0) {
            alert("Nenhum docente encontrado!");
        } else {
            // Itera sobre a lista de docentes e insere uma linha (<tr>) na tabela para cada um
            dados.forEach(docente => {
                corpo.innerHTML += `
                <tr>
                    <td>${docente.docente_id}</td>
                    <td>${docente.nome}</td>
                </tr>`;
            });
        }
    }else{
        // Se a validação falhar, limpa o campo e reativa o botão
        document.getElementById("curso_id").value = "";
        botao_cadastrar.disabled = false;
    }
}

// Função assíncrona para validar o ID do curso e verificar sua existência no servidor
async function verificar_inputs(curso_id){
    // Validação básica: campo vazio ou não é um número
    if(curso_id===""||isNaN(curso_id)){
        alert("Dados Inválidos!");
        return false;
    }
    
    // Dados para verificação do curso
    const dados = { curso_id: curso_id };
    
    try {
        // Faz a requisição para verificar a existência do curso
        const resposta = await fetch('/curso/verifyCursoExiste', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        // Se a requisição HTTP falhar
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }
        
        // Pega a resposta do backend (true se existir, false caso contrário)
        const existeCurso = await resposta.json();
        
        // Se o curso existir
        if (existeCurso) {
            return true; 
        } else {
            // Se o curso não for encontrado
            alert("Curso não encontrado!");
            return false;
        }
        
    } catch (erro) {
        // Captura e loga erros de rede/servidor
        console.error('Erro no servidor:', erro);
        return false;
    }
}