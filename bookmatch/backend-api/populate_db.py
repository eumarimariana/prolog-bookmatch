import requests
import time

BASE_URL = "http://127.0.0.1:8000"

# Algumas queries de exemplo para buscar na Open Library
QUERIES = ["tolkien", "dune", "harry potter", "george orwell", "agatha christie", "isaac asimov"]

def populate():
    print("Iniciando a carga de livros. O backend deve estar rodando e o Supabase online!")
    
    total_added = 0
    for q in QUERIES:
        print(f"\nBuscando na Open Library por: '{q}'...")
        
        # 1. Faz a busca na API que mapeia Open Library
        search_res = requests.get(f"{BASE_URL}/books/openlibrary/search", params={"q": q})
        if search_res.status_code != 200:
            print(f"Erro ao buscar '{q}': {search_res.status_code}")
            continue
            
        books = search_res.json().get("books", [])
        if not books:
            print(f"Nenhum livro retornado para '{q}'")
            continue
            
        print(f"Encontrados {len(books)} livros. Importando os 2 primeiros (para não sobrecarregar)...")
        
        # 2. Importa os primeiros 2 livros de cada query
        for book in books[:2]:
            payload = {
                "title": book.get("title"),
                "author": book.get("author", "Desconhecido"),
                "cover_url": book.get("cover_url"),
                "genres": book.get("genres", []),
                # Adicionando alguns tropos genéricos (mock) dependendo do título para testar o recommender
                "tropes": ["chosen one", "good vs evil"] if "fantasy" in [g.lower() for g in book.get("genres", [])] else ["plot twist"]
            }
            
            try:
                import_res = requests.post(f"{BASE_URL}/books/import", json=payload)
                if import_res.status_code == 200:
                    print(f"  [OK] '{book.get('title')}' salvo no BD e no Prolog.")
                    total_added += 1
                else:
                    print(f"  [ERRO] Falha ao importar '{book.get('title')}': {import_res.text}")
            except Exception as e:
                print(f"  [ERRO EXCEÇÃO]: {e}")
                
            time.sleep(1) # Intervalo para não dar trigger em limits
            
    print(f"\nFinalizado! {total_added} livros foram adicionados ao Supabase e ao motor Prolog.")

if __name__ == "__main__":
    populate()
