# VoterPrime Backend Test Suite

Professional pytest-based test suite for the VoterPrime AI recommendation backend.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Markers](#test-markers)
- [Coverage Reports](#coverage-reports)
- [Writing Tests](#writing-tests)
- [Fixtures](#fixtures)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

1. **Activate conda environment:**
   ```bash
   conda activate ai-recommendation-service
   ```

2. **Ensure database is running:**
   - Check your `.env` file has `DATABASE_URL` configured
   - Database is required for integration tests

### Run All Tests

```bash
pytest tests/ -v
```

---

## 📁 Test Structure

```
tests/
├── README.md                          # This file
├── __init__.py                        # Package marker
├── conftest.py                        # Shared fixtures and configuration
├── test_health.py                     # Health check endpoint tests
└── test_database_operations.py        # Phase 1: Database operations tests
```

### Test Organization

Tests are organized into classes by functionality:

- **`TestDatabaseOperations`** - Core database parameter tests
- **`TestFeedbackServices`** - Integration tests for service classes
- **`TestGracefulDegradation`** - Tests for database failure handling

---

## 🧪 Running Tests

### Run All Tests

```bash
pytest tests/ -v
```

### Run Specific Test File

```bash
pytest tests/test_database_operations.py -v
```

### Run Specific Test Class

```bash
# Just database operations
pytest tests/test_database_operations.py::TestDatabaseOperations -v

# Just service integration tests
pytest tests/test_database_operations.py::TestFeedbackServices -v

# Just graceful degradation tests
pytest tests/test_database_operations.py::TestGracefulDegradation -v
```

### Run Specific Test Method

```bash
pytest tests/test_database_operations.py::TestDatabaseOperations::test_session_creation -v
```

### Run by Marker

```bash
# Only database tests
pytest -m database -v

# Only integration tests
pytest -m integration -v

# Only unit tests
pytest -m unit -v

# Only async tests
pytest -m asyncio -v
```

### Run with Different Verbosity

```bash
# Quiet mode (only show failures)
pytest tests/ -q

# Verbose mode (show all test names)
pytest tests/ -v

# Very verbose (show full test output)
pytest tests/ -vv
```

### Stop at First Failure

```bash
pytest tests/ -x
```

### Run Last Failed Tests

```bash
pytest tests/ --lf
```

### Run Failed Tests First

```bash
pytest tests/ --ff
```

---

## 🏷️ Test Markers

Tests are organized using pytest markers. You can filter tests by marker:

### Available Markers

| Marker | Description | Example |
|--------|-------------|---------|
| `@pytest.mark.unit` | Fast, isolated unit tests | `pytest -m unit` |
| `@pytest.mark.integration` | Tests requiring database | `pytest -m integration` |
| `@pytest.mark.database` | Tests that use database | `pytest -m database` |
| `@pytest.mark.asyncio` | Async tests | `pytest -m asyncio` |
| `@pytest.mark.slow` | Slow running tests | `pytest -m "not slow"` |

### Combining Markers

```bash
# Run database tests that are NOT slow
pytest -m "database and not slow" -v

# Run integration OR unit tests
pytest -m "integration or unit" -v
```

---

## 📊 Coverage Reports

### Run Tests with Coverage

```bash
pytest tests/ --cov=app --cov-report=term-missing
```

### Generate HTML Coverage Report

```bash
pytest tests/ --cov=app --cov-report=html
```

Then open `htmlcov/index.html` in your browser.

### Coverage Options

```bash
# Show branch coverage
pytest tests/ --cov=app --cov-branch

# Only show files with missing coverage
pytest tests/ --cov=app --cov-report=term-missing

# Generate multiple report formats
pytest tests/ --cov=app --cov-report=term --cov-report=html --cov-report=xml
```

### Coverage Configuration

Coverage settings are in `pytest.ini`:
- Source: `app/` directory
- Omits: test files, cache, virtual environments
- Shows: missing lines, branch coverage

---

## ✍️ Writing Tests

### Test File Naming

- Test files must start with `test_` or end with `_test.py`
- Example: `test_database_operations.py`, `test_category_matching.py`

### Test Function Naming

- Test functions must start with `test_`
- Use descriptive names: `test_session_creation_with_valid_data`

### Test Class Naming

- Test classes must start with `Test`
- Example: `TestDatabaseOperations`, `TestUserSession`

### Example Test Structure

```python
import pytest
from app.services.feedback_service import UserSession

@pytest.mark.asyncio
@pytest.mark.integration
class TestUserSession:
    """Test suite for UserSession service"""
    
    async def test_session_creation(self, db_connection, mock_request):
        """Test creating a new user session"""
        user_session = UserSession(mock_request)
        session_id = await user_session.create_or_update_session()
        
        assert session_id is not None
        assert len(session_id) > 0
```

### Async Tests

For async functions, use `@pytest.mark.asyncio`:

```python
@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result is not None
```

---

## 🔧 Fixtures

Fixtures provide reusable test data and setup. Available fixtures are defined in `conftest.py`.

### Available Fixtures

#### Application Fixtures

- **`client`** - FastAPI TestClient for API testing
- **`test_settings`** - Test configuration settings

#### Database Fixtures

- **`db_connection`** - Database connection (auto connect/disconnect)
- **`mock_request`** - Mock FastAPI Request object

#### Test Data Fixtures

- **`test_session_data`** - Sample session data
- **`test_interaction_data`** - Sample interaction data
- **`test_feedback_data`** - Sample feedback data
- **`sample_user_inputs`** - Sample user input strings
- **`sample_categories`** - Sample category data

### Using Fixtures

```python
def test_with_fixture(client, test_session_data):
    """Fixtures are passed as function arguments"""
    response = client.post("/api/endpoint", json=test_session_data)
    assert response.status_code == 200
```

### Creating Custom Fixtures

Add to `conftest.py`:

```python
@pytest.fixture
def my_custom_fixture():
    """Description of fixture"""
    return {"key": "value"}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. `pytest: command not found`

**Problem:** Conda environment not activated

**Solution:**
```bash
conda activate ai-recommendation-service
```

#### 2. Database Connection Errors

**Problem:** DATABASE_URL not configured or database not running

**Solution:**
- Check `.env` file has `DATABASE_URL`
- Verify database is running
- Tests marked with `@pytest.mark.database` will be skipped if database unavailable

#### 3. Import Errors

**Problem:** Module not found

**Solution:**
```bash
# Run from backend directory
cd /path/to/voterPrime03/backend
pytest tests/
```

#### 4. Async Test Failures

**Problem:** `RuntimeError: Event loop is closed`

**Solution:** Ensure test is marked with `@pytest.mark.asyncio`

```python
@pytest.mark.asyncio
async def test_async_function():
    ...
```

#### 5. Coverage Not Working

**Problem:** Coverage report shows 0%

**Solution:**
```bash
# Ensure pytest-cov is installed
conda list | grep pytest-cov

# Run with explicit coverage
pytest tests/ --cov=app --cov-report=term
```

### Debug Mode

Run tests with print statements visible:

```bash
pytest tests/ -s
```

Show local variables on failure:

```bash
pytest tests/ -l
```

Full traceback:

```bash
pytest tests/ --tb=long
```

---

## 📈 Test Results Interpretation

### Passing Tests

```
tests/test_database_operations.py::TestDatabaseOperations::test_session_creation PASSED
```
✅ Test passed successfully

### Failed Tests

```
tests/test_database_operations.py::TestDatabaseOperations::test_session_creation FAILED
```
❌ Test failed - check error details

### Skipped Tests

```
tests/test_database_operations.py::TestDatabaseOperations::test_session_creation SKIPPED
```
⏭️ Test was skipped (usually due to missing dependencies)

### Example Output

```
======================== test session starts =========================
collected 10 items

tests/test_database_operations.py::TestDatabaseOperations::test_database_connection PASSED     [ 10%]
tests/test_database_operations.py::TestDatabaseOperations::test_session_creation PASSED        [ 20%]
tests/test_database_operations.py::TestDatabaseOperations::test_interaction_tracking PASSED    [ 30%]
tests/test_database_operations.py::TestDatabaseOperations::test_feedback_submission PASSED     [ 40%]
tests/test_database_operations.py::TestDatabaseOperations::test_analytics_query PASSED         [ 50%]
tests/test_database_operations.py::TestFeedbackServices::test_user_session_service PASSED      [ 60%]
tests/test_database_operations.py::TestFeedbackServices::test_interaction_tracker_service PASSED [ 70%]
tests/test_database_operations.py::TestFeedbackServices::test_full_workflow PASSED             [ 80%]
tests/test_database_operations.py::TestGracefulDegradation::test_session_without_database PASSED [ 90%]
tests/test_database_operations.py::TestGracefulDegradation::test_interaction_tracking_without_database PASSED [100%]

========================= 10 passed in 2.34s =========================
```

---

## 🎯 Best Practices

### 1. Test Isolation

Each test should be independent and not rely on other tests:

```python
# ✅ Good - independent test
async def test_session_creation(db_connection):
    # Create fresh test data
    session = await create_session()
    assert session is not None

# ❌ Bad - depends on previous test
async def test_session_update():
    # Assumes session from previous test exists
    session = await get_session()  # Might fail!
```

### 2. Use Fixtures for Setup

```python
# ✅ Good - use fixtures
async def test_with_fixture(test_session_data):
    result = await process(test_session_data)
    assert result is not None

# ❌ Bad - hardcoded data
async def test_without_fixture():
    result = await process({"id": "123", "name": "test"})
    assert result is not None
```

### 3. Descriptive Test Names

```python
# ✅ Good - clear what's being tested
async def test_session_creation_with_valid_ip_address():
    ...

# ❌ Bad - unclear purpose
async def test_session():
    ...
```

### 4. One Assertion Per Concept

```python
# ✅ Good - focused test
async def test_session_has_valid_id():
    session = await create_session()
    assert session.id is not None
    assert len(session.id) == 36  # UUID length

# ❌ Bad - testing too many things
async def test_session():
    session = await create_session()
    assert session.id is not None
    assert session.user_ip is not None
    assert session.created_at is not None
    # ... many more assertions
```

### 5. Use Markers Appropriately

```python
@pytest.mark.asyncio
@pytest.mark.database
@pytest.mark.integration
async def test_database_operation():
    """Properly marked test"""
    ...
```

---

## 📚 Additional Resources

- [pytest Documentation](https://docs.pytest.org/)
- [pytest-asyncio Documentation](https://pytest-asyncio.readthedocs.io/)
- [pytest-cov Documentation](https://pytest-cov.readthedocs.io/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)

---

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: conda-incubator/setup-miniconda@v2
        with:
          environment-file: environment.yml
      - name: Run tests
        run: |
          conda activate ai-recommendation-service
          pytest tests/ -v --cov=app
```

---

## 📝 Test Checklist

Before committing code, ensure:

- [ ] All tests pass: `pytest tests/ -v`
- [ ] Coverage is acceptable: `pytest tests/ --cov=app`
- [ ] New features have tests
- [ ] Tests are properly marked
- [ ] Test names are descriptive
- [ ] No hardcoded test data (use fixtures)
- [ ] Database tests clean up after themselves

---

**Last Updated:** 2025-09-30  
**Test Framework:** pytest 7.4.*  
**Python Version:** 3.11  
**Environment:** ai-recommendation-service
