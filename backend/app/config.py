# from pydantic_settings import BaseSettings
# import os

# class Settings(BaseSettings):
#     DATABASE_URL: str = os.getenv("DATABASE_URL")
#     SECRET_KEY: str = "dev-secret-key-change-in-production"
#     ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
#     AI_API_KEY: str = ""
#     AI_MODEL_NAME: str = "gemini-2.0-flash"
#     AI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta"
#     UPLOAD_DIR: str = "uploads"

#     class Config:
#         env_file = ".env"


# settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    AI_API_KEY: str = ""
    AI_MODEL_NAME: str = "gemini-2.0-flash"
    AI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta"
    UPLOAD_DIR: str = "uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
