async function listarCurso() {
  const id_inst = document.getElementById("id_instituicao").value;
  const botao_cadastrar = document.getElementById("btn-cadastrar");
  botao_cadastrar.disabled = true;

  const valido = await verificar_inputs(id_inst, botao_cadastrar);
  if (valido) {
    document.getElementById("id_instituicao").value = "";
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
    document.getElementById("id_instituicao").value = "";
    if (dados.length === 0) {
        botao_cadastrar.disabled = false;
        alert("Nenhum curso encontrado!");
    } else {
      dados.forEach(curso => {
        corpo.innerHTML += `
          <tr>
            <td>${curso.CURSO_ID}</td>
            <td>${curso.NOME}</td>
          </tr>`;
      });
    }
  }else{
    document.getElementById("id_instituicao").value = "";
    botao_cadastrar.disabled = true;
    return;
  }
}

  
async function verificar_inputs(id) {
    // Validação básica
    if (id === "") {
        alert("Preencha todos os campos!");
        return false;
    }
    if (isNaN(Number(id))) {
        alert("Dados Inválidos!");
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
            return true;
            
        } else {
            alert("Instituição não encontrada!");
            return false;
        }

    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}


//--------------------------------------------------------------------------------------


async function entrarCurso() {
  const botao_cadastrar=document.getElementById("btn-cadastrar");
  botao_cadastrar.disabled = true;
  const curso_id=document.getElementById("curso_id").value.trim();
  const instituicao_id_curso=document.getElementById("id_instituicao_curso").value.trim();
  const valido=await verificar_inputs_entrar(curso_id,instituicao_id_curso);
  if(valido){
    const cadastrado_instituicao=await verificarDentroDaInstituuicao(instituicao_id_curso)
    if(cadastrado_instituicao){
      const existe_relacao=await existeRelacao(curso_id);
      if(!existe_relacao){
        const entrar=await createRelacao(curso_id);
        if (entrar){
          alert("Entrou no curso com Sucesso!");
          botao_cadastrar.disabled = false;
          limparCampos();
          return;
        }
      }
    }
  }
    botao_cadastrar.disabled = false;
    limparCampos();
    return;
}

async function verificar_inputs_entrar(curso_id,instituicao_id) {
  if (curso_id === "" || isNaN(curso_id)||instituicao_id === "" || isNaN(instituicao_id)) {
    alert('Dados inválidos!');
    console.log("Dados inválidos!");
    return false;
  }
  const dados1 = { instituicao_id: instituicao_id };

    try {
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

        if (!existeInstituicao) {
            alert("Instituição não encontrada!");
            return false;
        }

    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
  const dados = { curso_id: curso_id };
    try {
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
        if (existeCurso) {
            return true;
        } else {
            alert("Curso não encontrada!");
            return false;
        }
  } catch (erro) {
    console.error('Erro no servidor:', erro);
    return false;
  }
}
async function existeRelacao(curso_id) {
  const dados = { curso_id:curso_id };
    try {
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
        if (estaDentroInstituicao) {
          alert("Docente ja cadastrado neste curso!");
          return true;
        } else {
            return false;
        }
  } catch (erro) {
    console.error('Erro no servidor:', erro);
    return false;
  }
}
async function verificarDentroDaInstituuicao(instituicao_id) {
  const dados = { instituicao_id:instituicao_id };
    try {
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
            alert("Entre na instituicao para entrar em um de seus cursos!");
            return false;
        }
  } catch (erro) {
    console.error('Erro no servidor:', erro);
    return false;
  }
}
async function createRelacao(curso_id) {
    const dados = { curso_id: curso_id };

    try {
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
        return data;
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}
async function limparCampos(){
  document.getElementById("id_instituicao_curso").value = "";
  document.getElementById("curso_id").value = "";
}
