# review-code

## Objetivo
Revisar código fuente para identificar problemas de calidad, seguridad, rendimiento y mantenibilidad antes de integrar cambios.

## Cuándo usar
- Antes de mergear un PR
- Para validar una refactorización
- Como parte del quality gate del workflow
- Cuando se necesita una segunda opinión técnica

## Entradas
- Código fuente a revisar (archivos o diff)
- Contexto del proyecto (PROJECT_PROFILE)
- Guías de estilo del stack detectado

## Procedimiento
1. Leer el diff o los archivos modificados
2. Verificar contra estos criterios en orden de prioridad:
   - **Funcional**: ¿Resuelve el problema? ¿Casos borde?
   - **Seguridad**: ¿Inyecciones, exponen datos, auth correcta?
   - **Rendimiento**: ¿N+1 queries, bucles innecesarios, caché?
   - **Mantenibilidad**: ¿Nombres claros, complejidad, patrones?
   - **Estilo**: ¿Sigue las convenciones del proyecto?
3. Clasificar cada hallazgo como: crítico / mayor / menor / sugerencia
4. Generar resumen accionable

## Salida
- Resumen de hallazgos con severidad
- Riesgos detectados
- Recomendaciones priorizadas
- Archivos que requieren cambios
