# 📝 Manual de Cadastro de Conteúdos — Portal Letrese

> **TL;DR:**  
> Acesse [https://letrese.github.io/siteletrese/admin/](https://letrese.github.io/siteletrese/admin/), clique em **Login with GitHub** e selecione a seção desejada no menu lateral esquerdo (Notícias, Membros, Projetos ou Dados do Grupo). Preencha os campos e clique em **Publish** (Publicar). Em 1 a 2 minutos a alteração estará no ar automaticamente!

---

## 📌 Formas de Cadastrar

Você pode cadastrar e editar conteúdos de duas maneiras:

1. **Pelo Painel Visual (Decap CMS) — RECOMENDADO:** Não exige mexer em código. Basta preencher um formulário no navegador e salvar.
2. **Direto pelo GitHub (via Markdown/YAML):** Para quem prefere editar arquivos `.md` e comitar direto no repositório.

Abaixo está o guia detalhado para **cada seção do site**.

---

## 1. 👥 Seção: Membros e Equipe

### Onde aparece:
Na página **Membros** (`/membros/`), no catálogo com busca e nas páginas individuais de cada pesquisador (`/membros/nome-do-membro/`).

---

### Opção A: Pelo Painel Visual (`/admin/`)
1. No menu lateral esquerdo, clique em **Membros e Equipe**.
2. Para adicionar um novo integrante, clique no botão azul **Novo Membros e Equipe** (ou clique sobre um membro existente para editar).
3. Preencha os campos:
   * **Nome Completo com Titulação:** Exemplo: `Dra. Helena Silva` ou `Me. Lucas Oliveira`.
   * **Nome Simples:** Apenas o primeiro e último nome (ex: `Helena Silva`).
   * **Cargo / Função no Grupo:** Ex: `Líder do Grupo e Coordenadora Geral`, `Pesquisador Associado`, `Bolsista PIBIC/CNPq`.
   * **Categoria:** Escolha uma das opções:
     * `Coordenação`
     * `Pesquisadores`
     * `Doutorandos`
     * `Mestrandos`
     * `Iniciação Científica`
     * `Colaboradores`
   * **Instituição de Origem:** Ex: `Universidade Federal - Departamento de Linguagens`.
   * **Foto do Membro:** Clique em *Escolher imagem* e faça upload de uma foto quadrada (formato `.jpg`, `.png` ou `.svg`).
   * **Link do Currículo Lattes:** URL pública do CNPq (ex: `http://lattes.cnpq.br/0000000000000001`).
   * **ORCID:** Apenas o identificador numérico (ex: `0000-0002-1825-0097`).
   * **E-mail Institucional:** Ex: `helena.silva@letrese.uf.br`.
   * **Ordem de Exibição:** Um número inteiro (ex: `1`, `2`, `3`). Os números menores aparecem primeiro na listagem.
   * **Áreas de Interesse:** Clique em *Adicionar* para inserir palavras-chave de pesquisa (ex: `Multiletramentos`, `Semiótica`, `Inteligência Artificial`).
   * **Biografia e Apresentação (Corpo do texto):** Resumo acadêmico, formação, histórico e projetos associados.
4. Clique em **Publish** (Publicar) no topo da tela.

---

### Opção B: Pelo GitHub (Arquivo Markdown)
Os arquivos ficam na pasta [`_members/`](../_members/). Basta criar um novo arquivo `.md` seguindo o modelo:

```markdown
---
layout: member
title: "Dra. Helena Silva"
name: "Helena Silva"
role: "Líder do Grupo e Coordenadora Geral"
category: "Coordenação"
institution: "Departamento de Linguagens e Educação"
photo: "/assets/images/avatars/avatar-1.svg"
lattes_url: "http://lattes.cnpq.br/0000000000000001"
orcid: "0000-0002-1825-0097"
email: "helena.silva@letrese.uf.br"
order: 1
interests:
  - "Multiletramentos"
  - "Semiótica da Cultura"
---

### Apresentação e Currículo
Texto da biografia acadêmica aqui...
```

---

## 2. 🔬 Seção: Projetos de Pesquisa

### Onde aparece:
Na página inicial (em destaque) e na página **Projetos** (`/projetos/`), com filtros por status e páginas individuais de cada projeto.

---

### Opção A: Pelo Painel Visual (`/admin/`)
1. No menu lateral, clique em **Projetos de Pesquisa**.
2. Clique em **Novo Projetos de Pesquisa** (ou selecione um existente).
3. Preencha os campos:
   * **Título do Projeto:** Nome completo da pesquisa.
   * **Status:** Selecione `Em andamento` ou `Concluído`.
   * **Ano de Início:** Ex: `2024`.
   * **Ano de Término:** Ex: `2026` (se o projeto ainda estiver ativo, deixe em branco ou digite `Atual`).
   * **Coordenação Responsável:** Nome do(a) pesquisador(a) líder do projeto.
   * **Agência de Fomento / Apoio:** Ex: `CNPq (Edital Universal)`, `CAPES`, `FAPESP` ou `Recursos Próprios`.
   * **Equipe Participante:** Adicione o nome dos pesquisadores, mestrandos e bolsistas envolvidos.
   * **Resumo Executivo:** Resumo de 2 a 4 linhas que aparecerá no card da listagem.
   * **Texto Completo do Projeto:** Objetivos, justificativa, metodologia e resultados esperados/alcançados.
4. Clique em **Publish** (Publicar).

---

### Opção B: Pelo GitHub (Arquivo Markdown)
Os arquivos ficam na pasta [`_projects/`](../_projects/). Exemplo de arquivo:

```markdown
---
layout: project
title: "Letramentos Digitais e IA na Educação Básica"
status: "Em andamento"
start_year: 2024
end_year: "Atual"
coordinator: "Dra. Helena Silva"
funding: "CNPq — Edital Universal"
team:
  - "Dra. Helena Silva (Coord.)"
  - "Dr. Carlos Eduardo Moraes"
  - "Mariana Souza (PIBIC)"
summary: "Investigação sobre o impacto das ferramentas de IA nas práticas leitoras..."
---

### Descrição do Projeto
Texto detalhado dos objetivos e metodologia...
```

---

## 3. 📰 Seção: Notícias e Publicações

### Onde aparece:
Na página inicial e no mural de **Notícias** (`/noticias/`), com paginação e suporte a artigos e editais.

---

### Opção A: Pelo Painel Visual (`/admin/`)
1. No menu lateral, clique em **Notícias e Publicações**.
2. Clique em **Novo Notícias e Publicações**.
3. Preencha os campos:
   * **Título da Notícia:** Manchete clara e descritiva.
   * **Data da Publicação:** Selecione no calendário (data de hoje ou data do evento).
   * **Categoria:** Ex: `Publicações`, `Editais`, `Eventos`, `Seminários` ou `Comunicados`.
   * **Autor(a):** Ex: `Coordenação Letrese` ou o nome do autor.
   * **Resumo da Notícia:** Breve parágrafo explicativo para a prévia.
   * **Imagem de Destaque:** (Opcional) Imagem ilustrativa ou banner do evento.
   * **Tags / Palavras-chave:** Adicione tags relevantes (ex: `qualis-a1`, `pibic`, `ia`).
   * **Corpo da Notícia:** Texto completo da matéria com formatação (títulos, negrito, listas e links).
4. Clique em **Publish** (Publicar).

---

### Opção B: Pelo GitHub (Arquivo Markdown)
Os arquivos ficam na pasta [`_posts/`](../_posts/) e devem **obrigatoriamente** seguir o formato de data no nome do arquivo: `AAAA-MM-DD-titulo-da-noticia.md`.

Exemplo: `_posts/2026-03-20-novo-artigo.md`
```markdown
---
layout: post
title: "Publicação de Artigo em Revista Qualis A1"
date: 2026-03-20
category: "Publicações"
author: "Coordenação Letrese"
summary: "Artigo sobre semiótica e tecnologias foi aceito para publicação..."
tags:
  - "qualis-a1"
  - "semiotica"
---

Texto completo da notícia aqui...
```

---

## 4. 🏛️ Seção: Dados Institucionais e Linhas de Pesquisa

### Onde aparece:
Na página inicial (apresentação), na página **Sobre** (`/sobre/`) e no rodapé do site inteiro.

---

### Opção A: Pelo Painel Visual (`/admin/`)
1. No menu lateral, clique em **Descritor e Dados do Grupo**.
2. Clique no item **Descritor Institucional e Identidade**.
3. Aqui você pode alterar:
   * **Sigla / Nome Curto:** Ex: `Letrese`.
   * **Nome Completo:** Ex: `Grupo de Pesquisa em Letramentos, Semiótica, Educação e Tecnologias`.
   * **Apresentação Geral:** Texto institucional sobre a fundação, objetivos e missão do grupo.
   * **Instituição e Departamento:** Nome da universidade e centro vinculado.
   * **Linhas de Pesquisa:**
     * Você pode adicionar novas linhas ou editar as existentes (Nome, Descrição e Coordenador responsável).
   * **Contatos:** E-mail oficial, telefone, endereço da sala física e o link do espelho do grupo no **Diretório dos Grupos de Pesquisa do CNPq**.
4. Clique em **Publish** (Publicar).

---

### Opção B: Pelo GitHub (Arquivo YAML)
Todos esses dados ficam centralizados em um único arquivo: [`_data/group.yml`](../_data/group.yml). Você pode editar esse arquivo com o lápis do GitHub e salvar.

---

## ⏱️ O que acontece após salvar?

1. Ao clicar em **Publish** no Decap CMS, ele realiza um `git commit` automático diretamente no GitHub.
2. O **GitHub Actions** detecta a alteração e reconstrói o site.
3. Em cerca de **1 a 2 minutos**, as informações atualizadas estarão no ar para todo o público no site oficial!
4. *(Dica: Se a alteração não aparecer de imediato no seu computador, aperte `Ctrl + F5` no navegador para atualizar o cache).*
