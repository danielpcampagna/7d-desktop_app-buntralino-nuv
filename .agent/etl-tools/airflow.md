# Airflow Reference

## Overview

Apache Airflow is a platform to programmatically author, schedule, and monitor workflows. It uses Python to define **DAGs** (Directed Acyclic Graphs).

**Documentation**: https://airflow.apache.org/docs/

## Key Concepts

### DAGs
Directed Acyclic Graphs - collections of tasks with dependencies.

```python
from datetime import datetime
from airflow import DAG
from airflow.operators.python import PythonOperator

with DAG(
    dag_id="my_dag",
    start_date=datetime(2024, 1, 1),
    schedule_interval="@daily",
    catchup=False,
) as dag:
    
    def extract():
        return [1, 2, 3]
    
    def transform(ti):
        data = ti.xcom_pull(task_ids="extract_task")
        return [x * 2 for x in data]
    
    extract_task = PythonOperator(
        task_id="extract_task",
        python_callable=extract,
    )
    
    transform_task = PythonOperator(
        task_id="transform_task",
        python_callable=transform,
    )
    
    extract_task >> transform_task
```

### Operators
Pre-built task types for common operations.

```python
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.operators.email import EmailOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator

# Python task
python_task = PythonOperator(
    task_id="python_task",
    python_callable=my_function,
)

# Bash task
bash_task = BashOperator(
    task_id="bash_task",
    bash_command="echo 'Hello World'",
)

# SQL task
sql_task = PostgresOperator(
    task_id="sql_task",
    postgres_conn_id="my_postgres",
    sql="SELECT * FROM users",
)
```

### Sensors
Wait for external conditions.

```python
from airflow.sensors.filesystem import FileSensor
from airflow.sensors.external_task import ExternalTaskSensor

file_sensor = FileSensor(
    task_id="wait_for_file",
    filepath="/data/input.csv",
    poke_interval=60,
    timeout=3600,
)
```

### XComs
Share data between tasks.

```python
def push_data(**context):
    context['ti'].xcom_push(key='my_data', value=[1, 2, 3])

def pull_data(**context):
    data = context['ti'].xcom_pull(key='my_data', task_ids='push_task')
    print(data)
```

### Connections
Store external system credentials.

### Variables
Store configuration values.

```python
from airflow.models import Variable

# Get a variable
api_key = Variable.get("api_key")

# Get with default
debug = Variable.get("debug_mode", default_var=False)
```

## Project Structure

```
my_airflow_project/
├── dags/
│   ├── __init__.py
│   ├── my_dag.py
│   └── etl_pipeline.py
├── plugins/
│   ├── __init__.py
│   └── custom_operators.py
├── tests/
│   └── test_dags.py
├── config/
│   └── variables.json
├── pyproject.toml
└── README.md
```

## Full DAG Example

```python
# dags/etl_pipeline.py
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.sensors.filesystem import FileSensor

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': True,
    'email': ['team@example.com'],
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    dag_id='etl_pipeline',
    default_args=default_args,
    description='Daily ETL pipeline',
    schedule_interval='0 0 * * *',
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['etl', 'daily'],
) as dag:
    
    # Wait for input file
    wait_for_file = FileSensor(
        task_id='wait_for_file',
        filepath='/data/input/{{ ds }}.csv',
        poke_interval=300,
        timeout=3600,
    )
    
    # Extract
    def extract_data(**context):
        # Extract logic
        return {'records': 1000}
    
    extract = PythonOperator(
        task_id='extract',
        python_callable=extract_data,
    )
    
    # Transform
    transform = BashOperator(
        task_id='transform',
        bash_command='python scripts/transform.py {{ ds }}',
    )
    
    # Load
    def load_data(**context):
        # Load logic
        pass
    
    load = PythonOperator(
        task_id='load',
        python_callable=load_data,
    )
    
    # Define dependencies
    wait_for_file >> extract >> transform >> load
```

## TaskFlow API (Airflow 2.0+)

Modern decorator-based syntax:

```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(
    schedule_interval='@daily',
    start_date=datetime(2024, 1, 1),
    catchup=False,
)
def my_etl():
    
    @task
    def extract():
        return [1, 2, 3]
    
    @task
    def transform(data: list):
        return [x * 2 for x in data]
    
    @task
    def load(data: list):
        print(f"Loading {len(data)} items")
    
    # Define flow
    raw = extract()
    transformed = transform(raw)
    load(transformed)

# Instantiate the DAG
dag = my_etl()
```

## CLI Commands

```bash
# Start Airflow standalone (development)
airflow standalone

# Initialize database
airflow db init

# Create admin user
airflow users create --username admin --password admin --role Admin

# List DAGs
airflow dags list

# Trigger a DAG
airflow dags trigger my_dag

# Test a task
airflow tasks test my_dag my_task 2024-01-01
```

## Visual Editor Integration

For 7D GenAI UI visual editor:
- Each task/operator becomes a node
- `>>` dependencies become edges
- TaskGroups can be collapsed nodes
- Sensors shown with wait indicators

## Best Practices

1. **Idempotent Tasks**: Tasks should be safe to re-run
2. **Avoid Top-Level Code**: Only DAG definition at module level
3. **Use TaskFlow API**: Cleaner code for Python tasks
4. **Test DAGs**: Write tests for DAG structure
5. **Use Pools**: Limit concurrent resource usage

## Related Files

- `src/types/templates.ts` - Airflow template configuration
- `.agent/templates/project-templates.md` - All templates reference
