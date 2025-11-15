// Funcao principal para criar um novo curso e associar o docente
async function criarCurso() {
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    const id_inst = document.getElementById("instituicao_id").value.trim();
    const nome_curso = document.getElementById("nome_curso").value.toLowerCase().trim();
    
    //validando os dados enviados (checa validade basica e existencia da instituicao).
    const valido = await verificar_inputs(id_inst, nome_curso, botao_cadastrar);
    
    //se for valido manda os dados para o db
    if (valido) {
        // Checagem auxiliar: verifica se o curso ja existe para a instituicao
        const valido_aux = await verificar_inputs_aux(id_inst, nome_curso);
        
        if (valido_aux) {
            // Verifica se o docente logado esta cadastrado na instituicao informada
            const estaInstiticao = await verificarDentroDaInstituuicao(id_inst);
            
            if (estaInstiticao) {
                // Tenta criar o curso no banco de dados
                const realizarCreate = await createCurso(id_inst, nome_curso);
                
                if (realizarCreate) {
                    // Pega o ID do curso recem-criado
                    const curso_id = await pegarIdCurso(nome_curso, id_inst);
                    // Cria a relacao entre o docente logado e o novo curso
                    const realizarCreateRelacao = await createRelacao(curso_id);
                    
                    if (realizarCreateRelacao) {
                        console.log("Curso cadastrado!");
                        alert("Curso Cadastrado!");
                        // Sucesso: reativa o botao e limpa os campos
                        botao_cadastrar.disabled = false;
                        limparCampos(id_inst, nome_curso);
                        return;
                    }
                }
            }
            // Se falhar em qualquer etapa apos valido_aux, reativa e limpa
            botao_cadastrar.disabled = false;
            limparCampos(id_inst, nome_curso);
            return;
        } else {
            // Se o curso ja existir (valido_aux == false), reativa e limpa
            botao_cadastrar.disabled = false;
            limparCampos(id_inst, nome_curso);
            return;
        }
    } else {
        // Se a validacao inicial (verificar_inputs) falhar
        console.log("Erro ao criar curso!");
        botao_cadastrar.disabled = false;
        limparCampos(id_inst, nome_curso);
        return;
    }
}

// Funcao que verifica a validade basica dos inputs e se a instituicao existe
async function verificar_inputs(id, nome, botao) {
    // Validação básica: campos vazios
    if (id === "" || nome === "") {
        alert("Preencha todos os campos!");
        botao.disabled = false;
        return false;
    }
    // Validacao basica: ID da instituicao nao e um numero ou nome e um numero
    if (isNaN(Number(id)) || !isNaN(Number(nome))) {
        alert("Dados Inválidos!");
        botao.disabled = false;
        return false;
    }

    // Dados para verificação da instituição
    const dados = { instituicao_id: Number(id) };

    try {
        // Requisicao para verificar se a instituicao existe
        const resposta = await fetch('/curso/verifyInstituicao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }

        const existeInstituicao = await resposta.json(); // espera receber true ou false

        if (existeInstituicao) {
            console.log("Instituição existe!");
            return true;
        } else {
            alert("Instituição não encontrada!");
            botao.disabled = false;
            return false;
        }

    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao que verifica se o curso ja existe para a instituicao especificada
async function verificar_inputs_aux(id, nome) {
    // Dados para verificação de curso e instituicao
    const dados = { instituicao_id: Number(id), nome };

    try {
        // Requisicao para verificar se o curso ja existe nessa instituicao
        const resposta = await fetch('/curso/verifyCurso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            alert('Erro ao tentar autenticar.');
            console.warn('HTTP error:', resposta.status, resposta.statusText);
            return false;
        }

        const existeCurso = await resposta.json(); // espera receber true ou false

        if (existeCurso) {
            alert("Curso ja existe nessa instituicao!");
            return false;
        } else {
            return true;
        }

    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao para criar o curso no banco de dados
async function createCurso(id, nome) {
    const dados = { instituicao_id: id, nome: nome };

    try {
        // Requisicao para cadastrar o curso
        const resposta = await fetch('/curso/cadastrar', {
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
        return data; // Retorna o resultado do cadastro (espera-se true)
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao para criar a relacao entre o docente logado e o curso
async function createRelacao(curso_id) {
    const dados = { curso_id: curso_id };

    try {
        // Requisicao para cadastrar a relacao Docente-Curso
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
        return data; // Retorna o resultado do cadastro da relacao
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao para buscar o ID do curso a partir do nome e ID da instituicao
async function pegarIdCurso(nome, instituicao_id) {
    const dados = { nome: nome, instituicao_id: instituicao_id };

    try {
        // Requisicao para buscar o ID do curso
        const resposta = await fetch('/curso/verificar/pegarid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro no cadastro:', erro);
            return false;
        }

        const sucesso = await resposta.json();
        return sucesso; // Retorna o ID do curso
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao que verifica se o docente logado esta cadastrado na instituicao especificada
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
        if (estaDentroInstituicao) {
            return true;
        } else {
            alert("Entre na instituicao para criar um curso!");
            return false;
        }
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Funcao para limpar os campos de input
function limparCampos(id, nome) {
    document.getElementById("instituicao_id").value = "";
    document.getElementById("nome_curso").value = "";
}