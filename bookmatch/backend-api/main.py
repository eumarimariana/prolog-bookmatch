from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prolog_services import load_rules, sync_supabase_to_prolog
from routers import recommendations

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_rules()
    try:
        sync_supabase_to_prolog()
    except Exception as e:
        print(f"Erro ao sincronizar dados: {e}")
    yield


app = FastAPI(title="BookMatch API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendations.router)

# Para evitar o errp 404 ao acessar direto da raiz
@app.get('/')
async def root():
    return {"status": "ok", "message": "BookMatch API está no ar"}