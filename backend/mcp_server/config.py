"""
MCP Server Configuration
"""
import os
from typing import Optional


class MCPServerConfig:
    """Configuration for VoterPrime MCP Server"""
    
    # Server identification
    server_name: str = "voterprime-mcp"
    version: str = "0.1.0"
    
    # Database connection (from environment)
    database_url: Optional[str] = os.getenv("DATABASE_URL")
    
    # Security settings
    enable_write_operations: bool = False  # Read-only by default
    sanitize_secrets: bool = True  # Redact sensitive data in responses
    
    # Performance settings
    cache_ttl_seconds: int = 60  # Cache resource data for 60 seconds
    max_query_results: int = 1000  # Limit query results
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def validate(cls) -> bool:
        """Validate configuration"""
        if not cls.database_url:
            print("⚠️  DATABASE_URL not set - MCP server will have limited functionality")
            return False
        return True


# Global config instance
config = MCPServerConfig()
