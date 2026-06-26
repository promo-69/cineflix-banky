# Plan de Documentación: API Externa de Banky

A continuación se detalla el plan con la lista completa de endpoints, payloads y requisitos necesarios para realizar solicitudes a las APIs externas del sistema.

## 1. API de Transacciones Externas (Usuarios/Clientes)

Esta API permite a los usuarios autorizados (vía API Key) realizar transferencias, pagos móviles y consultar el estado de sus transacciones.

**Autenticación Requerida:** 
Header `Authorization: Bearer <api_key>`

### 1.1. Realizar Transacción (Transferencia o Pago Móvil)
- **Ruta:** `POST /api/external/transactions`
- **Requisitos:** El token debe ser un API Key válido asociado a un usuario. El monto debe ser mayor a 0.

**Payload para Transferencia (`type: "transfer"`):**
```json
{
  "type": "transfer",
  "amount": 150.50,
  "destinationDocument": "V-12345678",
  "destinationAccount": "0201..." 
}
```

**Payload para Pago Móvil (`type: "mobile_payment"`):**
```json
{
  "type": "mobile_payment",
  "amount": 150.50,
  "destinationDocument": "V-12345678",
  "destinationPhone": "04141234567",
  "bankCode": "0102"
}
```

### 1.2. Consultar Transacción por Referencia
- **Ruta:** `GET /api/external/transactions/[reference]`
- **Requisitos:** El token debe ser válido y la transacción consultada debe pertenecer al usuario dueño del token.
- **Payload:** No requiere body. La referencia va en la URL (ej. `/api/external/transactions/123456789012`).

---

## 2. API de Puntos de Venta (POS)

Esta API está diseñada para ser consumida por Puntos de Venta (POS) centralizados y requiere un nivel de autorización mayor (Master Token).

**Autenticación Requerida:** 
Header `Authorization: Bearer <master_token>`

### 2.1. Procesar Transferencia POS
- **Ruta:** `POST /api/v1/pos/transfer`
- **Requisitos:** Requiere un Token Maestro válido. La tarjeta de origen (`sourceCard`) debe existir y estar vinculada a un usuario válido en el sistema. El monto debe ser mayor a 0.

**Payload Requerido:**
```json
{
  "sourceCard": "NUMERO_DE_TARJETA",
  "destinationDocument": "V-87654321",
  "destinationAccount": "0201...",
  "amount": 250.00
}
```
