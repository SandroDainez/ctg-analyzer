# Analisador de CTG

Interpretação de cardiotocografia por IA usando DeepSeek + Next.js, pronto para deploy no Vercel.

---

## Deploy no Vercel (passo a passo)

### 1. Suba o código no GitHub

```bash
git init
git add .
git commit -m "primeiro commit"
git remote add origin https://github.com/SEU_USUARIO/ctg-analyzer.git
git push -u origin main
```

### 2. Importe no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New → Project**
3. Selecione o repositório `ctg-analyzer`
4. Clique em **Deploy** (as configurações padrão funcionam)

### 3. Configure a variável de ambiente

1. No painel do projeto no Vercel, vá em **Settings → Environment Variables**
2. Adicione:
   - **Name:** `DEEPSEEK_API_KEY`
   - **Value:** sua chave da API DeepSeek (obtenha em [platform.deepseek.com](https://platform.deepseek.com))
3. Clique em **Save**
4. Vá em **Deployments** e clique em **Redeploy**

Pronto! O app estará disponível na URL gerada pelo Vercel.

---

## Rodar localmente

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local e coloque sua DEEPSEEK_API_KEY

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## Estrutura do projeto

```
ctg-analyzer/
├── app/
│   ├── api/analyze/route.js   # Backend — chama a API DeepSeek
│   ├── layout.js
│   └── page.js
├── components/
│   ├── CTGAnalyzer.js         # Componente principal
│   └── CTGAnalyzer.module.css
├── .env.example
└── package.json
```

---

## Aviso

Esta ferramenta é um auxílio de triagem e não substitui avaliação médica profissional.
