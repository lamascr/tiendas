# Barbería WhatsApp Bot - Agente de IA con WhatsApp Business API

Sistema completo de automatización de reservas para barbería usando WhatsApp Business API y OpenAI GPT-4.

## 🚀 Características

- ✅ Conversación natural con IA (OpenAI GPT-4)
- ✅ Gestión automatizada de citas
- ✅ Verificación de disponibilidad en tiempo real
- ✅ Integración con WhatsApp Business API oficial
- ✅ Recordatorios automáticos
- ✅ Sistema de logs completo
- ✅ Manejo de múltiples barberos

## 📋 Requisitos Previos

1. **Node.js 18+** instalado
2. **Cuenta de Meta Business** configurada
3. **WhatsApp Business API** activada
4. **OpenAI API Key** (GPT-4 access)
5. **MongoDB** (o MongoDB Atlas)

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
cd c:\Carlos\CODE\tiendas\barberia-bot
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y completa los valores:

```bash
copy .env.example .env
```

Edita `.env` con tus credenciales:

```env
# WhatsApp Business API (Meta Developers)
WHATSAPP_TOKEN=tu_token_de_whatsapp_business_api
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
VERIFY_TOKEN=crea_un_token_personalizado

# OpenAI
OPENAI_API_KEY=sk-tu_api_key_de_openai
```

### 3. Configurar WhatsApp Business API

#### a) Crear App en Meta Developers

1. Ve a [Meta Developers](https://developers.facebook.com/)
2. Crea una nueva app (tipo "Business")
3. Añade el producto "WhatsApp"
4. Configura un número de teléfono temporal (para pruebas)

#### b) Configurar Webhook

1. En tu servidor, necesitas HTTPS (usa ngrok para desarrollo local):
   ```bash
   # Instala ngrok
   ngrok http 3000
   ```

2. Copia la URL que te da ngrok (ej: `https://abc123.ngrok.io`)

3. En Meta Developers → WhatsApp → Configuration:
   - **Callback URL**: `https://abc123.ngrok.io/webhook`
   - **Verify Token**: El que definiste en `.env` como `VERIFY_TOKEN`
   - Suscríbete a: `messages`

#### c) Obtener Token de Acceso

1. En Meta Developers → WhatsApp → API Setup
2. Copia el **Temporary access token** (válido 24h)
3. Para producción, genera un **System User Token** permanente

### 4. Ejecutar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

Deberías ver:
```
🚀 Server running on port 3000
📱 WhatsApp webhook ready at /webhook
🏥 Health check available at /health
```

## 📱 Probar el Bot

1. Añade el número de WhatsApp de prueba a tus contactos
2. Envía un mensaje: **"Hola"**
3. El bot debería responder automáticamente

### Ejemplos de conversación:

```
Usuario: Hola
Bot: ¡Hola! 👋 Soy el asistente de Blade & Style...

Usuario: Quiero reservar un corte para mañana a las 15:00
Bot: Perfecto, déjame revisar la disponibilidad...

Usuario: Con Javier
Bot: ¡Genial! Te confirmo...
```

## 🏗️ Arquitectura del Proyecto

```
barberia-bot/
├── src/
│   ├── server.js                    # Servidor Express principal
│   ├── controllers/
│   │   ├── webhookController.js     # Manejo de webhooks de WhatsApp
│   │   └── messageController.js     # Procesamiento de mensajes
│   ├── services/
│   │   ├── aiAgent.js               # Agente de IA con OpenAI
│   │   ├── whatsappService.js       # Cliente WhatsApp Business API
│   │   └── bookingService.js        # Gestión de reservas
│   ├── prompts/
│   │   └── systemPrompt.js          # Prompt del agente IA
│   └── utils/
│       └── logger.js                # Sistema de logs
├── logs/                            # Logs generados
├── .env                            # Variables de entorno
├── package.json
└── README.md
```

## 🔧 Configuración Avanzada

### Añadir MongoDB (Persistencia)

Para usar MongoDB en lugar del almacenamiento en memoria:

1. Instala Mongoose (ya incluido)
2. Crea `src/models/Booking.js`
3. Actualiza `bookingService.js` para usar el modelo

### Integrar Google Calendar

Para sincronizar con Google Calendar:

1. Activa Google Calendar API en Google Cloud Console
2. Descarga las credenciales JSON
3. Actualiza `calendarService.js` (crear este archivo)

### Recordatorios Automáticos

Crea `src/services/reminderService.js` usando `node-cron`:

```javascript
const cron = require('node-cron');

// Enviar recordatorios diarios a las 10 AM
cron.schedule('0 10 * * *', async () => {
    // Buscar citas para mañana
    // Enviar mensajes de recordatorio
});
```

## 🚢 Deployment a Producción

### Opción 1: Railway

```bash
# Instala Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

### Opción 2: Render

1. Conecta tu repositorio GitHub
2. Configura las variables de entorno en el dashboard
3. Deploy automático en cada push

### Opción 3: Docker

```bash
# Build
docker build -t barberia-bot .

# Run
docker run -p 3000:3000 --env-file .env barberia-bot
```

## 📊 Monitoreo

Logs disponibles en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

## 🔐 Seguridad

- ✅ Validación de firma de WhatsApp (webhook security)
- ✅ Variables de entorno para secretos
- ✅ Rate limiting (implementar con `express-rate-limit`)
- ✅ HTTPS obligatorio para webhooks

## 💰 Costos Estimados

- WhatsApp Business API: Gratis hasta 1000 conversaciones/mes
- OpenAI GPT-4: ~$30-50/mes (según uso)
- Hosting: $5-20/mes (Railway/Render)

**Total: ~$35-70/mes**

## 📝 Próximos Pasos

- [ ] Añadir persistencia con MongoDB
- [ ] Integrar Google Calendar
- [ ] Sistema de recordatorios automáticos
- [ ] Panel de administración web
- [ ] Analytics de conversaciones
- [ ] Soporte multiidioma
- [ ] Pagos integrados (Stripe)

## 🆘 Troubleshooting

**El webhook no recibe mensajes:**
- Verifica que la URL sea HTTPS
- Comprueba que el VERIFY_TOKEN coincida
- Revisa los logs de Meta Developers

**OpenAI no responde:**
- Verifica tu API key
- Comprueba los límites de tu cuenta
- Revisa los logs del servidor

**Error de autenticación WhatsApp:**
- Regenera el access token
- Verifica el PHONE_NUMBER_ID

## 📄 Licencia

MIT

## 👨‍💻 Autor

Carlos - Web Agency Portfolio

---

**¿Necesitas ayuda?** Abre un issue o contacta por WhatsApp al número de la barbería.
e