//Codigo de autoria de Pedro Vinicius Romanato
async function atualizarCurso(){
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar=document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    
    //pegando os dados do form.
    const id_instituicao=document.getElementById("id_instituicao").value.trim();
    const nome_antigo=document.getElementById("nome_antigo").value.toLowerCase().trim();
    const nome_novo=document.getElementById("nome_novo").value.toLowerCase().trim();
    
    //validando os dados enviados. (Verifica campos, formatos e se o curso antigo existe na instituição)
    const valido= await verificar_inputs(id_instituicao,nome_antigo,nome_novo);
    
    if (valido){
        // Verifica se o novo nome de curso já existe na mesma instituição
        const novoNomeJaExiste=await verificar_existe(id_instituicao,nome_novo);
        
        if(novoNomeJaExiste){
            // Se o novo nome já existir, reativa o botão e encerra (a função verificar_existe já emite o alerta)
            botao_cadastrar.disabled = false;
            return;
        }else{
            // Se o novo nome não existir, envia os dados para atualizar o curso
            const atualizado=await enviarNovosDados(nome_antigo,nome_novo,id_instituicao);
            
            if(atualizado){
                // Sucesso na atualização
                alert("Nome do curso atualizado!");
                console.log("Nome do curso atualizado com sucesso!");
                botao_cadastrar.disabled = false;
                limparCampos();
                return;
            }
        }
        // Se a atualização falhar por algum motivo, a função continua aqui.
        
    }else{
        // Se a validação inicial (verificar_inputs) falhar
        botao_cadastrar.disabled = false;
        limparCampos();
        return;
    }
}

// Função para validar inputs e verificar a existência do curso antigo na instituição
async function verificar_inputs(id_instituicao,nome_antigo,nome_novo){
    // Validação básica: campos vazios
    if(id_instituicao === ""||nome_antigo===""||nome_novo===""){
        alert('Preencha todos os campos!');
        return false;
    }
    // Validação de formato e lógica: ID não numérico, nomes numéricos ou nome antigo igual ao novo
    if(isNaN(id_instituicao)||!isNaN(nome_antigo)||!isNaN(nome_novo)||nome_antigo===nome_novo){
        alert('Dados Invalidos!');
        return false;
    }
    
    // Dados para verificar a existência do curso antigo na instituição
    const dados={instituicao_id: id_instituicao, nome: nome_antigo};
    
    try{
        // Requisição para verificar a existência do curso
        const resposta = await fetch('/curso/verificar', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify(dados)
        });
        
        // Se houver erro na requisição HTTP
        if (!resposta.ok){
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return; // Retorna sem valor específico, o fluxo principal trata isso como falha
        }
        
        // Pega a resposta (espera-se um objeto com 'existeInst')
        const data=await resposta.json();
        
        if (data.existeInst) {
            console.log("Curso e id instituicao existem!");
            return true; // O curso antigo existe, prossegue com a atualização
        } else {
            console.log("Curso ou id instituicao não existe!");
            alert("Curso ou ID da instituição não existe!"); // Adicionado alerta para o usuário
            return false;
        }
    }catch (erro){
        // Captura erros de rede/servidor
        console.error('Erro no servidor:',erro);
        return false;
    }
}

// Função para enviar os dados de atualização do curso
async function enviarNovosDados(nome_antigo,nome_novo,instituicao_id){
    const dados={nome_antigo,nome_novo,instituicao_id};
    
    try{
        // Requisição POST para a rota de atualização
        const resposta = await fetch('/curso/atualizar', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify(dados)
        });
        
        // Se houver erro na requisição HTTP
        if (!resposta.ok){
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return; // Retorna sem valor específico, o fluxo principal trata isso como falha
        }
        
        // Pega a resposta do backend
        const data=await resposta.json();
        
        if (data){
            return true; // Sucesso na atualização
        }else{
            return false; // Falha na atualização (lógica do backend)
            
        }
    }catch (erro){
        // Captura erros de rede/servidor
        console.error('Erro no servidor:',erro);
        return false;
    }
}

// Função para verificar se o nome novo do curso já está em uso na instituição
async function verificar_existe(id_instituicao,nome_novo){
    // Dados para verificar a existência do novo nome
    const dados={instituicao_id: id_instituicao, nome: nome_novo};
    
    try{
        // Requisição para verificar a existência (reusa a rota '/curso/verificar')
        const resposta = await fetch('/curso/verificar', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify(dados)
        });
        
        // Se houver erro na requisição HTTP
        if (!resposta.ok){
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return; // Retorna sem valor específico, o fluxo principal trata isso como falha
        }
        
        // Pega a resposta (espera-se um objeto com 'existeInst')
        const data=await resposta.json();
        
        if (data.existeInst) {
            // Se 'existeInst' for true, o novo nome já está em uso
            alert("Nome novo do curso ja existe no db!");
            console.log("Novo nome existe no db!")
            limparCampos(); // Limpa os campos após o alerta
            return true;
        } else {
            return false; // Novo nome está disponível
        }
    }catch (erro){
        // Captura erros de rede/servidor
        console.error('Erro no servidor:',erro);
        return false;
    }
}

// Função para limpar os campos do formulário
function limparCampos(){
    document.getElementById("id_instituicao").value = "";
    document.getElementById("nome_antigo").value = "";
    document.getElementById("nome_novo").value = "";
}