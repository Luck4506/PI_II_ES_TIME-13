document.getElementById("btnImportar").addEventListener("click", () => {
  const input = document.getElementById("jsonFile");
  const file = input.files[0];

  if (!file){
    alert("Selecione um arquivo JSON!");
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);

      // RA, matricula, id, codigo
      const alunos = dados.map((a) => ({
        id: a.RA || a.matricula || a.id || a.codigo,
        nome: a.nome || a.fullName || a.completeName || "Sem nome"
      }));

      //remove duplicatas
      const semDuplicatas = [];
      const idsVistos = new Set();

      for (const aluno of alunos) {
        if (!idsVistos.has(aluno.id)) {
          semDuplicatas.push(aluno);
          idsVistos.add(aluno.id);
        }
      }

      // limite de exibição para loer varios Ras
      const limite = 100;
      const lista = document.getElementById("lista-alunos");
      const resumo = document.getElementById("resumo");

      lista.innerHTML = "";

      //resumo
      resumo.textContent = `Total de alunos importados: ${semDuplicatas.length} 
      (${alunos.length - semDuplicatas.length} duplicados ignorados).`;

      // exibir - id = RA, nome não - scroll 
      semDuplicatas.slice(0, limite).forEach((aluno) => {
        const li = document.createElement("li");
        li.textContent = `${aluno.id} - ${aluno.nome}`;
        lista.appendChild(li);
      });

      // alerta mais de 100
      if (semDuplicatas.length > limite) {
        const aviso = document.createElement("li");
        aviso.style.fontStyle = "italic";
        aviso.textContent = `... e mais ${semDuplicatas.length - limite} alunos não exibidos`;
        //por causa do limite de 100 ja definido
        lista.appendChild(aviso);
      }

      console.log("Alunos importados:", semDuplicatas);

    } catch (err) {
      alert("Erro ao ler o arquivo JSON!");
      console.error(err);
    }
  };

  reader.readAsText(file);
});
