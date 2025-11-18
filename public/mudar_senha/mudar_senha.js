//Codigo de autoria de Pedro Vinicius Romanato e Joao Pedro Diniz
// Listener para verificar o estado da sessão do usuário ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Busca os dados da sessão do usuário no back-end
    const resposta = await fetch("/api/session", { credentials: "same-origin" });
    if (resposta.ok) {
      // Se a sessão estiver ativa, extrai o nome e exibe a saudação
      const data = await resposta.json();
      const nome = data?.user?.nome;
      const saudacaoElemento = document.getElementById("saudacao");
      
      if (nome && saudacaoElemento) {
        saudacaoElemento.textContent = `Olá, ${nome}!`;
      }
    } else if (resposta.status === 401) {
      // Se não estiver autenticado (401), redireciona para a página de login
      window.location.href = "/login";
    }
  } catch (err) {
    console.error("Erro ao obter dados da sessão:", err);
  }
});

// Seleção do botão para mudar a senha
const btn = document.querySelector('button#btn-mudar-senha');
// Adiciona listener para a função 'mudarSenha' ao clicar no botão
btn?.addEventListener('click', (e) => { e.preventDefault(); mudarSenha(); });
// Previne o comportamento padrão de submissão do formulário
document.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault());
// Variáveis globais para armazenar as novas senhas
let novaSenha = '';
let novaSenhaConfirmacao = '';

// Função para validar se os campos de senha foram preenchidos e se as senhas são iguais
function validarEntradas() {
  capturarEntradas();
 // Verifica se algum campo está vazio
  if (novaSenha === '' || novaSenhaConfirmacao === '') {
    alert('Por favor, digite todos os campos!');
    return false;
  }
    // Verifica se os campos de senha são idênticos
  else if (novaSenha != novaSenhaConfirmacao){
    window.alert('As senhas precisam ser iguais!')
    return false
  }
  return true;
}

// Função para capturar os valores dos campos de nova senha e confirmação
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