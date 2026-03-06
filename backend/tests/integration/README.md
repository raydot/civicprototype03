# Integration Tests - Deployment Gate

## Overview

The `test_category_matching_deployment.py` file contains **10 critical tests** that must pass before any deployment to production. These tests validate the AI category matching system with real-world queries.

## Test Coverage

### 1. **Healthcare Access** (`test_1_healthcare_access_query`)
- Query: "I'm worried about the rising cost of healthcare and whether my family can afford insurance"
- Validates: Healthcare category matching

### 2. **Climate Urgency** (`test_2_climate_urgency_query`)
- Query: "Climate change is an existential threat and we need immediate action on renewable energy"
- Validates: Climate/Environment category matching

### 3. **Education Funding** (`test_3_education_funding_query`)
- Query: "We need to increase funding for public schools and make college more affordable"
- Validates: Education category matching

### 4. **Immigration Reform** (`test_4_immigration_reform_query`)
- Query: "We need comprehensive immigration reform with a pathway to citizenship for dreamers"
- Validates: Immigration category matching

### 5. **Gun Safety** (`test_5_gun_safety_query`)
- Query: "I support universal background checks and red flag laws to prevent gun violence"
- Validates: Gun Rights/Control category matching

### 6. **Economic Inequality** (`test_6_economic_inequality_query`)
- Query: "The wealth gap is too large - we need progressive taxation and higher minimum wage"
- Validates: Economic/Tax policy matching

### 7. **Voting Rights** (`test_7_voting_rights_query`)
- Query: "Protecting voting rights and making it easier to vote is crucial for democracy"
- Validates: Voting/Democracy category matching

### 8. **Criminal Justice Reform** (`test_8_criminal_justice_reform_query`)
- Query: "We need to end mass incarceration and reform our broken criminal justice system"
- Validates: Criminal Justice category matching

### 9. **Abortion Rights** (`test_9_abortion_rights_query`)
- Query: "I believe in protecting reproductive freedom and access to abortion services"
- Validates: Reproductive Rights category matching

### 10. **Infrastructure Investment** (`test_10_infrastructure_investment_query`)
- Query: "We need major investment in roads, bridges, and public transportation infrastructure"
- Validates: Infrastructure category matching

## Additional Tests

### **Confidence Labels** (`test_confidence_labels_are_updated`)
- Validates new confidence labels: "Strong Match", "Good Match", "Moderate Match"
- Ensures old labels are not being used

### **Response Time** (`test_response_time_acceptable`)
- Validates API responds within 5 seconds
- Critical for user experience

### **Multiple Priorities** (`test_multiple_priorities_query`)
- Validates handling of complex queries with multiple topics
- Ensures diverse category matching

## Running Tests Locally

```bash
cd backend
conda activate ai-recommendation-service

# Run all deployment gate tests
pytest tests/integration/test_category_matching_deployment.py -v

# Run specific test
pytest tests/integration/test_category_matching_deployment.py::TestCategoryMatchingDeploymentGate::test_1_healthcare_access_query -v

# Run with detailed output
pytest tests/integration/test_category_matching_deployment.py -v --tb=long
```

## CI/CD Integration

These tests run automatically in the GitHub Actions pipeline:

1. **On every PR/push** - `ci.yml` runs all tests
2. **Before deployment** - `deploy-backend.yml` runs as a gate
3. **Deployment blocked** if any test fails

## Environment Variables Required

```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
ENVIRONMENT=test
```

## Failure Handling

If any test fails:
1. Deployment is automatically blocked
2. GitHub Actions shows which test failed
3. Fix the issue before deployment proceeds
4. Re-run tests to verify fix

## Adding New Tests

To add a new deployment gate test:

1. Add test method to `TestCategoryMatchingDeploymentGate` class
2. Follow naming convention: `test_N_descriptive_name`
3. Include clear docstring explaining what's being tested
4. Assert on category matching accuracy
5. Update this README with the new test

## Success Criteria

All tests must:
- Return HTTP 200
- Match appropriate category
- Have reasonable confidence scores (> 0.1)
- Complete within acceptable time
- Use correct confidence labels
