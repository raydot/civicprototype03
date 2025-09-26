"""
FastAPI dependencies for dependency injection
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from .config import settings
from .utils.logging import structured_logger


async def get_settings():
    """Dependency to get application settings"""
    return settings


async def get_logger():
    """Dependency to get structured logger"""
    return structured_logger


# TODO: Add database dependency when database is set up
# async def get_database() -> Generator:
#     """Dependency to get database session"""
#     pass


# TODO: Add AI model dependencies when models are implemented
# async def get_text_encoder():
#     """Dependency to get text encoder model"""
#     pass


# TODO: Add authentication dependency if needed
# async def get_current_user():
#     """Dependency to get current authenticated user"""
#     pass
