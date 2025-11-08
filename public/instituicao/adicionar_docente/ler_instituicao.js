async function lerInstituicoes() {
  const resp = await fetch("/instituicao/listar");
  if (!resp.ok) {
    console.error("Erro na requisição:", resp.status);
    return;
  }
  const dados = await resp.json();

  const corpo = document.getElementById("tabela_instituicoes");
  corpo.innerHTML = "";
  if (corpo.length === 0) {
    alert("Nenhuma institicao encontrada");
  } else {
    dados.forEach(inst => {
    corpo.innerHTML += `
      <tr>
        <td>${inst.INSTITUICAO_ID}</td>
        <td>${inst.NOME}</td>
        <td>${inst.SIGLA}</td>
      </tr>`;
  });
  }
};
lerInstituicoes();
async function entrar() {
  const botao_cadastrar=document.getElementById("btn-cadastrar");
  botao_cadastrar.disabled = true;
  const instituicao_id=document.getElementById("instituicao-id").value.trim();
  const valido=await verificar_inputs(instituicao_id);
  if(valido){
    const entrar=await entrarInstituicao(instituicao_id);
    if (entrar){
      alert("Entrou na instituicao com Sucesso!");
      botao_cadastrar.disabled = false;
      limparCampos();
      return;
    }
  }else{
    limparCampos();
    botao_cadastrar.disabled = false;
    return;
  }
}
async function verificar_inputs(instituicao_id) {
  if (instituicao_id === "" || isNaN(instituicao_id)) {
    alert('Dados inválidos!');
    console.log("Dados inválidos!");
    return false;
  }

  try {
    const respId = await fetch('/instituicao/verificarExisteId', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instituicao_id })
    });

    if (!respId.ok) {
      console.error('Erro ao verificar id:', await respId.text());
      return false;
    }
    const existeInst = await respId.json();
    if (!existeInst) {
      alert("Id de instituição não existe!");
      return false;
    }

    const respDoc = await fetch('/instituicao/verificarExisteDocente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instituicao_id })
    });

    if (!respDoc.ok) {
      console.error('Erro ao verificar docente:', await respDoc.text());
      return false;
    }
    const existeRelacao = await respDoc.json();

    if (existeRelacao) {
      alert("Docente já cadastrado nessa instituição!");
      return false;
    }

    return true;

  } catch (erro) {
    console.error('Erro no servidor:', erro);
    return false;
  }
}
async function entrarInstituicao(instituicao_id) {
  try {
    const resposta = await fetch('/instituicao/entrarInstituicao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instituicao_id })
    });
    if (!resposta.ok) {
      console.error('Erro ao entrar na instituição:', await resposta.text());
      return false;
    }
    const data = await resposta.json();
    return !!data;
  } catch (erro) {
    console.error('Erro no servidor:', erro);
    return false;
  }
}
async function limparCampos(){
  document.getElementById("instituicao-id").value = "";
}
