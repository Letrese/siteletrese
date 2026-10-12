# 🔧 Guia de Resolução de Problemas Comuns (Troubleshooting)

> **TL;DR:**  
> A maioria dos problemas do dia a dia se resolve com: (1) Apertar `Ctrl + F5` para limpar o cache do navegador; (2) Aguardar 2 minutos para o GitHub Actions terminar o deploy; ou (3) Convidar o usuário como Colaborador no repositório GitHub para ele ter acesso ao `/admin/`.

---

## 1. "Fiz uma alteração no admin, mas ela não aparece no site!"

### Causa:
O GitHub Actions leva cerca de 1 a 2 minutos para compilar e o navegador do usuário guarda a página antiga em cache.

### Solução:
1. Acesse [github.com/Letrese/siteletrese/actions](https://github.com/Letrese/siteletrese/actions) e veja se o processo **Deploy Jekyll site to Pages** ainda está rodando (círculo amarelo) ou se já terminou (ícone verde ✔).
2. Assim que estiver verde, abra o site e pressione **`Ctrl + F5`** (ou `Cmd + Shift + R` no Mac) para forçar o navegador a recarregar tudo do zero sem usar a memória local.

---

## 2. "Alguma página está dando erro 404 (Não encontrada)"

### Causa:
No GitHub Pages, o Jekyll gera pastas amigáveis (ex: `/sobre/` e não `/sobre.html`).

### Solução:
* Verifique se o link que você digitou ou clicou termina com barra `/` (ex: `https://letrese.github.io/siteletrese/sobre/`).
* Se você adicionou uma nova página, verifique se no topo do arquivo `.html` foi incluído o `permalink: /nome-da-pagina/` dentro do cabeçalho de três traços `---`.

---

## 3. "Ao clicar em Login with GitHub, abre uma janela escrita 'Not Found'"

### Causa:
O Decap CMS perdeu a referência da URL do proxy de autenticação no arquivo `admin/config.yml`.

### Solução:
1. Abra o arquivo `admin/config.yml`.
2. Certifique-se de que a linha `base_url` está configurada corretamente:
   ```yaml
   backend:
     name: github
     repo: Letrese/siteletrese
     branch: main
     base_url: https://letrese-oauth.gakimuro.workers.dev
     auth_endpoint: auth
   ```

---

## 4. "Erro: The client_id and/or client_secret passed are incorrect"

### Causa:
O Client ID ou o Client Secret configurados no Cloudflare Worker não batem com o GitHub OAuth App, ou foram copiados com espaços em branco.

### Solução:
1. Acesse o seu aplicativo no GitHub: [github.com/settings/developers](https://github.com/settings/developers).
2. Gere um novo secret clicando em **Generate a new client secret** e copie o código.
3. No painel da Cloudflare ([dash.cloudflare.com](https://dash.cloudflare.com/)):
   * Vá em **Workers & Pages > letrese-oauth > Settings > Variables and Secrets**.
   * Atualize `GITHUB_CLIENT_ID` com o Client ID do GitHub.
   * Atualize `GITHUB_CLIENT_SECRET` com o novo Secret gerado.
   * Clique em **Save and Deploy**.

---

## 5. "Um novo pesquisador/bolsista tenta logar no admin e não tem permissão"

### Causa:
O Decap CMS exige que o usuário tenha permissão de escrita no repositório `Letrese/siteletrese` no GitHub para poder salvar postagens.

### Solução:
1. Acesse o repositório no GitHub: [github.com/Letrese/siteletrese](https://github.com/Letrese/siteletrese).
2. Clique na aba **Settings** > no menu lateral clique em **Collaborators**.
3. Clique no botão verde **Add people** e digite o nome de usuário ou e-mail do GitHub da pessoa.
4. O novo integrante receberá um e-mail com o convite. Assim que ele clicar em **Accept invitation**, já conseguirá entrar no `/admin/` normalmente!

---

## 6. "O deploy do GitHub Actions falhou com ícone vermelho ❌"

### Causa:
Geralmente ocorre por erro de formatação em algum arquivo Markdown ou YAML (ex: faltou fechar aspas, quebra de linha errada ou tabulação incorreta no YAML).

### Solução:
1. Acesse [github.com/Letrese/siteletrese/actions](https://github.com/Letrese/siteletrese/actions).
2. Clique na execução que falhou e depois no passo **Compilar Jekyll com GitHub Pages Engine**.
3. O log indicará exatamente qual arquivo e linha causou o erro (ex: `Error: YAML Exception in _members/fulano.md`). Corrija o arquivo e envie novamente.
