from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SimpleChef API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://simple-chef-5jzgfhhb4-reese-117s-projects.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to SimpleChef API"}
