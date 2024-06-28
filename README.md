# Transaction Service Application CQQRS/Event Sourcing

Esta aplicación implementa un sistema de manejo de transacciones utilizando un patrón basado en eventos. Está diseñada para manejar comandos de creación de transacciones, generar eventos de transacción y actualizar el estado del balance de las cuentas involucradas.

## Estructura del Código

### Comandos y Eventos

- **CreateTransactionCommand**: Define los datos necesarios para crear una transacción.
- **TransactionCreatedEvent**: Define los datos que se generarán cuando se cree una transacción.

### Estado

- **AccountBalanceState**: Representa el estado del balance de una cuenta.

### Manejadores y Proyectores

- **CreateTransactionCommandHandler**: Procesa el comando `CreateTransactionCommand` y genera un evento `TransactionCreatedEvent`.
- **TransactionProjector**: Actualiza el estado del balance de la cuenta basado en el evento `TransactionCreatedEvent`.

### Almacenamiento de Eventos

- **TransactionLocalEventStore**: Almacena los eventos generados.

### Servicio de Transacciones

- **TransactionService**: Coordina el manejo de comandos, proyección de eventos y almacenamiento de eventos.

## Flujo de la Aplicación

1. **Crear y Ejecutar Comando**:
   - Se crea una instancia de `TransactionService`.
   - Se crea un comando `CreateTransactionCommand`.
   - Se ejecuta el comando usando `serviceAccounting.execute(commandAccounting)`.

2. **Generar Evento**:
   - El `CreateTransactionCommandHandler` procesa el comando y genera un `TransactionCreatedEvent`.

3. **Actualizar Estado**:
   - El `TransactionProjector` actualiza el estado del balance de la cuenta basado en el evento generado.

4. **Almacenar Evento**:
   - El `TransactionLocalEventStore` almacena el evento generado.

