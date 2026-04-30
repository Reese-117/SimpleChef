from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router

app = FastAPI(title="SimpleChef API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://simple-chef.vercel.app",
        "http://localhost:5173"
    ],
    allow_origin_regex="https://simple-chef-.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to SimpleChef API"}
