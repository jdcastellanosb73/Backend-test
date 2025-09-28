# Backend-test
test backend for Crosspay Solutions S.A.S.


![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-4.x-black?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-blue?logo=postgresql)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)


##  Funcionalidades

-  **Autenticación segura** con JWT (login de usuarios).
-  **Gestión de tarjetas**: registro, listado y eliminación.
- **Flujo de transacciones**: crear pagos con tarjeta (simulación).
-  **Seguridad**: cada usuario solo ve y gestiona sus propias tarjetas y transacciones.
-  **Panel de usuario**: historial de transacciones con filtros (fecha, tipo, categoría).
- **Eliminación segura**: no se pueden borrar transacciones de otros usuarios.


## Tecnologías utilizadas

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Backend** | Node.js + Express | Ideal para APIs REST, alto rendimiento y ecosistema maduro. |
| **Base de datos** | PostgreSQL | Soporte para JSON, transacciones ACID y escalabilidad. |
| **Autenticación** | JWT (JSON Web Tokens) | Estadoless, seguro y ampliamente adoptado para APIs. |
| **Encriptación** | `bcrypt` | Hash seguro de contraseñas antes de guardar en BD. |
| **Validación** | Validación manual en controladores | Control total sobre los datos de entrada. |



##  Instalación y configuración

### Requisitos previos
- Node.js v18+
- PostgreSQL 13
- Git


1. **Clona el repositorio**
   ```bash
   git clone https://github.com/jdcastellanosb73/Backend-test.git
   cd Backend-test
2. **Instala dependencias**
   ```bash
   npm install
3. **correr el repositorio**
   ```bash
   npm run dev
```
src/
├── controllers/    # Lógica de manejo de peticiones
├── services/       # Lógica de negocio
├── routes/         # Definición de endpoints
├── middleware/     # Autenticación y validación
├── config/         # Conexión a PostgreSQL
├── app.js          # Configuración principal de Express, carga rutas y middleware.
└── server.js       # Arranca el servidor```


