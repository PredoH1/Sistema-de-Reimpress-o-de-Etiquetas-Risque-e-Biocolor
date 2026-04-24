// Base carregada automaticamente via base_dados.js
// Para atualizar a base: rode atualizar_base.bat na raiz do projeto
let baseDados = typeof BASE_DADOS !== "undefined" ? BASE_DADOS : [];
let fila = [];

if (baseDados.length === 0) {
  alert("⚠️ base_dados.js não encontrado ou vazio!\nRode o atualizar_base.bat para gerar a base.");
}

// ─── Busca Descrição pelo código do material ──────────────────────────────────
function buscarDescricao(codigo) {
  codigo = String(codigo).trim();
  const material = baseDados.find(
    (item) => String(item.Material).trim() === codigo
  );
  if (!material) {
    alert("Material não encontrado!");
    return null;
  }
  return material["Descrição"];
}

// ─── Navegação por Enter entre campos ────────────────────────────────────────
const inputs = [
  document.getElementById("material"),
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
  let material  = document.getElementById("material").value;
  let lote      = document.getElementById("lote").value;
  let validade  = document.getElementById("validade").value;
  let hora      = document.getElementById("hora").value;
  let quantidade = parseInt(document.getElementById("quantidade").value) || 1;

  let descricao = buscarDescricao(material);
  if (!descricao) return;

  for (let i = 0; i < quantidade; i++) {
    fila.push({ material, lote, validade, hora, descricao });
  }

  renderFila();

  document.getElementById("material").value  = "";
  document.getElementById("lote").value      = "";
  document.getElementById("validade").value  = "";
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
      <b>${etq.descricao}</b><br>
      COD: ${etq.material}<br>
      L: ${etq.lote} &nbsp; V: ${etq.validade} ${etq.hora}
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

// ─── Quebrar descrição em linhas ──────────────────────────────────────────────
function quebrarDescricao(texto, maxCharsPorLinha) {
  let palavras = texto.split(" ");
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

  let zplCompleto = "";

  fila.forEach((etq) => {
    let yDescricao = 40;
    let yCodigo    = 70;
    let yLote      = 100;
    let yValidade  = 130;

    let linhasDescricao = quebrarDescricao(etq.descricao, 60);
    let alturaLinha = 32;

    let zplDescricao = "";
    linhasDescricao.forEach((linha, idx) => {
      zplDescricao += `^FO40,${yDescricao + alturaLinha * idx}^A0N,27,22^FD${linha}^FS\n`;
    });

    zplCompleto += `
^XA
^MMT
^PW559
^LL160
^LS0

${zplDescricao}

^FO40,${yCodigo}^A0N,27,22^FD CODIGO: ${etq.material}^FS
^FO40,${yLote}^A0N,27,22^FD LOTE: ${etq.lote}^FS
^FO40,${yValidade}^A0N,27,22^FD VALIDADE: ${etq.validade} - ${etq.hora}^FS

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
