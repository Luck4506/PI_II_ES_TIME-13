async function verificarInstituicao() {
  try {
    const resp = await fetch('/verificarTemInstituicao', {
      method: 'POST',
      credentials: 'same-origin'
    });
    const data = await resp.json();
    if (!data.temInstituicao) {
      window.location.href = '/menu';
      return;
    }
  } catch (err) {
    console.error("Erro ao verificar instituição:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await verificarInstituicao();
  try {
    const resposta = await fetch("/api/session", { credentials: "same-origin" });
    if (resposta.ok) {
      const data = await resposta.json();
      const nome = data?.user?.nome;
      const saudacaoElemento = document.getElementById("saudacao");
      
      if (nome && saudacaoElemento) {
        saudacaoElemento.textContent = `Olá, ${nome}!`;
      }
    } else if (resposta.status === 401) {
      window.location.href = "/login";
    }
  } catch (err) {
    console.error("Erro ao obter dados da sessão:", err);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const dropdownButtons = document.querySelectorAll(".dropdown-btn");

  dropdownButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const parent = btn.parentElement;

      // abre/fecha somente o dropdown clicado
      parent.classList.toggle("open");
    });
  });
});
document.addEventListener("DOMContentLoaded", carregarTurmasDocente);

async function carregarTurmasDocente() {
    try {
        const resp = await fetch("/turma/listarDoDocente", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (!resp.ok) {
            console.error("Erro ao buscar turmas");
            return;
        }

        const dados = await resp.json();
        const corpo = document.getElementById("lista-turmas");

        corpo.innerHTML = "";

        if (dados.length === 0) {
            corpo.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center">Nenhuma turma encontrada!</td>
                </tr>
            `;
            return;
        }

        dados.forEach(t => {
            corpo.innerHTML += `
                <tr>
                    <td>${t.CODIGO_TURMA}</td>
                    <td>${t.NOME_DISCIPLINA}</td>
                    <td>${t.NOME_TURMA ?? "-"}</td>
                </tr>
            `;
        });

    } catch (erro) {
        console.error("Erro ao carregar turmas:", erro);
    }
}

