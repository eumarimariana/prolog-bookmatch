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
