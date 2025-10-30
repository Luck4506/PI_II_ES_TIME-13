async function listarCurso() {
  const id_inst = document.getElementById("id_instituicao").value;
  const botao_cadastrar = document.getElementById("btn-cadastrar");
  botao_cadastrar.disabled = true;

  const valido = await verificar_inputs(id_inst, botao_cadastrar);
  if (valido) {
    const resp = await fetch("/curso/listar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instituicao_id: Number(id_inst) })
    });

    if (!resp.ok) {
      console.error("Erro na requisição:", resp.status);
      return;
    }
    botao_cadastrar.disabled = false;
    const dados = await resp.json();

    const corpo = document.getElementById("tabela_curso");
    corpo.innerHTML = "";

    if (dados.length === 0) {
        botao_cadastrar.disabled = false;
      corpo.innerHTML = "<tr><td colspan='1'>Nenhum curso encontrado.</td></tr>";
    } else {
      dados.forEach(curso => {
        corpo.innerHTML += `
          <tr>
            <td>${curso.NOME}</td>
          </tr>`;
      });
    }
  }
}

  
async function verificar_inputs(id, botao) {
    // Validação básica
    if (id === "") {
        alert("Preencha todos os campos!");
        botao.disabled = false;
        return false;
    }
    if (isNaN(Number(id))) {
        alert("Dados Inválidos!");
        botao.disabled = false;
        return false;
    }

    // Dados para verificação da instituição
    const dados = { instituicao_id: Number(id) };

    try {
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

        const existeInstituicao = await resposta.json();

        if (existeInstituicao) {
            console.log("Instituição existe!.");
            document.getElementById("id_instituicao").value = "";
            return true;
            
        } else {
            alert("Instituição não encontrada!");
            botao.disabled = false;
            document.getElementById("id_instituicao").value = "";
            return false;
        }

    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}

