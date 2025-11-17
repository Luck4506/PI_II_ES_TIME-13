//Codigo de autoria de Pedro Vinicius Romanato e Joao Pedro Diniz
// Funcao para listar os cursos de uma instituicao especifica
async function listarCurso() {
    // Pega o ID da instituicao do campo de input
    const id_inst = document.getElementById("id_instituicao").value;
    // Seleciona o botao de submissao (usado para desabilitar/reabilitar)
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    // Desabilita o botao para prevenir multiplas acoes
    botao_cadastrar.disabled = true;

    // Verifica se o input e valido e se a instituicao existe
    const valido = await verificar_inputs(id_inst, botao_cadastrar);
    // Se a validacao for bem-sucedida
    if (valido) {
        // Limpa o campo de ID da instituicao (antes da requisicao de listagem)
        document.getElementById("id_instituicao").value = "";
        // Faz a requisicao POST para listar cursos da instituicao
        const resp = await fetch("/curso/listar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Envia o ID da instituicao
            body: JSON.stringify({ instituicao_id: Number(id_inst) })
        });

        // Se a requisicao falhar
        if (!resp.ok) {
            console.error("Erro na requisição:", resp.status);
            return;
        }
        // Reativa o botao
        botao_cadastrar.disabled = false;
        // Pega os dados da resposta (lista de cursos)
        const dados = await resp.json();

        // Seleciona o corpo da tabela onde os cursos serao listados
        const corpo = document.getElementById("tabela_curso");
        // Limpa o conteudo atual da tabela
        corpo.innerHTML = "";
        
        // Se nao houver cursos encontrados
        if (dados.length === 0) {
            // Reativa o botao (redundancia)
            botao_cadastrar.disabled = false;
            alert("Nenhum curso encontrado!");
        } else {
            // Itera sobre cada curso e adiciona uma linha na tabela
            dados.forEach(curso => {
                corpo.innerHTML += `
          <tr>
            <td>${curso.CURSO_ID}</td>
            <td>${curso.NOME}</td>
          </tr>`;
            });
        }
    } else {
        // Se a validacao falhar
        // Limpa o campo de ID da instituicao
        document.getElementById("id_instituicao").value = "";
        // Desabilita o botao (mantido)
        botao_cadastrar.disabled = true;
        return;
    }
}

// Funcao que verifica se o ID e valido e se a instituicao existe
async function verificar_inputs(id) {
    // Validacao basica: campo vazio
    if (id === "") {
        alert("Preencha todos os campos!");
        return false;
    }
    // Validacao basica: nao e um numero
    if (isNaN(Number(id))) {
        alert("Dados Inválidos!");
        return false;
    }

    // Dados para verificacao da instituicao
    const dados = { instituicao_id: Number(id) };

    try {
        // Faz a requisicao para verificar a existencia da instituicao
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

        // Pega a resposta (true/false)
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


//--------------------------------------------------------------------------------------


// Funcao para cadastrar o docente em um curso (entrar no curso)
async function entrarCurso() {
    // Seleciona e desabilita o botao
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    botao_cadastrar.disabled = true;
    // Pega o ID do curso e limpa/formata
    const curso_id = document.getElementById("curso_id").value.trim();
    // Pega o ID da instituicao e limpa/formata
    const instituicao_id_curso = document.getElementById("id_instituicao_curso").value.trim();
    // Verifica a validade dos inputs e existencia de curso/instituicao
    const valido = await verificar_inputs_entrar(curso_id, instituicao_id_curso);
    // Se a validacao for bem-sucedida
    if (valido) {
        // Verifica se o docente esta cadastrado na instituicao informada
        const cadastrado_instituicao = await verificarDentroDaInstituuicao(instituicao_id_curso)
        if (cadastrado_instituicao) {
            // Verifica se ja existe uma relacao docente-curso
            const existe_relacao = await existeRelacao(curso_id);
            // Se a relacao NAO existir
            if (!existe_relacao) {
                // Cria a relacao docente-curso
                const entrar = await createRelacao(curso_id);
                // Se o cadastro for bem-sucedido
                if (entrar) {
                    alert("Entrou no curso com Sucesso!");
                    botao_cadastrar.disabled = false; // Reativa o botao
                    limparCampos(); // Limpa os campos
                    return;
                }
            }
        }
    }
    // Codigo executado se a validacao/cadastro falhar em qualquer etapa
    botao_cadastrar.disabled = false; // Reativa o botao
    limparCampos(); // Limpa os campos
    return;
}

// Funcao que verifica se os IDs sao validos e se o curso/instituicao existem
async function verificar_inputs_entrar(curso_id, instituicao_id) {
    // Validacao basica: campos vazios ou nao-numericos
    if (curso_id === "" || isNaN(curso_id) || instituicao_id === "" || isNaN(instituicao_id)) {
        alert('Dados inválidos!');
        console.log("Dados inválidos!");
        return false;
    }
    // Dados para verificar a existencia da instituicao
    const dados1 = { instituicao_id: instituicao_id };

    try {
        // Requisicao para verificar existencia da instituicao
        const resposta = await fetch('/curso/verifyInstituicao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados1)
        });

        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }

        const existeInstituicao = await resposta.json();

        // Se a instituicao NAO existir
        if (!existeInstituicao) {
            alert("Instituição não encontrada!");
            return false;
        }

    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }

    // Dados para verificar a existencia do curso
    const dados = { curso_id: curso_id };
    try {
        // Requisicao para verificar existencia do curso
        const resposta = await fetch('/curso/verifyExisteCurso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }
        const existeCurso = await resposta.json();
        // Se o curso existir
        if (existeCurso) {
            return true;
        } else {
            // Se o curso NAO existir
            alert("Curso não encontrada!");
            return false;
        }
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao que verifica se o docente ja tem relacao com o curso
async function existeRelacao(curso_id) {
    const dados = { curso_id: curso_id };
    try {
        // Requisicao para verificar se a relacao ja existe
        const resposta = await fetch('/curso/verifyExisteRelacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }
        const estaDentroInstituicao = await resposta.json();
        // Se a relacao ja existir
        if (estaDentroInstituicao) {
            alert("Docente ja cadastrado neste curso!"); // Alerta
            return true; // Retorna true indicando que a relacao existe
        } else {
            return false; // Retorna false se nao existir
        }
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao que verifica se o docente esta cadastrado na instituicao especificada
async function verificarDentroDaInstituuicao(instituicao_id) {
    const dados = { instituicao_id: instituicao_id };
    try {
        // Requisicao para verificar se o docente pertence a instituicao
        const resposta = await fetch('/curso/verifyEstaInstituicao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }
        const estaDentroInstituicao = await resposta.json();
        // Se o docente estiver dentro da instituicao
        if (estaDentroInstituicao) {
            return true;
        } else {
            // Se o docente NAO estiver dentro da instituicao
            alert("Entre na instituicao para entrar em um de seus cursos!");
            return false;
        }
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao para criar a relacao entre docente e curso
async function createRelacao(curso_id) {
    const dados = { curso_id: curso_id };

    try {
        // Requisicao para cadastrar a relacao
        const resposta = await fetch('/curso/cadastrarRelacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro no cadastro:', erro);
            return false;
        }

        const data = await resposta.json();
        // Retorna a resposta do cadastro (provavelmente true)
        return data;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao para limpar os campos de input
async function limparCampos() {
    // Limpa o campo do ID da instituicao
    document.getElementById("id_instituicao_curso").value = "";
    // Limpa o campo do ID do curso
    document.getElementById("curso_id").value = "";
}