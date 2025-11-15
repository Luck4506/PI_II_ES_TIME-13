// Funcao principal para iniciar o processo de remocao de um curso
async function apagarCurso() {
    //funcao que chama todas as verificacoes e acoes a serem feitas.
    const botao_cadastrar = document.getElementById("btn-cadastrar");
    //desabilita o botao para nao fazer varias req ao mesmo tempo
    botao_cadastrar.disabled = true;
    //pegando os dados do form.
    // Pega o ID da instituicao do input
    const instituicao_id = document.getElementById("instituicao_id").value.toLowerCase().trim();
    // Pega o nome do curso do input
    const nome = document.getElementById("nome_curso").value.toLowerCase().trim();
    //validando os dados enviados.
    // Verifica se os inputs sao validos e se o curso/instituicao existem
    const valido = await verificar_inputs(instituicao_id, nome, botao_cadastrar);
    //se for valido manda os dados para o db
    if (valido) {
        // Pega o ID do curso usando o ID da instituicao e o nome do curso
        const pegarIdCursoPorNomeEIdInst = await pegarIdCurso(instituicao_id, nome);

        // Verifica se o curso possui disciplinas vinculadas
        const temDisciplina = await existeDisciplina(pegarIdCursoPorNomeEIdInst);

        // Se NAO houver disciplinas vinculadas
        if (!temDisciplina) {
            // Tenta apagar a relacao Docente-Curso (para remover dependencias antes do curso)
            const apagarRelacao = await apagarRelacaoCurso(pegarIdCursoPorNomeEIdInst);
            // Se a remocao da relacao for bem-sucedida (ou se nao houver relacoes para apagar)
            if (apagarRelacao) {
                // Tenta apagar o curso do banco de dados
                const apagado = await apagarCursoDb(instituicao_id, nome);
                // Se o curso for apagado com sucesso
                if (apagado) {
                    console.log("Curso apagada com sucesso!")
                    alert('Curso apagada com sucesso!');
                    botao_cadastrar.disabled = false;
                    limparCampos();
                    return;
                }
            }
        } else {
            // Se houver disciplinas vinculadas
            alert('Apague todas as disciplinas para apagar curso!')
            botao_cadastrar.disabled = false;
            limparCampos();
            return;
        }

    } else {
        // Se a validacao inicial falhar
        limparCampos();
        botao_cadastrar.disabled = false;
        return;
    }
}
// Funcao que verifica a validade dos inputs e se o curso existe na instituicao
async function verificar_inputs(instituicao_id, nome) {
    // Validacao basica: campos vazios, nome e numero, ou id_instituicao nao-numerico
    if (nome === "" || instituicao_id === "" || !isNaN(nome) || isNaN(instituicao_id)) {
        alert('Dados Invalidos!');
        console.log("Dados Invalidos!")
        return false;
    } else {
        // Objeto de dados para verificacao
        const dados = { instituicao_id: instituicao_id, nome: nome };

        try {
            // Faz a requisicao para verificar se o curso e a instituicao existem juntos
            const resposta = await fetch('/curso/verificar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            // Se a requisicao falhar
            if (!resposta.ok) {
                const erro = await resposta.json();
                console.error('Erro ao apagar:', erro);
                return false;
            }
            // Pega a resposta (espera-se {existeInst: true/false})
            const data = await resposta.json();
            // Se a instituicao e o curso existirem
            if (data.existeInst) {
                console.log("Curso e id instituicao existem!");
                return true;
            } else {
                // Se algum dos dois nao existir
                console.log("Curso ou id instituicao não existe!");
                alert("Id de instituicao ou nome de curso nao existe!");
                return false;
            }
        } catch (erro) {
            // Captura erros de rede
            console.error('Erro no servidor:', erro);
            return false;
        }
    }

}
// Funcao para apagar o curso do banco de dados
async function apagarCursoDb(instituicao_id, nome) {
    const dados = { instituicao_id: instituicao_id, nome: nome };

    try {
        // Faz a requisicao para a rota de apagar curso
        const resposta = await fetch('/curso/apagar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Se a requisicao falhar
        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        // Retorna a resposta do backend (sucesso/falha)
        return await resposta.json();
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// Funcao para apagar a relacao Docente-Curso
async function apagarRelacaoCurso(curso_id) {
    const dados = { curso_id: curso_id };

    try {
        // Faz a requisicao para a rota de apagar a relacao
        const resposta = await fetch('/curso/apagarRelacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Se a requisicao falhar
        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        // Retorna a resposta do backend
        return await resposta.json();
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// Funcao para obter o ID do curso
async function pegarIdCurso(instituicao_id, nome) {
    const dados = { instituicao_id: instituicao_id, nome: nome };

    try {
        // Faz a requisicao para buscar o ID do curso
        const resposta = await fetch('/curso/verificar/pegarid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Se a requisicao falhar
        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        // Pega e retorna o ID do curso
        const cursoId = await resposta.json();
        return cursoId;
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}
// Funcao para limpar os campos de input
function limparCampos() {
    document.getElementById("instituicao_id").value = "";
    document.getElementById("nome_curso").value = "";
}
// Funcao para verificar se ha disciplinas vinculadas ao curso
async function existeDisciplina(curso_id) {
    const dados = { curso_id: curso_id };

    try {
        // Faz a requisicao para verificar se ha disciplinas
        const resposta = await fetch('/curso/verificar/disciplina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Se a requisicao falhar
        if (!resposta.ok) {
            const erro = await resposta.json();
            console.error('Erro ao apagar:', erro);
            return false;
        }
        // Pega e retorna o resultado (true se existir disciplina)
        const resultado = await resposta.json();
        return resultado;
    } catch (erro) {
        // Captura erros de rede
        console.error('Erro no servidor:', erro);
        return false;
    }
}