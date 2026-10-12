# Portal Institucional do Grupo de Pesquisa Letrese

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=flat-square&logo=github)](https://letrese.github.io/siteletrese/)
[![SSG](https://img.shields.io/badge/SSG-Jekyll-red?style=flat-square&logo=jekyll)](https://jekyllrb.com/)
[![CMS](https://img.shields.io/badge/CMS-Decap%20v3.x-teal?style=flat-square)](https://decapcms.org/)
[![License](https://img.shields.io/badge/License-CC%20BY%204.0-green?style=flat-square)](https://creativecommons.org/licenses/by/4.0/)

> **Letrese** — Grupo de Pesquisa em Letramentos, Semiótica, Educação e Tecnologias  
> Portal acadêmico institucional desenvolvido sob o paradigma **Jamstack** (JavaScript, APIs e Markup), composto exclusivamente por artefatos estáticos (HTML, CSS e JavaScript client-side) para publicação no **GitHub Pages** e administração via **Decap CMS**.

---

## 🏛️ Estrutura do Portal

O portal contempla todas as áreas essenciais para um grupo de pesquisa de excelência:

- **Descritor Institucional:** Apresentação do grupo, linhas de pesquisa, missão, visão e certificação no Diretório CNPq.
- **Área de Membros & Currículos:** Vitrine dos integrantes (Coordenação, Pesquisadores, Doutorandos, Mestrandos e Bolsistas PIBIC), com links diretos para o **Currículo Lattes (CNPq)**, **ORCID**, áreas de interesse e biografia acadêmica detalhada. Inclui busca rápida e filtros por categoria.
- **Projetos de Pesquisa:** Painel de projetos em andamento e concluídos, com agências de fomento (CNPq, CAPES, Fundações Estaduais), coordenação responsável, equipe e resumos executivos.
- **Notícias e Publicações:** Divulgação de artigos qualificados, editais de seleção, eventos e seminários científicos.
- **Painel Administrativo Decap CMS:** Interface visual em `/admin/` para publicação e edição contínua sem necessidade de mexer no código.

---

## 🛠️ Pilha Tecnológica (Tech Stack)

| Componente | Tecnologia Adotada | Justificativa |
| :--- | :--- | :--- |
| **Engine SSG** | Jekyll (suporte nativo GitHub Pages) | Compatibilidade 100% nativa com o GitHub Pages e automação via GitHub Actions |
| **Painel Headless CMS** | Decap CMS (v3.x SPA) | Gestor de conteúdo sem servidor que comita diretamente no repositório Git |
| **Hospedagem & CI/CD** | GitHub Pages & GitHub Actions | Infraestrutura estática de alta velocidade, custo zero e alta disponibilidade |
| **Formato dos Dados** | Markdown (`.md`) + YAML Front Matter | Padrão aberto, auditável, versionado pelo Git e de fácil migração |
| **Camada de Autenticação**| GitHub OAuth via Proxy (Cloudflare Worker) | Fluxo seguro de autenticação para login dos administradores |
| **Frontend** | Vanilla CSS e Vanilla JS | Zero dependência de frameworks pesados, performance instantânea |

---

## 📁 Estrutura de Diretórios

```text
siteletrese/
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automação de deploy contínuo no GitHub Pages
├── _data/
│   └── group.yml             # Descritor institucional e dados gerais do grupo
├── _includes/
│   ├── header.html           # Cabeçalho e navegação responsiva
│   ├── footer.html           # Rodapé institucional
│   ├── member_card.html      # Card reutilizável de membro/currículo
│   ├── project_card.html     # Card reutilizável de projeto
│   └── post_card.html        # Card de notícia
├── _layouts/
│   ├── default.html          # Layout base com CSS e Google Fonts
│   ├── page.html             # Layout para páginas estáticas
│   ├── member.html           # Layout individual de perfil acadêmico / Lattes
│   ├── project.html          # Layout de projeto de pesquisa detalhado
│   └── post.html             # Layout de leitura de notícias
├── _members/                 # Arquivos Markdown com o currículo dos participantes
├── _projects/                # Arquivos Markdown com os projetos de pesquisa
├── _posts/                   # Arquivos Markdown com notícias e comunicados
├── admin/
│   ├── index.html            # SPA do Decap CMS v3.x
│   └── config.yml            # Configuração das coleções do CMS
├── assets/
│   ├── css/style.css         # Design system institucional moderno
│   ├── js/main.js            # Filtros dinâmicos e controle do menu
│   └── images/               # Logotipo em SVG e avatares placeholder
├── auth-proxy/
│   ├── worker.js             # Código do Cloudflare Worker para o proxy OAuth
│   └── wrangler.toml         # Configuração de deploy do Cloudflare Worker
├── docs/
│   └── GUIA_ADMIN_E_OAUTH.md # Manual passo a passo do CMS e do Proxy OAuth
├── index.html                # Página inicial com destaques e descritor
├── sobre.html                # Descritor institucional completo e linhas
├── membros.html              # Catálogo com filtros de membros e currículos
├── projetos.html             # Portfólio de pesquisas com filtros por status
├── noticias.html             # Mural de publicações e notícias
├── contato.html              # Canais de contato e localização institucional
├── 404.html                  # Página de erro customizada
├── _config.yml               # Configurações do Jekyll e GitHub Pages
├── Gemfile                   # Dependências do ecossistema Ruby/Jekyll
└── package.json              # Scripts Node.js para preview local ágil
```

---

## 🚀 Como Executar Localmente

### Opção 1: Via Node.js (Recomendado para Windows sem Ruby)

O projeto possui um compilador e servidor estático integrado em Node.js (`build-local.js`), dispensando a instalação do Ruby:

```powershell
# 1. Instalar as dependências de preview local
npm install

# 2. Compilar o site e iniciar o servidor local na porta 3000
npm run dev
```

Abra seu navegador em: `http://localhost:3000/`.

---

### Opção 2: Via Jekyll / Bundler (Ambiente Linux ou Ruby)

```bash
# 1. Instalar gems
bundle install

# 2. Iniciar servidor Jekyll
bundle exec jekyll serve
```

Abra seu navegador em: `http://localhost:4000/`.

---

## ✍️ Gerenciando Conteúdo com o Decap CMS

O portal conta com o **Decap CMS v3.x** disponível na rota `/admin/`.

### Modo de Teste Local (Sem precisar configurar OAuth)
1. No arquivo `admin/config.yml`, descomente a linha:
   ```yaml
   local_backend: true
   ```
2. No terminal, execute:
   ```powershell
   npm run cms:dev
   ```
3. Acesse `http://localhost:3000/admin/`. Você poderá criar, editar e excluir membros, projetos e notícias diretamente nos seus arquivos locais sem autenticação de rede.

### Modo Produção (GitHub OAuth no GitHub Pages)
Para autenticar na nuvem com contas do GitHub autorizadas no repositório:
Consulte o guia completo em [docs/GUIA_ADMIN_E_OAUTH.md](docs/GUIA_ADMIN_E_OAUTH.md). Fornecemos o script pronto do **Cloudflare Worker** em `auth-proxy/worker.js` (gratuito e sem servidor).

---

## 🌐 Publicação no GitHub Pages

O projeto já inclui o workflow oficial em `.github/workflows/deploy.yml`.

Para publicar:
1. Acesse o repositório no GitHub: **Settings > Pages**.
2. Em **Source**, selecione: **GitHub Actions**.
3. Faça commit e envie para a branch `main`:
   ```powershell
   git add .
   git commit -m "feat: base institucional Jamstack do portal Letrese"
   git push origin main
   ```
4. O GitHub Actions executará o build automaticamente e o site estará online no endereço do GitHub Pages do repositório!
