# Workflow Obligatorio del Framework

## Ciclo completo (12 fases)

Cada solicitud debe pasar por todas las fases en orden:

```
1.  Bootstrap      → Preparar estructura base del proyecto
2.  Discovery      → Explorar código, stack, dominio y contexto
3.  Deep Analysis  → Analizar requisitos, restricciones y riesgos
4.  Business       → Comprender valor de negocio y objetivos
5.  Clarification  → Preguntar si hay incertidumbre (nunca asumir)
6.  Summary        → Resumir plan de acción para el usuario
7.  Approval       → Obtener aprobación del usuario antes de ejecutar
8.  Planning       → Seleccionar agentes, skills y descomponer tareas
9.  Execution      → Implementar cambios (puede iterar)
10. Validation     → Verificar calidad, tests y criterios de aceptación
11. Documentation  → Documentar cambios, ADRs y lecciones aprendidas
12. Memory Update  → Actualizar PROJECT_MEMORY con nuevo contexto
```

## Reglas del workflow

- **Saltos prohibidos**: No se puede omitir ninguna fase
- **Aprobación obligatoria**: Fase 7 (Approval) es requisito antes de ejecutar
- **Validación por agente**: Cada agente valida su propio output
- **Actualización de memoria**: La última fase siempre es Memory Update
- **Contexto mínimo**: Compartir solo la información necesaria para cada fase
- **Clarification**: Si hay duda sobre el negocio, stack o requisitos, preguntar antes de continuar. Agrupar preguntas por prioridad. Nunca asumir información del negocio.

## Summary (antes de Approval)
Antes de implementar, presentar al usuario:
- Qué se entendió de la solicitud
- Qué tecnologías/arquitectura se detectaron
- Qué riesgos se encontraron
- Qué agentes y skills se proponen
- Plan de trabajo detallado
Esperar aprobación explícita antes de ejecutar.

## Excepciones

| Situación | Fases omitibles |
|---|---|
| Corrección menor (typo, un CSS) | Approval (solo notificar) |
| Pregunta informativa | Solo Discovery + Summary |
| Lectura de memoria existente | Solo Memory Update |
