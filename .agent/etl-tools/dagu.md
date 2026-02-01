# Dagu Reference

## Overview

Dagu is a **YAML-based** workflow engine. It's lightweight and focuses on simplicity, using YAML files to define DAGs instead of Python code.

**Documentation**: https://dagu.readthedocs.io/

## Key Concepts

### DAG (Workflow)
A YAML file defining steps and their dependencies.

```yaml
# my_workflow.yaml
name: my-workflow
description: A simple ETL workflow

steps:
  - name: extract
    command: python scripts/extract.py
    
  - name: transform
    command: python scripts/transform.py
    depends:
      - extract
      
  - name: load
    command: python scripts/load.py
    depends:
      - transform
```

### Steps
Individual units of work with commands to execute.

```yaml
steps:
  - name: my-step
    command: python script.py
    dir: /path/to/directory
    env:
      - KEY: value
    output: OUTPUT_VAR
```

### Dependencies
Define execution order between steps.

```yaml
steps:
  - name: step1
    command: echo "First"
    
  - name: step2
    command: echo "Second"
    depends:
      - step1
      
  - name: step3
    command: echo "Third"
    depends:
      - step1  # Parallel with step2
```

### Parameters
Pass values to workflows.

```yaml
params: input_file output_file

steps:
  - name: process
    command: python process.py ${input_file} ${output_file}
```

### Handlers
Lifecycle hooks for success, failure, etc.

```yaml
handlerOn:
  success:
    command: echo "Workflow completed successfully"
  failure:
    command: echo "Workflow failed"
  exit:
    command: echo "Cleanup"
```

## Project Structure

```
my_dagu_project/
├── dags/
│   ├── main.yaml
│   ├── daily_etl.yaml
│   └── weekly_report.yaml
├── scripts/
│   ├── extract.py
│   ├── transform.py
│   └── load.py
├── config/
│   └── settings.yaml
└── README.md
```

## Full DAG Example

```yaml
# dags/etl_pipeline.yaml
name: etl-pipeline
description: Daily ETL pipeline
schedule: "0 0 * * *"  # Daily at midnight

env:
  - DATABASE_URL: postgresql://localhost/db
  - OUTPUT_DIR: /data/output

params: date

steps:
  - name: extract-users
    command: python scripts/extract.py users ${date}
    output: USERS_FILE
    
  - name: extract-orders
    command: python scripts/extract.py orders ${date}
    output: ORDERS_FILE
    
  - name: transform
    command: python scripts/transform.py ${USERS_FILE} ${ORDERS_FILE}
    depends:
      - extract-users
      - extract-orders
    output: TRANSFORMED_FILE
    
  - name: load
    command: python scripts/load.py ${TRANSFORMED_FILE}
    depends:
      - transform
      
  - name: notify
    command: python scripts/notify.py "ETL completed for ${date}"
    depends:
      - load

handlerOn:
  failure:
    command: python scripts/alert.py "ETL failed for ${date}"
  exit:
    command: python scripts/cleanup.py
```

## Step Options

```yaml
steps:
  - name: my-step
    command: python script.py
    dir: /working/directory
    env:
      - VAR: value
    output: OUTPUT_VAR
    stdout: /path/to/stdout.log
    stderr: /path/to/stderr.log
    preconditions:
      - condition: "${VAR}"
        expected: "value"
    continueOn:
      failure: true
    retryPolicy:
      limit: 3
      intervalSec: 60
```

## CLI Commands

```bash
# Start Dagu server
dagu server

# Run a DAG
dagu start my_workflow.yaml

# Run with parameters
dagu start my_workflow.yaml -- param1=value1

# Check status
dagu status my_workflow.yaml

# Stop a running DAG
dagu stop my_workflow.yaml
```

## Visual Editor Integration

For 7D GenAI UI visual editor:
- Each step becomes a node
- `depends` arrays define edges
- Handlers shown as special nodes
- Parameters shown as inputs

## Best Practices

1. **Small Steps**: One command per step
2. **Use Output Variables**: Pass data between steps
3. **Add Handlers**: Always handle failures
4. **Parameterize**: Use params for flexibility
5. **Environment Variables**: Use env for configuration

## Related Files

- `src/types/templates.ts` - Dagu template configuration
- `.agent/templates/project-templates.md` - All templates reference
