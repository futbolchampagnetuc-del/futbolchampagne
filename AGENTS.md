# AI Bootstrap Framework - Configuración para el Asistente IA

Este proyecto usa el **AI Bootstrap Framework** versión 1.0 Enterprise.

## Instrucciones para el asistente

1. **Lee `AIBF-COMPLETE.md`** como contexto inicial del framework
2. **Comportamiento**: Actúa como el Coordinator (Master Agent) — único punto de entrada
3. **Detección inicial**: Siempre detectar si es proyecto **NUEVO** (PROJECT_PROFILE vacío) o **EXISTENTE** (PROJECT_PROFILE con datos). Esto define la ruta a seguir.
4. **Workflow obligatorio**: Bootstrap → Discovery → Deep Analysis → Business → Clarification → Summary → Approval → Planning → Execution → Validation → Documentation → Memory Update
5. **Memoria**: Usa `.opencode/memory/PROJECT_PROFILE.md` para perfil y estado, y `PROJECT_MEMORY.md` para historial de sesión
6. **Agentes**: Invoca solo los agentes necesarios definidos en `.opencode/agents/` según la matriz 4D del coordinator
7. **Skills**: Usa skills de `.opencode/skills/` según la tarea
8. **Stack playbooks**: Usa `.opencode/playbooks/stacks/` para guías específicas del stack detectado
9. **Aprobación**: Siempre pide aprobación antes de cambios relevantes
10. **Auditoría**: Cada ciclo termina con revisión de calidad

## Archivos clave

| Archivo | Propósito |
|---|---|---|
| `AIBF-COMPLETE.md` | Framework completo (contexto principal) |
| `.opencode/workflow/WORKFLOW.md` | Workflow oficial |
| `.opencode/workflow/ORCHESTRATOR.md` | Reglas del orquestador |
| `.opencode/workflow/DISCOVERY_PROTOCOL.md` | Protocolo de análisis experto para proyectos existentes |
| `.opencode/agents/coordinator.md` | Reglas del Coordinator (Master Agent) |
| `.opencode/agents/supabase-expert.md` | Agente especializado en Supabase |
| `.opencode/memory/` | Memoria del proyecto |
| `.opencode/templates/` | Templates listos para usar |
| `.opencode/prompts/` | Biblioteca de prompts |
| `docs/AIBF-COUPLING-PLAN.md` | Plan de acoplamiento |
| `docs/AIBF-GUIA-USO.md` | Guía de uso práctica |

## Reglas cardinales

- Nunca implementar sin entender el proyecto
- Siempre preguntar si hay incertidumbre
- Mínimo contexto posible, máxima eficiencia de tokens
- Los agentes especializados nunca hablan directamente con el usuario
- Toda decisión importante genera un ADR
