# 🛠️ Guia de Manutenção, Arquitetura e Deploy — Portal Letrese

> **TL;DR:**  
> O site é compilado pelo motor estático **Jekyll** dentro do **GitHub Actions** toda vez que há um commit na branch `main`. Não há banco de dados SQL nem servidor pago. O painel administrativo Decap CMS usa o Cloudflare Worker (`letrese-oauth.gakimuro.workers.dev`) apenas para autenticação OAuth gratuita.

---

## 🏗️ 1. Arquitetura da Solução (Jamstack)

```text
[Administrador / Equipe]
         │
         ▼
[Decap CMS (/admin/)] ──(Login OAuth)──► [Cloudflare Worker]
         │                                       │ (Troca de token)
         ▼ (Git Commit automático)               ▼
[Repositório GitHub (main)] ─────────────► [GitHub OAuth API]
         │
         ▼ (Dispara automação)
[GitHub Actions (.github/workflows/deploy.yml)]
         │
         ▼ (Build estático com Jekyll)
[GitHub Pages] ──► [https://letrese.github.io/siteletrese/]
```

---

## 📁 2. Estrutura de Arquivos e Pastas

```text
siteletrese/
├── .github/workflows/deploy.yml # Workflow que compila e publica o site
├── _data/
│   └── group.yml             # Informações institucionais, linhas e contatos
├── _includes/                # Partes reutilizáveis (header, footer, cards)
│   ├── header.html           # Menu de navegação principal
│   ├── footer.html           # Rodapé institucional
│   ├── member_card.html      # Card de membro acadêmico
│   ├── project_card.html     # Card de projeto de pesquisa
│   └── post_card.html        # Card de notícia
├── _layouts/                 # Modelos de página
│   ├── default.html          # Layout base com CSS, fontes e a11y
│   ├── member.html           # Página individual de membro / Lattes
│   ├── project.html          # Página individual de projeto
│   └── post.html             # Página de leitura de notícia
├── _members/                 # Arquivos dos membros (.md)
├── _projects/                # Arquivos dos projetos (.md)
├── _posts/                   # Notícias em formato AAAA-MM-DD-titulo.md
├── admin/
│   ├── index.html            # Interface web do Decap CMS
│   └── config.yml            # Configuração das coleções e campos do CMS
├── assets/
│   ├── css/style.css         # Design system, responsividade e acessibilidade
│   ├── js/main.js            # Filtros dinâmicos e controle do menu
│   └── images/               # Logotipos e avatares
├── auth-proxy/
│   ├── worker.js             # Código do Cloudflare Worker para o login OAuth
│   └── wrangler.toml         # Configuração auxiliar do Worker
├── docs/                     # Manuais e documentações do portal
├── index.html                # Página Inicial
├── sobre.html                # Página Sobre e Linhas de Pesquisa
├── membros.html              # Catálogo com filtros de membros
├── projetos.html             # Portfólio de pesquisas
├── noticias.html             # Mural de publicações
├── contato.html              # Canais de contato institucional
├── 404.html                  # Página de erro amigável
├── _config.yml               # Configuração do Jekyll (URLs, plugins, baseurl)
└── build-local.js            # Compilador local para testes em Node.js
```

---

## 💻 3. Como Rodar o Site Localmente (Ambiente de Testes)

### Opção A: Via Node.js (Mais fácil no Windows)
Não requer instalação do Ruby:
```powershell
# 1. Instalar dependências de build local
npm install

# 2. Compilar e iniciar servidor na porta 3000
npm run dev
```
Acesse `http://localhost:3000/`.

---

### Opção B: Via Jekyll / Ruby (Ambiente Linux / macOS)
```bash
bundle install
bundle exec jekyll serve
```
Acesse `http://localhost:4000/`.

---

## ⚙️ 4. Regras do GitHub Pages e URLs (`_config.yml`)

No arquivo `_config.yml`:
```yaml
url: "https://letrese.github.io"
baseurl: "/siteletrese"
```
* **Importante:** Sempre que criar links internos nos templates HTML/Liquid, use o filtro `relative_url`:
  * Certo: `{{ '/sobre/' | relative_url }}`
  * Errado: `/sobre/` (isso quebraria o caminho no GitHub Pages por faltar o prefixo `/siteletrese`).
* **URLs Amigáveis:** Todas as páginas usam barras finais (`/sobre/`, `/membros/`, `/projetos/`). Evite colocar `.html` nos links.

---

## 🌐 5. Como Usar um Domínio Próprio no Futuro

Se o grupo adquirir um domínio personalizado (ex: `letrese.uf.br` ou `www.letrese.org`):
1. No arquivo `_config.yml`:
   * Altere `url: "https://www.letrese.uf.br"`
   * Altere `baseurl: ""` (deixe as aspas vazias).
2. No GitHub:
   * Acesse **Settings > Pages > Custom domain**.
   * Insira o seu domínio e configure os registros DNS CNAME/A apontando para o GitHub Pages.
3. No Cloudflare Worker:
   * No arquivo `auth-proxy/worker.js`, adicione seu novo domínio na lista de `allowedOrigins`.
4. No GitHub OAuth App:
   * Atualize a **Homepage URL** para o novo domínio.
