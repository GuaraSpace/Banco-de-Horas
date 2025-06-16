// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAM29vZ2OZ1r_ff0UItgPMNZWOLwk",
  authDomain: "empresa-junior-guara-space.firebaseapp.com",
  databaseURL: "https://empresa-junior-guara-space-default-rtdb.firebaseio.com",
  projectId: "empresa-junior-guara-space",
  storageBucket: "empresa-junior-guara-space.firebasestorage.app",
  messagingSenderId: "747456424706",
  appId: "1:747456424706:web:bcf36feb1ff61390c7701b",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const form = document.getElementById("form-horas");
const nomeInput = document.getElementById("nome");
const tipoInput = document.getElementById("tipo");
const quantidadeInput = document.getElementById("quantidade");
const horasInput = document.getElementById("horas");
const idInput = document.getElementById("id");

// Mapeamento dos membros por ID
const membros = {
  24001: "Nickolas Ferreira Maiolino",
  24002: "João Victor Alberto Cancissú",
  24003: "Silas Almeida Durans Lima",
  24004: "Gabrielle Ribeiro Silva",
  24005: "Lucas Matheus dos Passos Gomes",
  24006: "Ana Luiza Oliveira Guimarães O'Farrell",
  24007: "Felipe Portela Aguilar de Oliveira",
  24008: "Luis Antonio Bastos Polari",
  24009: "Saynara de Sousa da Silva",
  24010: "Helton Jorge Silva Santos Junior",
  24011: "José de Ribamar Pereira Soares Júnior",
  24012: "José Emanuel Figueredo Lopes Lacerda",
  24013: "Kauanny Brito Vieira",
};

// Totalizador visual de horas
const totalizadorDiv = document.createElement("div");
totalizadorDiv.style.marginTop = "10px";
document
  .getElementById("form-horas")
  .insertBefore(totalizadorDiv, form.firstChild);

idInput.addEventListener("blur", async () => {
  const id = idInput.value.trim();
  if (membros[id]) {
    const snapshot = await db.ref(`horas/${id}`).once("value");
    const dados = snapshot.exists() ? snapshot.val() : null;
    if (dados) {
      totalizadorDiv.innerHTML = `
        <div class="info-box">
          <strong>${dados.nome}</strong><br>
          Total de Horas: <strong>${(dados.totalHoras || 0).toFixed(
            2
          )}h</strong><br>
          Plantões: ${dados.plantoes || 0}<br>
          Trabalho: ${dados.trabalho || 0}<br>
          Complementar: ${dados.complementar || 0}<br>
          Outros: ${dados.outros || 0}
        </div>`;
    } else {
      totalizadorDiv.innerHTML = "";
    }
  }
});

// Envio do formulário
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = nomeInput.value;
  const tipo = tipoInput.value;
  const quantidade = quantidadeInput.value;
  const horas = horasInput.value;
  const id = idInput.value.trim();
  const timestamp = new Date().toLocaleString("pt-BR");

  if (!id || !membros[id]) {
    alert("ID inválido ou não cadastrado.");
    return;
  }

  if (!tipo || (!quantidade && !horas)) {
    alert("Preencha corretamente o tipo e a quantidade ou horas.");
    return;
  }

  form.querySelector("button").disabled = true;

  const referencia = db.ref(`horas/${id}`);
  referencia.once("value", (snapshot) => {
    let dados = snapshot.val();
    if (!dados) {
      dados = {
        nome: membros[id],
        totalHoras: 0,
        plantoes: 0,
        trabalho: 0,
        complementar: 0,
        outros: 0,
        registros: [],
      };
    }

    let horasCalc = 0;

    if (tipo === "Plantão") {
      horasCalc = parseFloat(quantidade) * 2.5;
      dados.plantoes += parseFloat(quantidade);
    } else {
      horasCalc = parseFloat(horas);
      if (tipo === "Trabalho") dados.trabalho += horasCalc;
      else if (tipo === "Complementar") dados.complementar += horasCalc;
      else if (tipo === "Outros") dados.outros += horasCalc;
    }

    dados.totalHoras += horasCalc;
    dados.registros.push({ tipo, quantidade, horas: horasCalc, timestamp });

    referencia.set(dados, (error) => {
      form.querySelector("button").disabled = false;
      if (error) {
        alert("Erro ao registrar. Tente novamente.");
      } else {
        alert("Horas registradas com sucesso!");
        form.reset();
        totalizadorDiv.innerHTML = "";
      }
    });
  });
});
