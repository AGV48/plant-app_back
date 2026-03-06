# 🚀 Deploy del Backend - PlantApp

## Opción Recomendada: Railway.app

### 1️⃣ Preparar el Repositorio

Asegúrate de tener en tu repo:
- ✅ `.env.example` (sin keys reales)
- ✅ `.gitignore` (excluye `.env`, `node_modules`, `dist`)
- ✅ `package.json` con scripts de build

### 2️⃣ Crear Cuenta en Railway

1. Ve a https://railway.app
2. Sign up con GitHub
3. Click "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Selecciona tu repositorio del backend

### 3️⃣ Configurar Variables de Entorno

En el dashboard de Railway, ve a "Variables" y agrega:

```
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tu-frontend.vercel.app
PERENUAL_API_KEY=sk-exLE69aa5a751646615239
PEXELS_API_KEY=563492ad6f917000010000011234567890abcdef1234567890abcdef
CACHE_TTL_HOURS=24
```

⚠️ **IMPORTANTE**: Reemplaza `CORS_ORIGIN` con la URL real de tu frontend cuando lo despliegues.

### 4️⃣ Deploy

Railway detecta automáticamente Node.js y ejecuta:
- Build: `npm install && npm run build`
- Start: `npm run start:prod`

El deploy tarda ~2-3 minutos.

### 5️⃣ Obtener URL del Backend

Una vez desplegado, Railway te da una URL como:
```
https://plantapp-production.up.railway.app
```

Tu API estará en:
```
https://plantapp-production.up.railway.app/api/ping
https://plantapp-production.up.railway.app/api/plants/local
https://plantapp-production.up.railway.app/api/diseases
```

### 6️⃣ Probar

```bash
curl https://tu-url.railway.app/api/ping
# Debería responder: OK

curl https://tu-url.railway.app/api/plants/local
# Debería responder con JSON de plantas
```

---

## Opción Alternativa: Render.com

### Pasos:

1. Ve a https://render.com
2. New → Web Service
3. Conecta tu repositorio
4. Configuración:
   - **Name**: plantapp-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

5. Agregar variables de entorno (igual que Railway)

6. Click "Create Web Service"

---

## Opción Alternativa: Heroku

⚠️ Heroku ya no tiene plan gratuito ($7/mes mínimo)

```bash
# Instalar Heroku CLI
# Windows: descargar de heroku.com/cli

# Login
heroku login

# Crear app
heroku create plantapp-backend

# Configurar variables
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://tu-frontend.com
heroku config:set PERENUAL_API_KEY=tu-key
heroku config:set PEXELS_API_KEY=tu-key

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

---

## 📋 Checklist Post-Deploy

- [ ] Backend desplegado exitosamente
- [ ] URL del backend anotada
- [ ] `/api/ping` responde "OK"
- [ ] `/api/health` responde con JSON
- [ ] `/api/plants/local` responde con plantas
- [ ] `/api/diseases` responde con enfermedades
- [ ] Variables de entorno configuradas
- [ ] Logs sin errores
- [ ] CORS configurado (actualizar cuando tengas frontend desplegado)

---

## 🐛 Troubleshooting

**Error: "Cannot find module"**
- Solución: Verificar que `package.json` tenga todas las dependencias

**Error: "Port already in use"**
- Solución: Railway asigna el puerto automáticamente, no setear PORT manualmente

**Error: Build falla**
- Solución: Probar build local primero: `npm run build`

**Error: "Perenual API not configured"**
- Solución: Verificar que PERENUAL_API_KEY esté en las variables de entorno

---

## 💰 Costos

- **Railway**: $5/mes (500 horas, suficiente para hobby)
- **Render**: Gratis (con sleep después de inactividad)
- **Heroku**: ~$7/mes

---

## ⏭️ Siguiente Paso

Una vez que tu backend esté desplegado y funcionando:

1. Copia la URL (ej: `https://plantapp.railway.app`)
2. Ve a desplegar el frontend
3. Configura esa URL en el frontend
4. Regresa aquí y actualiza `CORS_ORIGIN` con la URL del frontend
