"""
VoterPrime MCP Server
Main entry point for Model Context Protocol server
"""
import asyncio
import logging
from typing import Any, Dict, List

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Resource, Tool, TextContent

from .config import config
from .resources.categories import CategoryResources
from .resources.costs import CostResources
from .resources.health import HealthResources

# Set up logging
logging.basicConfig(
    level=getattr(logging, config.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class VoterPrimeMCPServer:
    """VoterPrime MCP Server implementation"""
    
    def __init__(self):
        self.server = Server("voterprime-mcp")
        self.category_resources = CategoryResources()
        self.cost_resources = CostResources()
        self.health_resources = HealthResources()
        
        # Register handlers
        self._register_handlers()
        
        logger.info(f"VoterPrime MCP Server v{config.version} initialized")
        logger.info(f"Read-only mode: {not config.enable_write_operations}")
    
    def _register_handlers(self):
        """Register MCP protocol handlers"""
        
        @self.server.list_resources()
        async def list_resources() -> List[Resource]:
            """List all available resources"""
            resources = []
            
            # Category resources
            resources.extend([
                Resource(
                    uri="voterprime://categories/all",
                    name="All Political Categories",
                    description="All 32 political categories with metadata",
                    mimeType="application/json"
                ),
                Resource(
                    uri="voterprime://categories/performance",
                    name="Category Performance Metrics",
                    description="Real-time success rates and usage counts",
                    mimeType="application/json"
                ),
                Resource(
                    uri="voterprime://categories/underperforming",
                    name="Underperforming Categories",
                    description="Categories with <30% success rate",
                    mimeType="application/json"
                ),
            ])
            
            # Cost resources
            resources.extend([
                Resource(
                    uri="voterprime://costs/today",
                    name="Today's OpenAI Costs",
                    description="Today's OpenAI spending breakdown",
                    mimeType="application/json"
                ),
                Resource(
                    uri="voterprime://costs/week",
                    name="Weekly Cost Summary",
                    description="7-day cost summary by endpoint",
                    mimeType="application/json"
                ),
            ])
            
            # Health resources
            resources.extend([
                Resource(
                    uri="voterprime://health/status",
                    name="System Health Status",
                    description="Database connectivity, API health, uptime",
                    mimeType="application/json"
                ),
            ])
            
            return resources
        
        @self.server.read_resource()
        async def read_resource(uri: str) -> str:
            """Read a specific resource"""
            logger.info(f"Reading resource: {uri}")
            
            try:
                # Route to appropriate handler
                if uri.startswith("voterprime://categories/"):
                    return await self.category_resources.handle(uri)
                elif uri.startswith("voterprime://costs/"):
                    return await self.cost_resources.handle(uri)
                elif uri.startswith("voterprime://health/"):
                    return await self.health_resources.handle(uri)
                else:
                    return f"Unknown resource: {uri}"
            
            except Exception as e:
                logger.error(f"Error reading resource {uri}: {str(e)}")
                return f"Error: {str(e)}"
        
        @self.server.list_tools()
        async def list_tools() -> List[Tool]:
            """List available tools"""
            tools = []
            
            # Only provide read-only query tools
            tools.extend([
                Tool(
                    name="query_categories",
                    description="Search categories by keyword, type, or performance",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "keyword": {"type": "string", "description": "Keyword to search for"},
                            "type": {"type": "string", "description": "Category type filter"},
                            "min_success_rate": {"type": "number", "description": "Minimum success rate"}
                        }
                    }
                ),
                Tool(
                    name="query_costs",
                    description="Query OpenAI costs with flexible filters",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "start_date": {"type": "string", "description": "Start date (YYYY-MM-DD)"},
                            "end_date": {"type": "string", "description": "End date (YYYY-MM-DD)"},
                            "group_by": {"type": "string", "description": "Group by: day, model, endpoint"}
                        }
                    }
                ),
                Tool(
                    name="check_database_health",
                    description="Run database connectivity tests",
                    inputSchema={"type": "object", "properties": {}}
                ),
            ])
            
            return tools
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
            """Execute a tool"""
            logger.info(f"Calling tool: {name} with args: {arguments}")
            
            try:
                if name == "query_categories":
                    result = await self.category_resources.query_categories(**arguments)
                elif name == "query_costs":
                    result = await self.cost_resources.query_costs(**arguments)
                elif name == "check_database_health":
                    result = await self.health_resources.check_database()
                else:
                    result = {"error": f"Unknown tool: {name}"}
                
                return [TextContent(type="text", text=str(result))]
            
            except Exception as e:
                logger.error(f"Error calling tool {name}: {str(e)}")
                return [TextContent(type="text", text=f"Error: {str(e)}")]
    
    async def run(self):
        """Run the MCP server"""
        logger.info("Starting VoterPrime MCP Server...")
        
        # Validate configuration
        if not config.validate():
            logger.warning("Configuration validation failed - some features may not work")
        
        # Run server with stdio transport
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                self.server.create_initialization_options()
            )


async def main():
    """Main entry point"""
    server = VoterPrimeMCPServer()
    await server.run()


if __name__ == "__main__":
    asyncio.run(main())
