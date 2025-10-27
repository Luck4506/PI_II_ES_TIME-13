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


const btn = document.querySelector('button#btn-mudar-senha');
btn?.addEventListener('click', (e) => { e.preventDefault(); mudarSenha(); });
document.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault());

let novaSenha = '';
let novaSenhaConfirmacao = '';


function validarEntradas() {
  capturarEntradas();

  if (novaSenha === '' || novaSenhaConfirmacao === '') {
    alert('Por favor, digite todos os campos!');
    return false;
  }
  else if (novaSenha != novaSenhaConfirmacao){
    window.alert('As senhas precisam ser iguais!')
    return false
  }
  return true;
}

function capturarEntradas() {
  novaSenha = document.querySelector('#senha').value;
  novaSenhaConfirmacao = document.querySelector('#confirmar-senha').value;
}

//manda requisição para o servidor para trocar a senha
async function mudarSenha() {
  if (!validarEntradas()) return;

  const dados = { senha: novaSenha, confirmarSenha: novaSenhaConfirmacao };

  try {
    // Envia a nova senha para o servidor
    const resposta = await fetch('/recuperar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      console.warn('Erro HTTP:', resposta.status, resposta.statusText);
    }

  } catch (erro) {
    console.error('Erro ao enviar nova senha para o servidor:', erro);
    alert('Erro ao conectar com o servidor. Tente novamente.');
}
}