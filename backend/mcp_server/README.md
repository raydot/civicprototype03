# VoterPrime MCP Server

Model Context Protocol server providing read-only access to VoterPrime system data.

## Features

- **Read-Only Access**: No write operations, safe for production use
- **Category Data**: Access to all 32 political categories with performance metrics
- **Cost Tracking**: OpenAI API usage and cost monitoring
- **System Health**: Database connectivity and system status checks
- **Query Tools**: Flexible filtering and search capabilities

## Installation

1. **Add MCP dependency to environment.yml:**

```yaml
dependencies:
  - pip:
    - mcp>=0.1.0
```

2. **Update conda environment:**

```bash
cd backend
conda env update -f environment.yml
```

3. **Set up environment variables:**

```bash
cp mcp_server/.env.example mcp_server/.env
# Edit .env with your DATABASE_URL
```

## Configuration

### Windsurf MCP Settings

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "voterprime": {
      "command": "conda",
      "args": [
        "run",
        "-n",
        "ai-recommendation-service",
        "python",
        "-m",
        "mcp_server.server"
      ],
      "cwd": "/Users/davekanter/Documents/Clients/shazseitz/voterPrime03/backend",
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `LOG_LEVEL` - Logging level (default: INFO)

## Available Resources

### Category Resources

- `voterprime://categories/all` - All 32 political categories
- `voterprime://categories/performance` - Performance metrics
- `voterprime://categories/underperforming` - Categories with <30% success rate
- `voterprime://categories/{id}` - Individual category details

### Cost Resources

- `voterprime://costs/today` - Today's OpenAI costs
- `voterprime://costs/week` - 7-day cost summary
- `voterprime://costs/by-model` - Costs grouped by model

### Health Resources

- `voterprime://health/status` - System health status

## Available Tools

### query_categories

Search categories with filters:

```python
{
  "keyword": "healthcare",
  "type": "issue",
  "min_success_rate": 0.5
}
```

### query_costs

Query costs with date range:

```python
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "group_by": "endpoint"  # or "day", "model"
}
```

### check_database_health

Run database connectivity tests (no parameters).

## Usage Examples

### Via Windsurf

Once configured, you can query the MCP server directly in Windsurf:

```
"What are today's OpenAI costs?"
→ Queries voterprime://costs/today

"Show me underperforming categories"
→ Queries voterprime://categories/underperforming

"What's the system health status?"
→ Queries voterprime://health/status
```

### Direct Testing

```bash
# Start MCP server
cd backend
conda activate ai-recommendation-service
python -m mcp_server.server

# Server runs on stdio, use MCP inspector for testing
```

## Security

- **Read-Only**: No write operations supported
- **Environment-Based**: All credentials from environment variables
- **No Secrets in Code**: Database URL never hardcoded
- **Local Only**: Runs locally, no network exposure

## Architecture

```
mcp_server/
├── __init__.py
├── server.py              # Main MCP server
├── config.py              # Configuration
├── resources/
│   ├── __init__.py
│   ├── categories.py      # Category resources
│   ├── costs.py           # Cost resources
│   └── health.py          # Health resources
├── .env.example           # Environment template
└── README.md              # This file
```

## Troubleshooting

### "Database not available" error

Check that `DATABASE_URL` is set:

```bash
echo $DATABASE_URL
```

If empty, set it in your environment or `.env` file.

### MCP server not starting

1. Verify conda environment is activated
2. Check that `mcp` package is installed: `pip list | grep mcp`
3. Check logs for error messages

### No data returned

1. Verify database connection with health check
2. Check that categories are loaded in database
3. Verify you're using correct resource URIs

## Development

### Adding New Resources

1. Create handler in `resources/` directory
2. Register in `server.py` `list_resources()` method
3. Add routing in `read_resource()` method
4. Update README with new resource documentation

### Adding New Tools

1. Implement tool method in appropriate resource handler
2. Register in `server.py` `list_tools()` method
3. Add routing in `call_tool()` method
4. Update README with tool documentation

## Limitations

- **Read-Only**: Cannot modify data
- **Local Only**: Not designed for remote access
- **Database Required**: Most features require DATABASE_URL
- **No Caching**: Currently queries database on every request (future: add caching)

## Future Enhancements

- [ ] Add caching layer for frequently accessed data
- [ ] Add feedback resource handlers
- [ ] Add configuration resource (sanitized)
- [ ] Add database schema introspection
- [ ] Performance metrics and query optimization
- [ ] Support for multiple database connections

## Support

For issues or questions:
1. Check `.windsurf/ENV_SETUP.md` for environment setup
2. Review logs for error messages
3. Verify database connectivity
4. Check Windsurf MCP configuration
