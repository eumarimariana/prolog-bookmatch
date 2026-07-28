# BookMatch API (backend-api)

API em FastAPI que expõe as recomendações lógicas do Prolog (`backend-prolog/recommender.pl`) via HTTP, sincronizando os dados com o Supabase.

## Pré-requisitos

- Python 3.10+
- [SWI-Prolog](https://www.swi-prolog.org/download/stable) instalado no sistema
- Uma conta/projeto no Supabase com a tabela `books`

## Estrutura esperada

Este projeto assume a seguinte estrutura de pastas (o caminho para o `.pl` é relativo):

```
bookmatch/
├── backend-api/       <- você está aqui
└── backend-prolog/
    └── recommender.pl
```

**Importante:** o servidor precisa ser iniciado de dentro da pasta `backend-api/`, senão o carregamento do `recommender.pl` falha.

## Setup

1. Criar e ativar um ambiente virtual:

```bash
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux
```

2. Instalar as dependências:

```bash
pip install -r requirements.txt
```

3. Criar um arquivo `.env` na raiz de `backend-api/` com as credenciais do Supabase:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-aqui
```

> O `.env` não deve ser commitado (já está no `.gitignore`). Peça as credenciais para quem administra o projeto no Supabase.

## Rodando o servidor

```bash
uvicorn main:app --reload
```

A API sobe em `http://localhost:8000`. Documentação interativa (Swagger) disponível em `http://localhost:8000/docs`.

Ao subir, o servidor:
1. Carrega as regras lógicas estáticas do `recommender.pl`
2. Sincroniza os fatos dinâmicos (livros, gêneros, tropos) a partir da tabela `books` do Supabase

Se a sincronização falhar (ex: tabela vazia ou credenciais erradas), o erro é logado no terminal, mas a API continua no ar.

## Endpoints

### `POST /recommend/genre`
Recomenda livros baseando-se estritamente num gênero lógico.

```json
{ "genre": "distopia" }
```

### `POST /recommend/score`
Calcula uma pontuação de similaridade (Scoring) entre um livro de referência e o restante da base de dados, retornando o livro que mais se aproxima através do cruzamento de pesos (Gênero=10, Trope=5).

```json
{
  "reference_title": "O Senhor dos Anéis"
}
```

### `POST /recommend/user_profile`
Utiliza Filtragem Baseada em Conteúdo. Injeta dinamicamente os gostos e aversões do usuário no motor lógico em tempo de execução, para recomendar um livro que seja a "cara" do usuário, ignorando livros que ele já leu e tropos que não gosta.

```json
{
  "user_id": "usr_123",
  "liked_genres": ["fantasy", "sci-fi"],
  "liked_tropes": ["found family", "chosen one"],
  "disliked_tropes": ["love triangle"],
  "read_books": ["book_id_1"]
}
```

### `POST /recommend/explain`
Retorna a recomendação acoplada ao motivo escrito pelo motor lógico (Explainable AI - XAI).

```json
{
  "genre": "fantasy",
  "trope": "enemies to lovers"
}
```
### `POST /recommend/advanced`
Cruza múltiplos critérios (temas, humores e prompt textual) injetando heurísticas dinâmicas no Prolog para achar títulos mais específicos.

```json
{
  "prompt": "Quero um livro tenso e misterioso",
  "moods": ["tenso"],
  "themes": ["mistério"],
  "genre": "suspense"
}
```

### `GET /profiles/user_profiles/{user_id}`
Busca o perfil do leitor na tabela `user_profiles` e cruza com a tabela `user_library` para retornar a lista consolidada de livros favoritados.

### `POST /profiles/user_profiles`
Salva as preferências (nome, gêneros, tropos) do usuário na tabela `user_profiles`.

### `POST /profiles/user_library`
Insere a relação de um livro favoritado na tabela `user_library` associando `user_id` e `book_id`.

### `GET /books/openlibrary/search?q=Harry+Potter`
Busca livros ao vivo na [Open Library API](https://openlibrary.org/developers/api). A busca retorna dados padronizados com as respectivas `cover_url` (capas reais), respeitando as diretrizes de rate-limiting.

### `POST /books/import`
Recebe o DTO de um livro, salva na base de dados (Supabase) e injeta **dinamicamente no SWI-Prolog em tempo de execução** (`prolog.assertz`). 

```json
{
  "title": "Harry Potter",
  "author": "J.K. Rowling",
  "cover_url": "https://covers.openlibrary.org/b/id/10521270-L.jpg",
  "genres": ["fantasia"]
}
```

### Integração Open Library (Legalidade & Caching)
O serviço (`open_library_service.py`) utiliza os endpoints abertos da Open Library de forma responsável (sem necessidade de API Key). Capas são puxadas por ID e ISBN, em conformidade com as regras de uso não comercial da Open Library.

## Testando a lógica Prolog isoladamente

Sem precisar subir a API ou configurar o Supabase, dá pra testar as regras direto:

```bash
python test_inference.py
```
