//Codigo de autoria de Pedro Vinicius Romanato
async function adicionar() {

    const botao_cadastrar = document.getElementById("btn-cadastrar");

    //desativa botao
    botao_cadastrar.disabled = true;

    //pegar os dados do index
    const nome_int = document.getElementById("instituicao-nome").value.toLowerCase().trim();
    const sigla_int = document.getElementById("instituicao-sigla").value.toLowerCase().trim();

    //verifica a validade dos inputs
    const valido = await verificar_inputs(nome_int, sigla_int);

    if (valido) {

        //se tudo der certo faz o cadastro da instituicao
        const realizarCadastro = await cadastrarInstituicao(nome_int, sigla_int);
        if (realizarCadastro) {
            //pega o id da institicao
            const instituicao_id = await pegarIdPorNome(nome_int);
            //utiliza o id da instituicao e docente_id para criar a relacao na tabela docente_institicao
            await cadastrarRelacao(instituicao_id);
            alert("Instituicao Cadastrada!");
            //ativa o bota
            botao_cadastrar.disabled = false;
            limparCampos();
            return;
        }
    } else {

        //se nao der certo nao faz o cadastro da instituicao
        botao_cadastrar.disabled = false;
        limparCampos();
        return;
    }
}
async function verificar_inputs(nome, sigla) {

    //verifica se os campos estao vazios
    if (nome === "" || sigla === "") {
        alert("Preencha todos os campos!");
        return false;
    }

    //verifica se os campos nao tem somente numeros
    if (!isNaN(nome) || !isNaN(sigla)) {
        alert("Dados Invalidos!");
        return false;
    }

    //verifica se existe o nome
    const dados = { nome };
    try {
        const resposta = await fetch('/instituicao/verificarNome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        //se der erro na verificacao
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }
        const existe = await resposta.json();
        //se existir para o cadastro
        if (existe === true) {
            alert("Nome já existe!");
            console.log("Erro na verificacao: nome ja existe");
            return false;
        } else {
            console.log("Todos os inputs são válidos!");
            return true;
        }
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
//funcao que envia os dados da institicao para o db
async function cadastrarInstituicao(nome_int, sigla_int) {
    //cria um objeto com os dados recebidos
    const dados2 = { nome: nome_int, sigla: sigla_int };

    try {
        //faz a requisicao para a rota de cadastro
        const resposta = await fetch('/instituicao/cadastrar', {
            method: 'POST', //define o metodo como POST
            headers: { 'Content-Type': 'application/json' }, //define o cabecalho como JSON
            body: JSON.stringify(dados2) //envia os dados no corpo da requisicao
        });

        //verifica se a resposta da requisicao nao foi bem-sucedida
        if (!resposta.ok) {
            const erro = await resposta.json(); //pega a mensagem de erro da resposta
            console.error('Erro no cadastro:', erro); //exibe o erro no console
            return false; //retorna falso (falha no cadastro)
        }

        //pega os dados da resposta (confirmacao)
        const data2 = await resposta.json();
        //se houver dados na resposta, retorna verdadeiro (sucesso)
        if (data2) return true;
    } catch (erro) { //captura erros de rede ou do proprio fetch
        console.error('Erro no servidor:', erro); //exibe o erro no console
        return false; //retorna falso (falha)
    }
}
//funcao que enviar os dados da relacao pro db
async function cadastrarRelacao(instituicao_id) {
    //cria um objeto com o id da instituicao
    const dados = { instituicao_id };
    try {
        //faz a requisicao para a rota que cadastra a relacao
        const resposta = await fetch('/instituicao/cadastrarRelacao', {
            method: 'POST', //define o metodo POST
            headers: { 'Content-Type': 'application/json' }, //define o cabecalho
            body: JSON.stringify(dados) //envia o id no corpo
        });

        //verifica se a resposta nao foi OK
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.'); //alerta o usuario
            console.warn('HTTP error:', resposta.status, resposta.statusText); //exibe detalhes no console
            return; //interrompe a funcao
        }
        //pega a resposta (espera-se um booleano)
        const sucesso = await resposta.json();
        //se a resposta for 'true'
        if (sucesso === true) {
            return true; //retorna sucesso
        } else {
            console.log("Erro ao criar relacao"); //avisa no console
            return false; //retorna falha
        }
    } catch (erro) { //captura erros de rede
        console.error('Erro no servidor:', erro); //exibe o erro
        return false; //retorna falha
    }
}
//funcao de pegar id da instituicao pelo nome dela do db
async function pegarIdPorNome(nome_int) {
    //cria um objeto com o nome da instituicao
    const dados = { nome: nome_int };

    try {
        //faz a requisicao para a rota que busca o ID pelo nome
        const resposta = await fetch('/instituicao/verificar/pegarid', {
            method: 'POST', //define o metodo POST
            headers: { 'Content-Type': 'application/json' }, //define o cabecalho
            body: JSON.stringify(dados) //envia o nome no corpo
        });

        //verifica se a resposta nao foi OK
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.'); //alerta o usuario
            return; //interrompe a funcao
        }

        //pega a resposta (que deve ser o ID)
        const sucesso = await resposta.json();
        //retorna o ID recebido, ou 'false' se a resposta for nula/indefinida
        return sucesso || false;

    } catch (erro) { //captura erros de rede
        console.error('Erro no servidor:', erro); //exibe o erro
        return false; //retorna falha
    }
}

//funcao de limpar os campos
async function limparCampos() {
    //define o valor do input 'instituicao-nome' como vazio
    document.getElementById("instituicao-nome").value = "";
    //define o valor do input 'instituicao-sigla' como vazio
    document.getElementById("instituicao-sigla").value = "";

}