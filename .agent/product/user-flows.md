# User Flows

## Creating a New Workspace

```
Home Page
    │
    ▼
Click "New Workspace"
    │
    ▼
Enter name & description
    │
    ▼
Click "Create"
    │
    ▼
Workspace created → Navigate to Workspace Page
```

## Creating a New Project from Template

```
Workspace Page
    │
    ▼
Click "New Project"
    │
    ▼
┌─────────────────────────────────┐
│  CreateProjectModal (Step 1)    │
│  Select a template from grid    │
│  - See category badges          │
│  - See visual editor indicator  │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  CreateProjectModal (Step 2)    │
│  Enter project details:         │
│  - Name                         │
│  - Description                  │
│  - Python version               │
└─────────────────────────────────┘
    │
    ▼
Click "Create Project"
    │
    ▼
Project created → Added to workspace
```

## Importing an Existing Project

### Data Guru ETL Import (Convert Mode)

```
Workspace Page
    │
    ▼
Click "Import"
    │
    ▼
┌─────────────────────────────────┐
│  ImportProjectModal (Step 1)    │
│  Select "Data Guru"             │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  ImportProjectModal (Step 2)    │
│  Upload .dg file                │
│  (drag & drop or browse)        │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  ImportProjectModal (Step 3)    │
│  Select target platform:        │
│  - Airflow                      │
│  - Dagster                      │
│  - Prefect                      │
│  - Dagu                         │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  ImportProjectModal (Step 4)    │
│  Enter project details          │
└─────────────────────────────────┘
    │
    ▼
Project imported & converted
```

### UV Python Import (Direct Mode)

```
Workspace Page
    │
    ▼
Click "Import"
    │
    ▼
Select "UV Python Project"
    │
    ▼
Enter folder path
    │
    ▼
┌─────────────────────────────────┐
│  Configuration Step             │
│  - Entry point (e.g., main.py)  │
│  - Run command (with presets)   │
└─────────────────────────────────┘
    │
    ▼
Enter project details
    │
    ▼
Project imported
```

## Editing an ETL Project

```
Project Page (ETL project)
    │
    ▼
See tab switcher: [Visual] [Code]
    │
    ├─────────────────┐
    ▼                 ▼
Visual Mode       Code Mode
    │                 │
    ▼                 ▼
React Flow        File explorer
DAG editor        + Code editor
(Coming soon)
```

## Editing a Non-ETL Project

```
Project Page (Python Package, FastAPI, etc.)
    │
    ▼
No tab switcher shown
    │
    ▼
File explorer + Code editor only
```

## Navigating the Application

```
┌────────────────────────────────────────────────────┐
│                    Header                          │
│  [7D Logo]        [Navigation]        [User Menu]  │
└────────────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
    Home Page     Workspace Page   Project Page
    (all workspaces) (projects)    (edit project)
```
