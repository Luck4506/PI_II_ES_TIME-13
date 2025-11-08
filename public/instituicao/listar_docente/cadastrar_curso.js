async function listarDocenteInstituuicao(){
  const id_inst = document.getElementById("id_instituicao").value;
  const botao_cadastrar = document.getElementById("btn-cadastrar");
  botao_cadastrar.disabled = true;
  const valido = await verificar_inputs(id_inst);
  if (valido){
    document.getElementById("id_instituicao").value = "";
    const resp = await fetch("/docente/listar", {
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
    document.getElementById("id_instituicao").value = "";
    botao_cadastrar.disabled = false;
  }
}
async function verificar_inputs(instituicao_id){
  if(instituicao_id===""||isNaN(instituicao_id)){
      alert("Dados Inválidos!");
      botao.disabled = false;
      return false;
  }
  const dados = { instituicao_id: instituicao_id };
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