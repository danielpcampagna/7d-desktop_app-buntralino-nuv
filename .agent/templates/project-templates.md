# Project Templates Reference

## All Templates

### 1. Python Package

| Property | Value |
|----------|-------|
| ID | `python-package` |
| Category | Library |
| Visual Editor | No |
| Icon | `Package` |

**Description**: Create a reusable Python package that can be imported by other projects in the workspace.

**Use Cases**:
- Shared utility libraries
- Internal packages
- Reusable modules

**Default Structure** (planned):
```
my-package/
├── src/
│   └── my_package/
│       └── __init__.py
├── tests/
│   └── test_main.py
├── pyproject.toml
└── README.md
```

---

### 2. FastAPI

| Property | Value |
|----------|-------|
| ID | `fastapi` |
| Category | API |
| Visual Editor | No |
| Icon | `Zap` |

**Description**: Create a modern Python API using FastAPI framework.

**Use Cases**:
- REST APIs
- Microservices
- Backend services

**Default Structure** (planned):
```
my-api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── routers/
├── tests/
├── pyproject.toml
└── README.md
```

---

### 3. Dagster ETL

| Property | Value |
|----------|-------|
| ID | `dagster` |
| Category | ETL |
| Visual Editor | Yes |
| Icon | `GitBranch` |

**Description**: Create a Dagster data pipeline project with asset-based orchestration.

**Use Cases**:
- Data pipelines
- ETL workflows
- ML data processing

**Key Concepts**:
- Assets (data artifacts)
- Jobs (asset collections)
- Schedules and sensors
- Resources (external connections)

**Default Structure** (planned):
```
my-dagster/
├── my_dagster/
│   ├── __init__.py
│   ├── definitions.py
│   └── assets.py
├── pyproject.toml
└── README.md
```

---

### 4. Prefect ETL

| Property | Value |
|----------|-------|
| ID | `prefect` |
| Category | ETL |
| Visual Editor | Yes |
| Icon | `Workflow` |

**Description**: Create a Prefect workflow orchestration project.

**Use Cases**:
- Dynamic workflows
- ML pipelines
- Data processing

**Key Concepts**:
- Flows (workflow containers)
- Tasks (individual steps)
- Deployments
- Work pools

**Default Structure** (planned):
```
my-prefect/
├── flows/
│   └── main_flow.py
├── tasks/
│   └── common_tasks.py
├── prefect.yaml
└── pyproject.toml
```

---

### 5. Dagu ETL

| Property | Value |
|----------|-------|
| ID | `dagu` |
| Category | ETL |
| Visual Editor | Yes |
| Icon | `Network` |

**Description**: Create a Dagu workflow with YAML-based DAG definitions.

**Use Cases**:
- Simple ETL pipelines
- Cron-like workflows
- Shell script orchestration

**Key Concepts**:
- YAML workflow definitions
- Steps with commands
- Dependencies between steps
- Lifecycle handlers

**Default Structure** (planned):
```
my-dagu/
├── dags/
│   └── main.yaml
├── scripts/
│   └── extract.py
└── README.md
```

---

### 6. Airflow ETL

| Property | Value |
|----------|-------|
| ID | `airflow` |
| Category | ETL |
| Visual Editor | Yes |
| Icon | `Wind` |

**Description**: Create an Apache Airflow DAG project.

**Use Cases**:
- Complex ETL pipelines
- Scheduled workflows
- Enterprise data pipelines

**Key Concepts**:
- DAGs (Directed Acyclic Graphs)
- Operators (task types)
- Sensors (triggers)
- XComs (task communication)

**Default Structure** (planned):
```
my-airflow/
├── dags/
│   └── main_dag.py
├── plugins/
├── tests/
└── pyproject.toml
```

---

### 7. Optilogic Utilities

| Property | Value |
|----------|-------|
| ID | `optilogic-utilities` |
| Category | Utilities |
| Visual Editor | No |
| Icon | `Wrench` |

**Description**: Create an Optilogic utilities project for helper scripts and tools.

**Use Cases**:
- Helper scripts
- Utility functions
- Internal tools

**Default Structure** (planned):
```
my-utilities/
├── src/
│   └── utils/
│       └── __init__.py
├── scripts/
└── pyproject.toml
```

---

### 8. UV Python Project

| Property | Value |
|----------|-------|
| ID | `uv-python` |
| Category | Generic |
| Visual Editor | No |
| Icon | `Terminal` |

**Description**: Create a generic UV-managed Python project.

**Use Cases**:
- General Python applications
- Scripts and tools
- Custom project structures

**Default Structure** (planned):
```
my-project/
├── src/
│   └── main.py
├── pyproject.toml
└── README.md
```

---

## Template Summary Table

| Template | ID | Category | Visual Editor |
|----------|-----|----------|---------------|
| Python Package | `python-package` | Library | No |
| FastAPI | `fastapi` | API | No |
| Dagster ETL | `dagster` | ETL | Yes |
| Prefect ETL | `prefect` | ETL | Yes |
| Dagu ETL | `dagu` | ETL | Yes |
| Airflow ETL | `airflow` | ETL | Yes |
| Optilogic Utilities | `optilogic-utilities` | Utilities | No |
| UV Python Project | `uv-python` | Generic | No |

## ETL Templates (Visual Editor Enabled)

These templates support the React Flow visual editor:

```typescript
const ETL_TEMPLATES = ['dagster', 'prefect', 'dagu', 'airflow'];

// Helper function
export function getWorkflowOrchestrationTemplates(): TemplateConfig[] {
  return TEMPLATE_CONFIGS.filter(t => 
    t.category === 'etl' && t.supportsVisualEditor
  );
}
```
