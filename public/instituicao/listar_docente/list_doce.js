//Codigo de autoria de Pedro Vinicius Romanato e Joao Pedro Diniz
//funcao principal que lista os docentes de uma instituicao
async function listarDocenteInstituuicao(){
    // Pega o ID da instituicao do campo de input
    const id_inst = document.getElementById("id_instituicao").value;
    // Seleciona o botao de cadastro (provavelmente usado para submeter)
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    // Desabilita o botao para evitar multiplas requisicoes
    botao_cadastrar.disabled = true;
    // Chama a funcao que verifica a validade do ID da instituicao
    const valido = await verificar_inputs(id_inst);
    // Se o ID for valido
    if (valido){
        // Limpa o campo de input do ID da instituicao
        document.getElementById("id_instituicao").value = "";
        // Faz a requisicao POST para a rota de listar docentes
        const resp = await fetch("/docente/listar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Envia o ID da instituicao convertido para numero no corpo da requisicao
            body: JSON.stringify({ instituicao_id: Number(id_inst) })
        });

        // Se a requisicao falhar
        if (!resp.ok) {
            console.error("Erro na requisição:", resp.status);
            return;
        }
        // Reativa o botao após a requisicao (antes de processar os dados)
        botao_cadastrar.disabled = false;
        // Converte a resposta para JSON (lista de docentes)
        const dados = await resp.json();

        // Seleciona o corpo da tabela onde os docentes serao listados
        const corpo = document.getElementById("tabela_docente");
        // Limpa o conteudo atual da tabela
        corpo.innerHTML = "";

        // Se o array de dados estiver vazio
        if (dados.length === 0) {
            // Reativa o botao novamente (redundancia, mas mantido)
            botao_cadastrar.disabled = false;
            alert("Nenhum docente encontrado!"); // Alerta o usuario
        } else {
            // Para cada docente nos dados recebidos
            dados.forEach(docente => {
                // Adiciona uma nova linha (<tr>) na tabela
                corpo.innerHTML += `
        <tr>
          <td>${docente.docente_id}</td>
          <td>${docente.nome}</td>
        </tr>`;
            });
        }
    }else{
        // Se a validacao falhar
        // Limpa o campo de input
        document.getElementById("id_instituicao").value = "";
        // Reativa o botao
        botao_cadastrar.disabled = false;
    }
}
//funcao que verifica a validade do input de ID e se a instituicao existe
async function verificar_inputs(instituicao_id){
    // Verifica se o campo esta vazio ou se nao e um numero
    if(instituicao_id===""||isNaN(instituicao_id)){
        alert("Dados Inválidos!");
        // (Nota: A variavel 'botao' nao esta definida neste escopo, o comando pode falhar)
        // botao.disabled = false; 
        return false;
    }
    // Cria o objeto de dados com o ID da instituicao
    const dados = { instituicao_id: instituicao_id };
    try {
        // Faz a requisicao para a rota de verificar se a instituicao existe
        const resposta = await fetch('/curso/verifyInstituicao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        // Se a requisicao falhar
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }
        // Pega a resposta (true/false) sobre a existencia da instituicao
        const existeInstituicao = await resposta.json();
        // Se a instituicao existir
        if (existeInstituicao) {
            return true;
        } else {
            // Se a instituicao nao for encontrada
            alert("Instituição não encontrada!");
            return false;
        }
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}