# BookMatch Frontend (React + Vite)

Este é o frontend da aplicação BookMatch, construído com **React**, **Vite** e **TypeScript**, e focado numa estética vibrante e minimalista.

## Arquitetura e Funcionalidades

O projeto possui as seguintes páginas principais, todas conectadas à API e ao Supabase:

- **Home (`/`)**: Carrega dinamicamente o catálogo com as estantes temáticas e exibe o sistema avançado de scoring/similaridade.
- **Search (`/search`)**: Uma página dupla que serve para:
  - **Pesquisa Global:** Busca livros reais na [Open Library API](https://openlibrary.org/) e permite injetá-los no nosso banco de dados.
  - **Recomendações Inteligentes:** Pesquisa na base de dados utilizando o Motor Lógico em Prolog do nosso backend, suportando filtros manuais de Gênero e Trope, e devolvendo resultados em mini-cards estruturados.
- **Library (`/library`)**: Um hub persistente sincronizado com a tabela `user_library` no Supabase que exibe livros favoritados através do perfil do usuário.
- **Chat da IA (`AIChat`)**: Presente nativamente em todas as páginas via *Sidebar*. Ele traduz linguagem natural para as regras do Prolog, usa heurísticas para extrair intenção, apresenta chips flutuantes com sugestões de conversa ("Quick Prompts") dinâmicos e cards elegantes em vez de puro texto.

## Integração com o Backend

Todas as requisições se conectam com o nosso backend (`http://localhost:8000`) utilizando o módulo unificado `api.ts`.
Temos Fetchers para:
- Busca por OpenLibrary
- Sincronização e Favoritação de Livros no Supabase (bypassando a API quando seguro ou utilizando-a quando regras do Prolog precisam ser trigadas).
- Tradução NLP do bot.

## Como Rodar

1. Certifique-se de que tem o Node instalado.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse em `http://localhost:5173`.
