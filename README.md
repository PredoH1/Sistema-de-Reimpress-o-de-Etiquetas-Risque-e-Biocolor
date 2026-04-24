# 🏷️ Sistema de Reimpressão Inteligente de Etiquetas (Risque & Biocolor)

## 🚀 Visão Geral

Este projeto consiste no desenvolvimento de uma aplicação interna para **reimpressão automatizada de etiquetas** utilizadas no processo de remontagem de produtos (Risque e Biocolor).

A solução foi construída com foco em **padronização, redução de atividades manuais e ganho de eficiência operacional**, eliminando dependências de equipamentos externos e garantindo conformidade com o padrão fabril.

---

## 🎯 Problema

O processo anterior apresentava diversos pontos críticos:

- Alto volume de atividades manuais  
- Dependência de leitor de código de barras  
- Falta de padronização nas etiquetas  
- Risco elevado de erro humano  
- Retrabalho frequente  
- Tempo elevado de execução  

Além disso, as informações das etiquetas nem sempre seguiam o padrão da fábrica, gerando inconsistências operacionais.

---

## ⚙️ Solução

Foi desenvolvido um sistema que:

- Permite a criação manual de etiquetas de forma estruturada  
- Gera automaticamente o código de barras  
- Organiza múltiplas etiquetas em uma fila  
- Realiza impressão em massa (batch printing)  
- Garante padronização das informações  

---

## 🧠 Lógica do Sistema

### 🔹 Geração de Código de Barras
- Conversão automática dos dados inseridos em formato compatível com impressão
- Integração com linguagem **ZPL (Zebra Programming Language)**

---

### 🔹 Fila de Impressão (Batch Processing)

- Armazena múltiplas etiquetas temporariamente  
- Permite revisão antes da impressão  
- Executa impressão em lote  

👉 Implementação de **processamento em batch**, reduzindo tempo operacional

---

### 🔹 Padronização de Dados

- Estrutura fixa de campos  
- Validação de entrada  
- Garantia de consistência com padrão fabril  

---

### 🔹 Integração com Impressora

- Geração de comandos ZPL  
- Envio automatizado para impressora térmica  
- Execução via script `.bat`  

---

## 🏗️ Arquitetura da Solução

A solução é composta por múltiplas camadas:

| Componente | Função |
|----------|--------|
| Interface Web (HTML/CSS/JS) | Entrada de dados e interação |
| Lógica de Geração | Construção das etiquetas |
| ZPL Engine | Formatação para impressão |
| Script `.bat` | Disparo da impressão |
| Python / Excel (apoio) | Manipulação e organização de dados |

---

## 🛠️ Tecnologias Utilizadas

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="30"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="30"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="30"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="30"/>
</p>

**Outros:**
- ZPL (Zebra Programming Language)
- Batch Script (.bat)
- Microsoft Excel

---

## 📈 Resultados

- Redução significativa do tempo de reimpressão  
- Eliminação de dependência de leitores de código de barras  
- Padronização total das etiquetas  
- Redução de erros operacionais  
- Maior agilidade no processo de remontagem  

---

## 🧩 Conceitos Aplicados

- Automação de processos operacionais  
- Batch Processing  
- Geração dinâmica de código de barras  
- Integração com sistemas de impressão térmica  
- Padronização de dados  
- Redução de intervenção manual  

---

## 👨‍💻 Autor

Desenvolvido por [Pedro Henrique Souza Candido]

