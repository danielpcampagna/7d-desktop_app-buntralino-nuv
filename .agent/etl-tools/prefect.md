# Prefect Reference

## Overview

Prefect is a workflow orchestration framework that uses Python decorators to define workflows. It emphasizes **dynamic workflows** and ease of use.

**Documentation**: https://docs.prefect.io/

## Key Concepts

### Flows
Container for workflow logic. The main entry point.

```python
from prefect import flow

@flow
def my_flow(name: str = "World"):
    """A simple flow."""
    print(f"Hello, {name}!")
    return f"Completed for {name}"

# Run the flow
my_flow("Prefect")
```

### Tasks
Individual units of work within a flow.

```python
from prefect import task, flow

@task
def extract():
    """Extract data."""
    return [1, 2, 3, 4, 5]

@task
def transform(data: list):
    """Transform data."""
    return [x * 2 for x in data]

@task
def load(data: list):
    """Load data."""
    print(f"Loading {len(data)} items")

@flow
def etl_flow():
    raw = extract()
    transformed = transform(raw)
    load(transformed)
```

### Deployments
Packaged flows for scheduled or remote execution.

```python
from prefect import flow
from prefect.deployments import Deployment

@flow
def my_flow():
    pass

deployment = Deployment.build_from_flow(
    flow=my_flow,
    name="my-deployment",
    work_pool_name="my-pool"
)
deployment.apply()
```

### Work Pools
Infrastructure where flows run.

### Blocks
Reusable configuration for external systems.

```python
from prefect.blocks.system import Secret

# Create and save a block
secret = Secret(value="my-secret-value")
secret.save("my-api-key")

# Use in a flow
@flow
def use_secret():
    secret = Secret.load("my-api-key")
    api_key = secret.get()
```

## Project Structure

```
my_prefect_project/
├── flows/
│   ├── __init__.py
│   └── main_flow.py
├── tasks/
│   ├── __init__.py
│   ├── extract.py
│   ├── transform.py
│   └── load.py
├── prefect.yaml          # Deployment configuration
├── pyproject.toml
└── README.md
```

## prefect.yaml

```yaml
name: my-project
prefect-version: 2.0.0

deployments:
  - name: my-deployment
    entrypoint: flows/main_flow.py:my_flow
    work_pool:
      name: my-pool
    schedule:
      cron: "0 0 * * *"
```

## CLI Commands

```bash
# Start Prefect server (local development)
prefect server start

# Create deployment
prefect deploy --all

# Run a flow locally
python flows/main_flow.py

# Start a worker
prefect worker start --pool my-pool
```

## Decorators Reference

```python
@flow(
    name="my-flow",
    description="Description here",
    retries=3,
    retry_delay_seconds=60,
    timeout_seconds=3600
)
def my_flow():
    pass

@task(
    name="my-task",
    retries=2,
    cache_key_fn=task_input_hash,
    cache_expiration=timedelta(hours=1)
)
def my_task():
    pass
```

## Visual Editor Integration

For 7D GenAI UI visual editor:
- Each `@task` becomes a node
- Flow structure defines edges
- Blocks shown as external connections
- Subflows can be nested nodes

## Best Practices

1. **Small Tasks**: Keep tasks focused and reusable
2. **Error Handling**: Use retries and error states
3. **Caching**: Cache expensive computations
4. **Logging**: Use Prefect's built-in logging
5. **Parameters**: Use flow parameters for flexibility

## Related Files

- `src/types/templates.ts` - Prefect template configuration
- `.agent/templates/project-templates.md` - All templates reference
