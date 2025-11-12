const tipoMedia = document.getElementById("tipoMedia");
const inputsNotas = document.getElementById("inputsNotas");
const btnAdd = document.getElementById("adicionarNota");
const btnCalcular = document.getElementById("calcular");
const resultado = document.getElementById("resultado");
const btnNovo = document.getElementById("novoRegistro");

let contador = 0;

function criarLinhaNota() {
  contador++;

  const linha = document.createElement("div");
  linha.classList.add("linha-nota");

  const colunaNota = document.createElement("div");
  colunaNota.classList.add("coluna");

  const labelNota = document.createElement("label");
  labelNota.textContent = `Nota ${contador}:`;

  const inputNota = document.createElement("input");
  inputNota.type = "number";
  inputNota.className = "nota";
  inputNota.placeholder = "0 a 10";
  inputNota.min = "0";
  inputNota.max = "10";
  inputNota.step = "0.01";

  // junta label + input
  colunaNota.appendChild(labelNota);
  colunaNota.appendChild(inputNota);
  linha.appendChild(colunaNota);

  //ponderada
  if (tipoMedia.value === "ponderada") {
    const colunaPeso = document.createElement("div");
    colunaPeso.classList.add("coluna");

    const labelPeso = document.createElement("label");
    labelPeso.textContent = "Peso:";

    const inputPeso = document.createElement("input");
    inputPeso.type = "number";
    inputPeso.className = "peso";
    inputPeso.placeholder = "Peso";
    inputPeso.min = "0";
    inputPeso.step = "0.1";

    colunaPeso.appendChild(labelPeso);
    colunaPeso.appendChild(inputPeso);
    linha.appendChild(colunaPeso);
  }

  inputsNotas.appendChild(linha);

  inputNota.focus();

  // enter
  inputNota.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      criarLinhaNota();
    }
  });
}


btnAdd.addEventListener("click", criarLinhaNota);

tipoMedia.addEventListener("change", function () {
  const notas = document.querySelectorAll(".nota");
  const pesos = document.querySelectorAll(".peso");

  const valoresNotas = [];
  const valoresPesos = [];

  notas.forEach((n) => valoresNotas.push(n.value));
  pesos.forEach((p) => valoresPesos.push(p.value));

  inputsNotas.innerHTML = "";
  contador = 0;

  // recria as linhas, mantendo os valores
  for (let i = 0; i < valoresNotas.length; i++) {
    criarLinhaNota();
    const novaNota = document.querySelectorAll(".nota")[i];
    novaNota.value = valoresNotas[i];

    const novoPeso = document.querySelectorAll(".peso")[i];
    if (novoPeso && valoresPesos[i]) novoPeso.value = valoresPesos[i];
  }
});

//calculo média
btnCalcular.addEventListener("click", function () {
  const notas = document.querySelectorAll(".nota");
  const pesos = document.querySelectorAll(".peso");

  let valoresNotas = [];
  let valoresPesos = [];

  notas.forEach((n) => valoresNotas.push(parseFloat(n.value)));
  pesos.forEach((p) => valoresPesos.push(parseFloat(p.value)));

  if (valoresNotas.length === 0) {
    alert("Adicione pelo menos uma nota!");
    return;
  }

  if (valoresNotas.some(isNaN)) {
    alert("Preencha todas as notas corretamente!");
    return;
  }

  let media = 0;

  // média aritmética
  if (tipoMedia.value === "aritmetica") {
    let soma = 0;
    valoresNotas.forEach((nota) => (soma += nota));
    media = soma / valoresNotas.length;
  }
  // média ponderada
  else {
    if (valoresPesos.some(isNaN)) {
      alert("Preencha todos os pesos corretamente!");
      return;
    }

    let somaNotas = 0;
    let somaPesos = 0;

    for (let i = 0; i < valoresNotas.length; i++) {
      somaNotas += valoresNotas[i] * valoresPesos[i];
      somaPesos += valoresPesos[i];
    }

    media = somaNotas / somaPesos;
  }

  resultado.innerHTML = `Média final: <strong>${media.toFixed(2)}</strong>`;
});

// novo registro / apagar tud
btnNovo.addEventListener("click", function () {
  if (confirm("Deseja apagar tudo e começar de novo?")) {
    inputsNotas.innerHTML = "";
    resultado.innerHTML = "";
    contador = 0;
    criarLinhaNota(); 
  }
});

criarLinhaNota();
