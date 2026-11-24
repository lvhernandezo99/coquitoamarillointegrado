# Coquito Amarillo SAS — Tienda web (proyecto integrador)

Web App de una sola página (HTML5 + CSS3 + JavaScript) con modelo de dominio en POO y dos APIs externas.

- **Repositorio:** :** (https://github.com/lvhernandezo99/coquitoamarillointegrado.git)
- **Demo (GitHub Pages):** _(pegar URL pública)_

## Ejecutar localmente
Los módulos ES no cargan con doble clic (`file:`). Use la extensión **Live Server** de VS Code (clic derecho en `index.html` → *Open with Live Server*) o `npx serve`.

## Estructura
```
index.html · css/estilos.css · data/ (productos.json, ciudades.json)
js/main.js · js/modelo/ · js/pagos/ · js/servicios/ · js/ui/CheckoutUI.js
```

## Decisiones de diseño  
1. **`Transaccion` guarda copias ** del cliente y los ítems, no referencias: el recibo no cambia si luego cambia el precio o el stock.
2. **Clase añadida `HistorialTransacciones`:** aísla `localStorage` para que ninguna otra clase dependa del navegador y para tolerar datos corruptos.
3. **`CheckoutUI` sin reglas de negocio:** solo lee el DOM y delega; validaciones y cálculos viven en las clases. Si una API falla, el servicio lanza error y la UI usa un valor de respaldo (clima seco, tasas aproximadas) e informa al usuario.

## APIs usadas
- **ExchangeRate-API** (acceso abierto, `open.er-api.com`): tasas de cambio. Atribución visible en el pie: *Rates By Exchange Rate API*.
- **Open-Meteo** (`api.open-meteo.com`): clima actual para el recargo por lluvia. Uso no comercial.
- **Geolocation API** del navegador (requiere permiso y HTTPS).

## Privacidad
Aviso y autorización (Ley 1581 de 2012) en el formulario. Los datos de tarjeta solo existen en memoria durante el pago y nunca se guardan ni se envían; en el historial solo se guarda el nombre del medio y la comisión.

## Notas
- Los pagos son simulados. El stock vive en memoria y se reinicia al recargar.
- Tarjeta de prueba válida: `4242 4242 4242 4242`, vence en una fecha futura, CVV cualquiera de 3 dígitos. Nequi: `3001234567`. PSE: banco y documento de 6 a 10 dígitos.

## Créditos
Laura Hernandez - Desarrolladora
