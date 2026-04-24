// ESSE BACKUP E O BACKUP DO DIA 02/04 O PROBLEMA DESSE SCRIPT E QUE ELE ESTA CORTANDO E PASSANDO OS LIMITES DA ETIQUETA
// Base carregada automaticamente via ferramentas/base_dados.js
// Para atualizar a base: rode converte_base.py na pasta do projeto
let baseDados = typeof BASE_DADOS !== "undefined" ? BASE_DADOS : [];
let fila = [];

if (baseDados.length === 0) {
  alert(
    "⚠️ base_dados.js não encontrado ou vazio!\nRode o converte_base.py para gerar a base.",
  );
}

// ─── Busca ZUI pelo código do material ───────────────────────────────────────
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

// ─── Navegação por Enter entre campos ────────────────────────────────────────
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
      }
    }
  });
});

// ─── Adicionar à fila ─────────────────────────────────────────────────────────
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

// ─── Apagar fila ──────────────────────────────────────────────────────────────
function apagarFila() {
  if (fila.length === 0) {
    alert("A fila já está vazia!");
    return;
  }
  if (confirm("Tem certeza que deseja apagar toda a fila?")) {
    fila = [];
    renderFila();
  }
}

// ─── Renderizar fila na tela ──────────────────────────────────────────────────
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

// ─── Remover etiqueta individual ──────────────────────────────────────────────
function removerEtiqueta(index) {
  fila.splice(index, 1);
  renderFila();
}

// ─── Quebrar nome em linhas (fallback) ────────────────────────────────────────
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

// ─── Imprimir fila em ZPL ─────────────────────────────────────────────────────
function imprimirFila() {
  if (fila.length === 0) {
    alert("Fila vazia!");
    return;
  }

  let usarFB = true;
  let zplCompleto = "";

  fila.forEach((etq) => {
    let yNome = 40;
    let alturaLinha = 23;
    let totalAlturaNome = 0;
    let zplNome = "";

    if (usarFB) {
      let larguraBloco = 180;
      let charsporLinha = 15;

      if (etq.nome.length > charsporLinha) {
        // Quebra manualmente em 2 linhas mantendo fonte 23
        let linhas = quebrarNome(etq.nome, charsporLinha);
        totalAlturaNome = alturaLinha * Math.min(2, linhas.length);
        linhas.slice(0, 2).forEach((linha, idx) => {
          zplNome += `^FO380,${yNome + alturaLinha * idx}^A0N,23,23^FD${linha}^FS\n`;
        });
      } else {
        // Nome curto: 1 linha, fonte 23, usa FB normalmente
        totalAlturaNome = alturaLinha * 1;
        zplNome = `^FO380,${yNome}^A0N,23,23^FB${larguraBloco},1,0,L,0^FD${etq.nome}^FS`;
      }
    } else {
      let linhasNome = quebrarNome(etq.nome, 18);
      totalAlturaNome = alturaLinha * linhasNome.length;
      linhasNome.forEach((linha, idx) => {
        zplNome += `^FO380,${yNome + alturaLinha * idx}^A0N,23,23^FD${linha}^FS\n`;
      });
    }

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
