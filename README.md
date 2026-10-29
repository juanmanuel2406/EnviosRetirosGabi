# Envíos Gabi

Turnero interno de **envíos, expresos y retiros en depósito** para Gabi y los repartidores del depósito de Gaming City.
Reemplaza la planilla "Turnero Envíos / Retiro" y mantiene su lógica.

## Cómo se usa

| Quién | Cómo entra | Qué puede hacer |
| --- | --- | --- |
| Depósito / repartidores | Link normal | Tildar y destildar **Armado** y **Despachado**, cambiar el estado de los retiros (Pendiente → Preparado → Entregado) y pasar lo terminado al historial |
| Gabi | Link terminado en `#gabi` (queda recordado en su dispositivo) | Todo lo anterior, más cargar, editar y eliminar pedidos, poner o sacar colores y devolver pedidos desde el historial |

No hay login. El modo Gabi es un atajo de interfaz y no una protección real: para restringir de verdad la carga hace falta un backend (ver "Próximos pasos").

### Colores, igual que en la planilla

- **Verde**: pasó por técnica, tiene algo armado.
- **Rojo**: pedido frenado. **Bloquea Despachado y Entregado.** Quitar el rojo libera el pedido; no confirma ningún pago.
- **Amarillo**: prestar atención.

### Pestañas

- **Envíos / Expresos**: agrupados en *En curso* y *Despachados*. Filtros: Por armar, Listos para despachar, Despachados.
- **Retiro depósito**: estado por pedido. Filtros: Pendientes, Preparados, Entregados.
- **Historial**: reemplaza las hojas "VIEJOS ENVÍOS" y "VIEJOS RETIRA".
- **Expresos**: directorio de transportes (dirección, horario, teléfono). Al elegir un expreso en un pedido, la fila muestra sus datos.

Cada pedido puede vincularse a una venta de SaaS (`assets/app.js` → `SAAS_VENTA`). El formulario acepta el número o el enlace HTTPS completo de ventas de `beta.saasargentina.com` y extrae su identificador. No importa automáticamente datos de SaaS.

Los importes aceptan formato argentino (por ejemplo, `150.000,50`). Los retiros incluyen el método `Comi - Expreso`. Las búsquedas de transportes ambiguas no asignan datos de otro expreso.

Atajos: `N` nuevo pedido (sólo Gabi), `/` buscar, `Esc` cerrar.

## Estructura

```
index.html          página
assets/styles.css   estilos (tema claro y oscuro con tokens)
assets/app.js       lógica, roles y animaciones (Web Animations API, sin librerías)
assets/data.js      directorio de expresos y pedidos de ejemplo
assets/logo.svg     logo y favicon
```

Sin dependencias ni build: se abre `index.html` o se publica tal cual en GitHub Pages
(Settings → Pages → Branch `main` / root).

## Datos

Por ahora los pedidos se guardan en el navegador (`localStorage`), así que cada dispositivo ve los suyos.
Todo el acceso pasa por el objeto `Store` en `assets/app.js`. Una lista vacía guardada se conserva y no vuelve a cargar los pedidos de ejemplo. No se lee ni se modifica Google Sheets desde la aplicación.

## Próximos pasos

1. Base compartida (Supabase, Firebase o Google Sheets vía Apps Script) reemplazando `Store`, para que Gabi y el depósito vean lo mismo en tiempo real.
2. Validar los datos y las operaciones en el futuro backend compartido, manteniendo el flujo interno sin login ni registro.
3. Integración con SaaS para traer cliente y datos desde el número de venta.
