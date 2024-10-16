from contextlib import asynccontextmanager
import warnings
from dotenv import load_dotenv
import json

from fastapi import FastAPI, Request, Response
from langchain_core._api import LangChainBetaWarning
from langserve import add_routes
from fastapi.responses import StreamingResponse

from app.agent import graph as agent_graph

load_dotenv()

warnings.filterwarnings("ignore", category=LangChainBetaWarning)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
        title="PostBot 3000 - Agent Service",
        version="0.0.1",
        lifespan=lifespan
    )

@app.get("/health")
async def health_check():
    return {"status": "ok"}



add_routes(
    app, 
    agent_graph,
    disabled_endpoints=["stream_log", "batch", "config_hashes", "config_schema", "input_schema", "output_schema", "feedback"],
)
