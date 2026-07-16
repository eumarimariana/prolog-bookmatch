from pyswip import Prolog
import os

prolog = Prolog()

prolog_path = os.path.join("..", "backend-prolog", "recommender.pl")
prolog.consult(prolog_path)

print("--- TESTE DE INFERÊNCIA PROLOG ---")

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