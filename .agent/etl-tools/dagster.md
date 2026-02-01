# Dagster Reference

## Overview

Dagster is a data orchestrator for machine learning, analytics, and ETL. It uses an **asset-based** approach where you define data assets and their dependencies.

**Documentation**: https://docs.dagster.io/

## Key Concepts

### Assets
Data artifacts that your pipeline produces. Assets are the core abstraction.

```python
from dagster import asset

@asset
def my_asset():
    """An asset that produces data."""
    return [1, 2, 3]

@asset
def downstream_asset(my_asset):
    """An asset that depends on my_asset."""
    return [x * 2 for x in my_asset]
```

### Jobs
Collections of assets that run together.

```python
from dagster import define_asset_job

my_job = define_asset_job(
    name="my_job",
    selection=["my_asset", "downstream_asset"]
)
```

### Schedules
Time-based triggers for jobs.

```python
from dagster import schedule

@schedule(cron_schedule="0 0 * * *", job=my_job)
def daily_schedule():
    return {}
```

### Resources
External connections (databases, APIs, etc.).

```python
from dagster import resource, ConfigurableResource

class DatabaseResource(ConfigurableResource):
    connection_string: str
    
    def query(self, sql: str):
        # Execute query
        pass
```

### Sensors
Event-based triggers.

```python
from dagster import sensor, RunRequest

@sensor(job=my_job)
def my_sensor(context):
    if should_run():
        yield RunRequest(run_key="unique_key")
```

## Project Structure

```
my_dagster_project/
├── my_dagster_project/
│   ├── __init__.py
│   ├── definitions.py      # Main definitions file
│   ├── assets/
│   │   ├── __init__.py
│   │   └── my_assets.py
│   ├── jobs/
│   │   └── my_jobs.py
│   └── resources/
│       └── database.py
├── pyproject.toml
└── README.md
```

## Definitions File

The main entry point for Dagster:

```python
# definitions.py
from dagster import Definitions, load_assets_from_modules

from . import assets

all_assets = load_assets_from_modules([assets])

defs = Definitions(
    assets=all_assets,
    jobs=[my_job],
    schedules=[daily_schedule],
    resources={
        "database": DatabaseResource(connection_string="...")
    }
)
```

## CLI Commands

```bash
# Create new project
dagster project scaffold --name my_project

# Run development server
dagster dev

# Run a job
dagster job execute -j my_job

# Run specific asset
dagster asset materialize --select my_asset
```

## Visual Editor Integration

For 7D GenAI UI visual editor:
- Each `@asset` becomes a node
- Dependencies between assets become edges
- Resources shown as configuration
- Jobs group related assets

## Best Practices

1. **Asset-First Design**: Think in terms of data assets
2. **Type Annotations**: Use type hints for better tooling
3. **Partitions**: Use for time-series or categorical data
4. **Testing**: Write tests for individual assets
5. **Documentation**: Add docstrings to assets

## Related Files

- `src/types/templates.ts` - Dagster template configuration
- `.agent/templates/project-templates.md` - All templates reference
