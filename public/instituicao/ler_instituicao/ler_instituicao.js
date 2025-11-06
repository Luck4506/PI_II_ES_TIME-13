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
    botao_cadastrar.disabled = false;
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
