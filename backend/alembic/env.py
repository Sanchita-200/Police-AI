import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool, create_engine
from alembic import context

# 1. Add application root path to sys.path to enable app package imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import Base
from app.models.fir import FIRModel
from app.core.config import settings

# 2. Setup logging config
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 3. Setup metadata target
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    db_url = settings.database_url
    
    # Connection fallback check
    try:
        if "postgresql" in db_url or "postgres" in db_url:
            test_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
            with test_engine.connect() as conn:
                pass
        url = db_url
    except Exception:
        url = "sqlite:///./police_fir_db.db"

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    db_url = settings.database_url
    engine_args = {}
    
    # Resilient connection check
    try:
        if "postgresql" in db_url or "postgres" in db_url:
            test_engine = create_engine(
                db_url, 
                pool_pre_ping=True, 
                connect_args={"connect_timeout": 2}
            )
            with test_engine.connect() as conn:
                pass
            connectable = test_engine
        else:
            connectable = create_engine(db_url, pool_pre_ping=True)
    except Exception:
        db_url = "sqlite:///./police_fir_db.db"
        engine_args = {"connect_args": {"check_same_thread": False}}
        connectable = create_engine(db_url, **engine_args)

    with connectable.connect() as connection:
        # render_as_batch=True is required for SQLite ALTER TABLE migrations support
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            render_as_batch=True
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
