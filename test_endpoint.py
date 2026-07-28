import requests

url = "http://localhost:8000/profiles/user_profiles"
data = {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Leitor Teste",
    "liked_genres": ["fantasia"],
    "liked_tropes": ["magia"],
    "read_books": ["00000000-0000-0000-0000-000000000001"]
}
try:
    r = requests.post(url, json=data)
    print("POST status:", r.status_code)
    print("POST response:", r.json())
    
    r2 = requests.get(f"{url}/11111111-1111-1111-1111-111111111111")
    print("GET status:", r2.status_code)
    print("GET response:", r2.json())
except Exception as e:
    print("Error:", e)
