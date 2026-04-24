import pandas as pd
import json
import os

# Caminho do Excel e do JS (ambos dentro da pasta ferramentas)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
xlsx_path = os.path.join(BASE_DIR, "Base.xlsb")
js_path   = os.path.join(BASE_DIR, "base_dados.js")

# Lê a planilha
df = pd.read_excel(xlsx_path, dtype=str, engine="pyxlsb")
df = df.fillna("")

# Remove espaços extras dos nomes das colunas
df.columns = df.columns.str.strip()

# Remove espaços extras dos valores em todas as células
df = df.apply(lambda col: col.map(lambda x: x.strip() if isinstance(x, str) else x))

# Filtra somente materiais com ZUI preenchido
df = df[df["ZUI"].str.strip() != ""]

# Converte para lista de dicionários
dados = df.to_dict(orient="records")

# Gera o arquivo .js
js_content = f"var BASE_DADOS = {json.dumps(dados, ensure_ascii=False, indent=2)};\n"

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"✅ base_dados.js gerado com {len(dados)} registros em:\n   {js_path}")
