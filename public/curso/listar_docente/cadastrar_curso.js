async function listarDocenteCurso(){
  const curso_id = document.getElementById("curso_id").value;
  const botao_cadastrar = document.getElementById("btn-cadastrar");
  botao_cadastrar.disabled = true;
  const valido = await verificar_inputs(curso_id);
  if (valido){
    document.getElementById("curso_id").value = "";
    const dados1 = { curso_id:curso_id };
    const resp = await fetch("/docente/curso/listar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados1)
    });

    if (!resp.ok) {
      console.error("Erro na requisição:", resp.status);
      return;
    }
    botao_cadastrar.disabled = false;
    const dados = await resp.json();

    const corpo = document.getElementById("tabela_docente");
    corpo.innerHTML = "";

    if (dados.length === 0) {
        botao_cadastrar.disabled = false;
        alert("Nenhum docente encontrado!");
    } else {
      dados.forEach(docente => {
        corpo.innerHTML += `
        <tr>
          <td>${docente.docente_id}</td>
          <td>${docente.nome}</td>
        </tr>`;
      });
    }
  }else{
    document.getElementById("curso_id").value = "";
    botao_cadastrar.disabled = false;
  }
}
async function verificar_inputs(curso_id){
  if(curso_id===""||isNaN(curso_id)){
      alert("Dados Inválidos!");
      botao.disabled = false;
      return false;
  }
  const dados = { curso_id: curso_id };
    try {
        const resposta = await fetch('/curso/verifyCursoExiste', {
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
            alert("Curso não encontrado!");
            return false;
        }
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return false;
    }
}