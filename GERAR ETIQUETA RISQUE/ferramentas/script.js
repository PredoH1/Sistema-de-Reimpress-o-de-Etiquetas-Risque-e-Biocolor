// Base carregada automaticamente via ferramentas/base_dados.js
// Para atualizar a base: rode atualizar_base.bat na raiz do projeto
let baseDados = typeof BASE_DADOS !== "undefined" ? BASE_DADOS : [];
let fila = [];

if (baseDados.length === 0) {
  alert(
    "⚠️ base_dados.js não encontrado ou vazio!\nRode o atualizar_base.bat para gerar a base.",
  );
}

function buscarZUI(codigo) {
  codigo = String(codigo).trim();
  const material = baseDados.find(
    (item) => String(item.Material).trim() === codigo,
  );
  if (!material) {
    alert("Material não encontrado!");
    return null;
  }
  return material.ZUI;
}

const inputs = [
  document.getElementById("material"),
  document.getElementById("nome"),
  document.getElementById("lote"),
  document.getElementById("validade"),
  document.getElementById("hora"),
  document.getElementById("quantidade"),
];

inputs.forEach((input, index) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const proximo = inputs[index + 1];
      if (proximo) {
        proximo.focus();
      } else {
        console.log("Último campo preenchido!");
      }
    }
  });
});

function adicionarFila() {
  let material = document.getElementById("material").value;
  let nome = document.getElementById("nome").value;
  let lote = document.getElementById("lote").value;
  let validade = document.getElementById("validade").value;
  let hora = document.getElementById("hora").value;
  let quantidade = parseInt(document.getElementById("quantidade").value) || 1;

  let zui = buscarZUI(material);
  if (!zui) return;

  for (let i = 0; i < quantidade; i++) {
    fila.push({ material, nome, lote, validade, hora, zui, quantidade: 1 });
  }
  renderFila();

  document.getElementById("material").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("lote").value = "";
  document.getElementById("validade").value = "";
  document.getElementById("quantidade").value = 1;

  document.getElementById("material").focus();
}

function apagarFila() {
  if (fila.length === 0) {
    alert("A fila já está vazia!");
    return;
  }

  const confirmar = confirm("Tem certeza que deseja apagar toda a fila?");
  if (confirmar) {
    fila = [];
    renderFila();
  }
}

function renderFila() {
  let filaDiv = document.getElementById("fila");
  filaDiv.innerHTML = "";

  fila.forEach((etq, i) => {
    let div = document.createElement("div");
    div.className = "etiqueta";
    div.innerHTML = `
        <b>${etq.nome}</b><br>
        COD: ${etq.material}<br>
        L: ${etq.lote} &nbsp; V: ${etq.validade} ${etq.hora}<br>
        ZUI: ${etq.zui}
        <button class="remover" onclick="removerEtiqueta(${i})">X</button>
      `;
    filaDiv.appendChild(div);
  });
}

function removerEtiqueta(index) {
  fila.splice(index, 1);
  renderFila();
}

function quebrarNome(nome, maxCharsPorLinha) {
  let palavras = nome.split(" ");
  let linhas = [];
  let linhaAtual = "";

  palavras.forEach((palavra) => {
    if ((linhaAtual + " " + palavra).trim().length <= maxCharsPorLinha) {
      linhaAtual = (linhaAtual + " " + palavra).trim();
    } else {
      if (linhaAtual) linhas.push(linhaAtual);
      linhaAtual = palavra;
    }
  });

  if (linhaAtual) linhas.push(linhaAtual);

  return linhas;
}

function imprimirFila() {
  if (fila.length === 0) {
    alert("Fila vazia!");
    return;
  }

  let usarFB = true; // caso a configuração fallback falha, ou o nome estiver cortando, alternar para FALSE, com isso ira ser retornado para a configuração anterior

  let zplCompleto = "";

  fila.forEach((etq) => {
    let yNome = 40;
    let alturaLinha = 23;
    let totalAlturaNome = 0;
    let zplNome = "";

    if (usarFB) {
      let larguraBloco = 175;

      //  Config da fonte atual (A0N,23)
      let tamanhoFonte = 23;
      let fator = 0.6;

      //  Calcula quantos caracteres cabem na linha
      let maxCharsLinha = Math.floor(larguraBloco / (tamanhoFonte * fator));

      //  Decide se o nome vai quebrar (baseado em largura real)
      let nomeGrande = etq.nome.length > maxCharsLinha;

      //  Monta o ZPL (continua usando FB normalmente)
      zplNome = `
^FO380,${yNome}
^A0N,23,23
^FB${larguraBloco},2,0,L,0
^FD${etq.nome}^FS
`;

      // 🔹 Ajusta altura dinamicamente
      totalAlturaNome = nomeGrande ? alturaLinha * 2 : alturaLinha;
    } else {
      // MÉTODO ANTIGO (ORIGINAL)
      let linhasNome = quebrarNome(etq.nome, 18);
      totalAlturaNome = alturaLinha * linhasNome.length;

      linhasNome.slice(0, 2).forEach((linha, idx) => {
        zplNome += `^FO380,${yNome + alturaLinha * idx}^A0N,23,23^FD${linha}^FS\n`;
      });
    }

    // Mantém espaçamento original
    let yCOD = yNome + totalAlturaNome + 4;
    let yL = yCOD + 26;
    let yV = yL + 26;

    zplCompleto += `
^XA
^MMT
^PW559
^LL160  
^LS0

^BY3,2,92^FT80,130  ^BEN,,Y,N
^FH\\^FD${etq.zui}^FS

${zplNome}

^FO375,${yCOD}^A0N,23,23^FD COD: ${etq.material}^FS
^FO375,${yL}^A0N,23,23^FD L: ${etq.lote}^FS
^FO375,${yV}^A0N,23,23^FD V: ${etq.validade} ${etq.hora}^FS

^PQ1,0,1,Y
^XZ
    `;
  });

  fetch("http://172.24.120.148:9100", {
    method: "POST",
    body: zplCompleto,
  })
    .then(() => alert("Impressão enviada!"))
    .catch((err) => console.error("Erro ao imprimir:", err));
}
