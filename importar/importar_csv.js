//msm coisa do json
document.getElementById("btnImportar").addEventListener("click", () => {
  const input = document.getElementById("arquivo");
  const file = input.files[0];

  if (!file) {
    alert("Selecione um arquivo JSON ou CSV!");
    return;
  }

  const extensao = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = (e) => {
    const conteudo = e.target.result;
    let alunos = [];

    try {
      if (extensao === "json") {
        alunos = JSON.parse(conteudo).map((a) => ({
          id: a.RA || a.matricula || a.id || a.codigo,
          nome: a.nome || a.fullName || a.completeName || "Sem nome"
        }));
      } else if (extensao === "csv") {
        const linhas = conteudo.split(/\r?\n/).filter(l => l.trim() !== "");
        alunos = linhas.map(linha => {
          const [id, nome] = linha.split(",");
          return { id: id?.trim(), nome: nome?.trim() };
        });
      } else {
        alert("Formato não suportado! Envie JSON ou CSV.");
        return;
      }

      //remover duplicatas
      const semDuplicatas = [];
      const idsVistos = new Set();
      for (const aluno of alunos) {
        if (aluno.id && !idsVistos.has(aluno.id)) {
          semDuplicatas.push(aluno);
          idsVistos.add(aluno.id);
        }
      }

      //resultado
      const limite = 100;
      const lista = document.getElementById("lista-alunos");
      const resumo = document.getElementById("resumo");

      lista.innerHTML = "";
      resumo.textContent = `Total de alunos importados: ${semDuplicatas.length} (${alunos.length - semDuplicatas.length} duplicados ignorados).`;

      semDuplicatas.slice(0, limite).forEach((aluno) => {
        const li = document.createElement("li");
        li.textContent = `${aluno.id} - ${aluno.nome}`;
        lista.appendChild(li);
      });

      if (semDuplicatas.length > limite) {
        const aviso = document.createElement("li");
        aviso.style.fontStyle = "italic";
        aviso.textContent = `... e mais ${semDuplicatas.length - limite} alunos não exibidos`;
        lista.appendChild(aviso);
      }

      console.log("Alunos importados:", semDuplicatas);

    } catch (err) {
      alert("Erro ao processar o arquivo!");
      console.error(err);
    }
  };

  reader.readAsText(file);
});
