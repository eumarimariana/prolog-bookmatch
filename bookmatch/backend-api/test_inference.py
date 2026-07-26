from pyswip import Prolog
from pathlib import Path

prolog = Prolog()

BASE = Path(__file__).resolve().parent

prolog_path = BASE.parent / "backend-prolog" / "recommender.pl"
prolog.consult(str(prolog_path))

# FATOS DE TESTE
# O recommender.pl não traz mais dados de exemplo (agora vêm só do Supabase
# em produção). Para testar a lógica isoladamente, sem precisar do Supabase,
# inserimos aqui um punhado de fatos temporários, só para esta execução.
print("Carregando dados de teste temporários...")

test_books = [
    ('1', 'Percy Jackson e o Ladrao de Raios'),
    ('2', 'Jogos Vorazes'),
    ('3', 'Maze Runner'),
    ('4', 'A Forma da Agua'),
]

test_genres = [
    ('1', 'fantasia'),
    ('2', 'distopia'),
    ('3', 'distopia'),
    ('4', 'romance'),
]

test_tropes = [
    ('1', 'mitologia'),
    ('2', 'sobrevivencia'),
    ('3', 'sobrevivencia'),
    ('4', 'monster_romance'),
    ('4', 'friends_to_lovers'),
]

for book_id, title in test_books:
    prolog.assertz(f"book('{book_id}', '{title}')")

for book_id, genre in test_genres:
    prolog.assertz(f"has_genre('{book_id}', '{genre}')")

for book_id, trope in test_tropes:
    prolog.assertz(f"has_trope('{book_id}', '{trope}')")

print(f"{len(test_books)} livros de teste carregados.")

print("\n--- TESTE DE INFERÊNCIA PROLOG ---")

# Teste A: O que ler se eu gosto de distopia?
print("\n1. Buscando recomendações de 'distopia':")
for result in prolog.query("recommend_by_genre('distopia', Title)"):
    print(f" -> {result['Title']}")

# Teste B: Cruzamento de tropos lógicos
print("\n2. Buscando livro que seja 'monster_romance' E 'friends_to_lovers':")
for result in prolog.query("recommend_by_combined_tropes('monster_romance', 'friends_to_lovers', Title)"):
    print(f" -> {result['Title']}")

# Teste C: Lógica de similaridade
print("\n3. O usuário leu 'Jogos Vorazes'. O que é similar?")
for result in prolog.query("recommend_similar('Jogos Vorazes', Title)"):
    print(f" -> {result['Title']}")

# Teste D: Gênero sem nenhum livro cadastrado (deve retornar vazio, não erro)
print("\n4. Buscando recomendações de gênero inexistente ('terror'):")
results_terror = list(prolog.query("recommend_by_genre('terror', Title)"))
if not results_terror:
    print(" -> []")
for result in results_terror:
    print(f" -> {result['Title']}")