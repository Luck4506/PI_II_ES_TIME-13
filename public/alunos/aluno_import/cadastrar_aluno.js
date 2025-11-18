// --- 1. FUNÇÃO DE CADASTRO OTIMIZADA PARA IMPORTAÇÃO ---

async function cadastrarAlunoImportado(ra, nome) {
  const dados = {
    ra: String(ra).trim(),
    nome: String(nome).trim()
  };

  // Se o RA ou Nome estiver vazio após o trim, consideramos uma falha de dados
  if (!dados.ra || !dados.nome) {
    console.error(`Dados incompletos para cadastro: RA='${dados.ra}', Nome='${dados.nome}'`);
    return false;
  }

  try {
    const response = await fetch('http://localhost:3000/aluno', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    if (response.ok) {
      // Cadastro bem-sucedido
      return true;
    } else {
      // Erro na resposta da rota
      const errorText = await response.text(); // Tenta ler a mensagem de erro
      console.error(` Falha ao cadastrar aluno Erro: ${errorText}`);
      return false;
    }
  } catch (error) {
    // Erro de rede ou outro erro de requisição
    console.error(`Falha na requisição `, error);
    return false;
  }
}

//LÓGICA DE IMPORTAÇÃO

document.getElementById("btnImportar").addEventListener("click", () => {
  const input = document.getElementById("arquivo");
  const file = input.files[0];

  if (!file) {
    alert("Selecione um arquivo JSON ou CSV!");
    return;
  }

  const extensao = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();

  
  reader.onload = async (e) => {
    const conteudo = e.target.result;
    let alunos = [];

    try {
      // divisionamento DO ARQUIVO
      if (extensao === "json") {
        alunos = JSON.parse(conteudo).map((a) => ({
          id: a.RA || a.matricula || a.id || a.codigo,
          nome: a.nome || a.fullName || a.completeName || "Sem nome"
        }));
      } else if (extensao === "csv") {
        // Ignorando a primeira linha (cabeçalho) se houver
        const linhas = conteudo.split(/\r?\n/).filter(l => l.trim() !== ""); 
        
        alunos = linhas.map(linha => {
          // Assume que o formato é sempre: id,nome
          const [id, nome] = linha.split(","); 
          return { id: id?.trim(), nome: nome?.trim() };
        }).filter(aluno => aluno.id && aluno.nome); // Filtra linhas incompletas
        
      } else {
        alert("Formato não suportado! Envie JSON ou CSV.");
        return;
      }

      // REMOÇÃO DE DUPLICATAS E FILTRAGEM
      const semDuplicatas = [];
      const idsVistos = new Set();
      for (const aluno of alunos) {
        // Verifica se o ID não é nulo/vazio e não foi visto antes
        if (aluno.id && !idsVistos.has(aluno.id)) { 
          semDuplicatas.push(aluno);
          idsVistos.add(aluno.id);
        }
      }

      // PREPARAÇÃO E INÍCIO DO CADASTRO EM MASSA
      const resumo = document.getElementById("resumo");
      const lista = document.getElementById("lista-alunos");
      const totalProcessar = semDuplicatas.length;
      
      lista.innerHTML = "";
      resumo.innerHTML = `Processando **${totalProcessar}** alunos (únicos)...`;
      
      let sucessoContador = 0;
      let falhaContador = 0;
      const limite = 100;

      // LOOP DE CADASTRO
      for (let i = 0; i < semDuplicatas.length; i++) {
        const aluno = semDuplicatas[i];
        
        // Chamada assíncrona para cadastrar no banco de dados
        const sucesso = await cadastrarAlunoImportado(aluno.id, aluno.nome);
        
        if (sucesso) {
          sucessoContador++;
        } else {
          falhaContador++;
        }
        
        // Atualiza o resumo visualmente após o processamento de cada aluno ou a cada 10 para feedback rápido
        if (i % 10 === 0 || i === totalProcessar - 1) {
             resumo.innerHTML = `
                Processando... (${i + 1} de ${totalProcessar} concluídos)<br>
                Sucesso: **${sucessoContador}** | Falha: **${falhaContador}**
            `;
        }

        // Adiciona o aluno à lista de exibição (limitado a 100)
        if (i < limite) {
             const li = document.createElement("li");
             li.textContent = `${aluno.id} - ${aluno.nome} (${sucesso ? 'OK' : 'FALHA'})`;
             li.style.color = sucesso ? 'green' : 'red';
             lista.appendChild(li);
        }
      }
      
      // ATUALIZAÇÃO FINAL DO RESUMO
      resumo.innerHTML = `
        Aluno(s) Cadastrados com sucesso!<br>
        Total de alunos no arquivo: ${totalProcessar}.<br>
        Cadastro com Sucesso: ${sucessoContador}.<br>
        Cadastro com Falha: ${falhaContador}.<br>
        (Total de duplicados/inválidos ignorados: ${alunos.length - totalProcessar}).
      `;

      if (totalProcessar > limite) {
        const aviso = document.createElement("li");
        aviso.style.fontStyle = "italic";
        aviso.textContent = `... e mais ${totalProcessar - limite} alunos não exibidos na lista.`;
        lista.appendChild(aviso);
      }

    } catch (err) {
      alert("Erro ao processar o arquivo! Verifique o formato ou a estrutura dos dados.");
      console.error(err);
      resumo.textContent = "Erro ao processar o arquivo.";
    }
  };

  reader.readAsText(file);
});