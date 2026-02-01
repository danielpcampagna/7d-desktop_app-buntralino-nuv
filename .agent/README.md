# 7D GenAI UI - Agent Context

This folder contains modular context files for AI agents working on this codebase. Each file focuses on a specific topic and can be loaded independently to minimize token usage.

## Quick Reference

| When you need to... | Load this file |
|---------------------|----------------|
| Understand the product | `product/overview.md` |
| Know available features | `product/features.md` |
| Understand user workflows | `product/user-flows.md` |
| See planned features | `product/roadmap.md` |
| Understand system architecture | `architecture/overview.md` |
| Work on UI components | `architecture/component-structure.md` |
| Work on project templates | `templates/overview.md` |
| Add/modify templates | `templates/project-templates.md` |
| Work on import functionality | `templates/import-sources.md` |
| Work with Dagster | `etl-tools/dagster.md` |
| Work with Prefect | `etl-tools/prefect.md` |
| Work with Dagu | `etl-tools/dagu.md` |
| Work with Airflow | `etl-tools/airflow.md` |
| Modify Project/Workspace types | `types/project.md` |
| Modify template types | `types/templates.md` |

## Folder Structure

```
.agent/
├── README.md              # This file - index and guide
├── product/               # Product documentation (PRD-style)
│   ├── overview.md        # Vision, purpose, target users
│   ├── features.md        # Core features and capabilities
│   ├── user-flows.md      # Key user journeys
│   └── roadmap.md         # Future features and TODOs
├── architecture/          # Technical architecture
│   ├── overview.md        # System architecture, tech stack
│   └── component-structure.md  # UI patterns and components
├── templates/             # Project template system
│   ├── overview.md        # Template system design
│   ├── project-templates.md    # All 8 project templates
│   └── import-sources.md  # Import system documentation
├── etl-tools/             # ETL tool references
│   ├── dagster.md         # Dagster concepts and structure
│   ├── prefect.md         # Prefect concepts and structure
│   ├── dagu.md            # Dagu concepts and structure
│   └── airflow.md         # Airflow concepts and structure
└── types/                 # TypeScript type definitions
    ├── project.md         # Project, Workspace, FileNode
    └── templates.md       # Template and import types
```

## Usage Tips

1. **Start with overview files** - When unfamiliar with a topic, read the overview first
2. **Load only what you need** - Each file is self-contained
3. **Check roadmap for context** - Before implementing new features, check if they're planned
4. **Reference types when editing** - Load relevant type files when modifying interfaces
