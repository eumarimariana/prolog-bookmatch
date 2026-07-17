# BookMatch Prolog (backend-prolog)

Base de conhecimento em Prolog usada pela API (`backend-api/`) para gerar recomendações de livros.

## Arquivo principal

`recommender.pl`

### Fatos

- `book(ID, Title)`: identifica um livro
- `has_genre(ID, Genre)`: associa um livro a um gênero
- `has_trope(ID, Trope)`: associa um livro a um tropo

Todos os fatos são declarados como `dynamic`: os que estão escritos neste arquivo servem apenas como **dados de teste**. Em produção, a API apaga esses fatos (`retractall`) e recria a partir dos dados reais vindos do Supabase ao iniciar (`sync_supabase_to_prolog` em `main.py`).

### Regras de inferência

- `recommend_by_genre(Genre, Title)` recomenda livros de um gênero
- `recommend_by_combined_tropes(Trope1, Trope2, Title)` recomenda livros que tenham os dois tropos ao mesmo tempo
- `recommend_similar(ReadTitle, RecommendedTitle)` recomenda livros do mesmo gênero de um livro já lido, excluindo o próprio

## Testando isoladamente

Sem precisar da API ou do Supabase, dá pra rodar as consultas direto no SWI-Prolog:

```bash
swipl
?- consult('recommender.pl').
?- recommend_by_genre('distopia', Title).
```

Ou via o script Python de teste em `backend-api/test_inference.py`.

## Adicionando novas regras

Ao criar uma nova regra de recomendação aqui, lembre de expor um endpoint correspondente em `backend-api/main.py` para que o frontend consiga consumi-la.
