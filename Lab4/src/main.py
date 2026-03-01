"""Trading Journal API - Main application module."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import get_settings
from src.core.database import engine, Base
from src.modules.algorithms import router as algorithms_router
from src.modules.journals import router as journals_router
from src.modules.trades import router as trades_router


async def init_database() -> None:
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    await init_database()
    yield
    # Shutdown
    await engine.dispose()


def create_application() -> FastAPI:
    """Application factory."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description="Trading Journal API for tracking trades, algorithms, and journals",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(algorithms_router, prefix="/api/v1")
    app.include_router(journals_router, prefix="/api/v1")
    app.include_router(trades_router, prefix="/api/v1")

    @app.get("/health")
    async def health_check() -> dict:
        """Health check endpoint."""
        return {"status": "ok"}

    @app.get("/")
    async def root() -> dict:
        """Root endpoint."""
        return {
            "message": "Trading Journal API",
            "docs": "/docs",
            "version": "1.0.0",
        }

    return app


app = create_application()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
