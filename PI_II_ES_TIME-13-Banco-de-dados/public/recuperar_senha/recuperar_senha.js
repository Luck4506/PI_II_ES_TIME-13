const btn = document.querySelector('button#btn-recuperar-senha');
btn?.addEventListener('click', (e) => { e.preventDefault(); recuperarSenha(); });
document.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault());

let email = '';

function validarEntradas() {
  capturarEntradas();
  if (email === '') {
    alert('Por favor, digite seu email!');
    return false;
  }
  return true;
}

function capturarEntradas() {
  email = document.querySelector('#email').value;
}

//manda requisição para o servidor para redefinir a senha
async function recuperarSenha() {
  if (!validarEntradas()) return;

  const dados = { email };

  try {
    // Envia o email digitado ao servidor
    const resposta = await fetch('/recuperar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      console.warn('Erro HTTP:', resposta.status, resposta.statusText);
    }

    // Resposta genérica para o usuário
    document.querySelector('p#mensagem-recuperacao').innerHTML = 'Se o endereço de e-mail informado estiver cadastrado, você receberá um email com instruções para redefinir sua senha.';
    const input = document.querySelector('#email');
    if (input) input.value = '';

  } catch (erro) {
    console.error('Erro ao enviar e-mail para o servidor:', erro);
    alert('Erro ao conectar com o servidor. Tente novamente.');
}
}