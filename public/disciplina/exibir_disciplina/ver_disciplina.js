/* Autor: Henrique Young de Azevedo 25005651 */

// Função para listar disciplinas com base no curso_id fornecido
async function  listarDisciplina(){
    const curso_id = document.getElementById("curso_id").value;
    const botao = document.getElementById("btn-listar");
    botao.disabled = true;
    if (await verificar_inputs(curso_id)){
        botao.disabled = false;
        await preencherTabela(curso_id);
        document.getElementById("curso_id").value="";
    }else{
        botao.disabled = false;
        document.getElementById("curso_id").value="";
    }
}

// Função para verificar se os inputs são válidos
async function verificar_inputs(curso_id) {
    if(curso_id===""||isNaN(curso_id)){
        window.alert('Dados Invalidos');
        return false;
    }
    if(!await existeDisciplina(curso_id)){
         window.alert('Disciplina nao encontrada');
         return false;
    }
    return true;
}

// Função para verificar se a disciplina existe no servidor
async function existeDisciplina(curso_id){
    const dadosDisciplina={ curso_id:curso_id }
    try{
        const resp = await fetch("/disciplina/existeCurso", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosDisciplina)
        });
        return resp.json();
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

// Função para preencher a tabela com os dados das disciplinas
async function preencherTabela(curso_id) {
    try {
        const resp = await fetch('/ver_disciplina', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ curso_id: curso_id })
        });

        if (!resp.ok) {
            throw new Error("Não foi possível buscar o recurso.");
        }

        const dados = await resp.json();

        const tbody = document.querySelector(".table tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(dados) || dados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-muted">Nenhum registro encontrado.</td></tr>`;
            return;
        }

        dados.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <th>${item.id}</th>
                <td>${item.nome}</td>
                <td>${item.sigla}</td>
                <td>${item.codigo}</td>
                <td>${item.periodo_curso} meses</td>
            `;
            tbody.append(tr);
        });

    } catch (error) {
        console.error(error);
    }
}