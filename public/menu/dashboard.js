document.addEventListener("DOMContentLoaded", async () => {
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
