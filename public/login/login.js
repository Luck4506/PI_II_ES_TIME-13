// Captura evento de clique do botão de login
document.querySelector('#btn-login').addEventListener('click', (evt) => {
  evt.preventDefault(); // Evita recarregar a página
  autenticarUsuario();
});

let email = '';
let senha = '';

// Captura os valores digitados
function capturarEntradas() {
  email = document.querySelector('#email').value;
  senha = document.querySelector('#senha').value;
}

// Valida se os campos foram preenchidos
function validarEntradas() {
  capturarEntradas();
  if (email === '' || senha === '') {
    alert('Por favor, preencha todos os campos!');
    return false;
  }
  return true;
}

// Faz a autenticação com o servidor
async function autenticarUsuario() {
  if (!validarEntradas()) return;

  const dados = { email, senha };

  try {
    const resposta = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      alert('Erro ao tentar autenticar. Email ou senha incorretos.');
      console.warn('HTTP error:', resposta.status, resposta.statusText);
      return;
    }

    const data = await resposta.json();

    if (data && data.autenticado) {
      alert('Login realizado com sucesso!');
      console.log('Autenticação OK:', data);
      window.location.href = '/dashboard';
    } else {
      alert(data.mensagem || 'Email ou senha incorretos.');
      console.warn('Autenticação negada:', data);
    }
  } catch (erro) {
    console.error('Erro ao tentar conectar ao servidor:', erro);
    alert('Erro ao conectar com o servidor. Tente novamente.');
  }
}

console.log('Script de login.js carregado com sucesso!');
