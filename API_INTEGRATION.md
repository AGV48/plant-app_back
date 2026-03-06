# PlantApp Backend - Integración de APIs

## 🌟 Resumen de Cambios

### ✅ Enfermedades Expandidas
- **Antes**: 22 enfermedades
- **Ahora**: 44 enfermedades reales y comunes
- Incluye: fungi, bacterias, virus, plagas, deficiencias nutricionales

### 🔌 APIs Integradas

#### 1. **Perenual API** - Plantas Reales
- Base de datos de ~10,000 especies de plantas
- Información detallada: cuidados, luz, agua, temperatura
- Imágenes reales de alta calidad
- **Límite gratuito**: 300 requests/día

#### 2. **Pexels API** - Imágenes de Enfermedades
- Búsqueda automática de imágenes por enfermedad
- Imágenes de alta calidad sin marca de agua
- **Límite gratuito**: 200 requests/hora

## 🔑 Obtener API Keys Gratuitas

### Perenual API Key

1. Ve a: https://perenual.com/docs/api
2. Haz clic en "Get API Key" o "Sign Up"
3. Completa el registro (email, nombre)
4. Copia tu API key (formato: `sk-XXXXXXXXXXXX`)
5. Pégala en el archivo `.env`:
   ```
   PERENUAL_API_KEY=tu_key_aqui
   ```

### Pexels API Key

1. Ve a: https://www.pexels.com/api/
2. Haz clic en "Get Started"
3. Inicia sesión o crea cuenta
4. Ve a tu dashboard
5. Copia tu API key
6. Pégala en el archivo `.env`:
   ```
   PEXELS_API_KEY=tu_key_aqui
   ```

## 📡 Nuevos Endpoints

### Plantas Locales (Base de datos en memoria)

```bash
# Listar todas las plantas locales
GET http://localhost:3000/api/plants/local

# Obtener planta local por ID
GET http://localhost:3000/api/plants/local/:id

# Obtener enfermedades de una planta local
GET http://localhost:3000/api/plants/local/:id/diseases
```

### Plantas Externas (Perenual API)

```bash
# Listar plantas de la API externa
GET http://localhost:3000/api/plants/external/list?page=1&per_page=30

# Buscar plantas por nombre
GET http://localhost:3000/api/plants/external/search?q=tomato&page=1

# Obtener detalles de planta externa
GET http://localhost:3000/api/plants/external/:id

# Obtener guía de cuidados
GET http://localhost:3000/api/plants/external/:id/care
```

### Endpoint Unificado

```bash
# Local (por defecto)
GET http://localhost:3000/api/plants?source=local

# Externa
GET http://localhost:3000/api/plants?source=external

# Ambas
GET http://localhost:3000/api/plants?source=all
```

### Enfermedades

```bash
# Listar todas las enfermedades (ahora 44)
GET http://localhost:3000/api/diseases

# Filtrar por tipo
GET http://localhost:3000/api/diseases?type=fungal
GET http://localhost:3000/api/diseases?type=pest
GET http://localhost:3000/api/diseases?type=bacterial
GET http://localhost:3000/api/diseases?type=viral
GET http://localhost:3000/api/diseases?type=deficiency

# Obtener enfermedad por ID
GET http://localhost:3000/api/diseases/:id
```

### Gestión de Caché

```bash
# Ver estadísticas de caché
GET http://localhost:3000/api/plants/cache/stats

# Limpiar caché
POST http://localhost:3000/api/plants/cache/clear
```

## 🎯 Ejemplos de Uso

### JavaScript/TypeScript (Frontend)

```typescript
// Obtener plantas locales
const localPlants = await fetch('http://localhost:3000/api/plants/local');
const plants = await localPlants.json();

// Buscar plantas externas
const searchPlants = await fetch('http://localhost:3000/api/plants/external/search?q=rose');
const results = await searchPlants.json();

// Obtener todas las enfermedades
const diseases = await fetch('http://localhost:3000/api/diseases');
const allDiseases = await diseases.json();
console.log(`Total de enfermedades: ${allDiseases.length}`); // 44

// Filtrar enfermedades por tipo
const fungalDiseases = await fetch('http://localhost:3000/api/diseases?type=fungal');
const fungal = await fungalDiseases.json();
```

### cURL (Línea de comandos)

```bash
# Listar enfermedades
curl http://localhost:3000/api/diseases

# Buscar plantas
curl "http://localhost:3000/api/plants/external/search?q=tomato"

# Ver caché
curl http://localhost:3000/api/plants/cache/stats
```

## 🏗️ Arquitectura

```
Backend (NestJS)
├── PlantsService (Local)
│   ├── 18 plantas locales
│   └── 44 enfermedades reales
│
├── PerenualService (Externa)
│   ├── ~10,000 plantas
│   ├── Sistema de caché (24h TTL)
│   └── Rate limiting automático
│
└── PexelsService (Imágenes)
    ├── Búsqueda de imágenes
    ├── Sistema de caché (24h TTL)
    └── Fallback a URLs locales
```

## ⚙️ Configuración del Caché

El sistema de caché reduce llamadas a las APIs externas:

- **TTL (Time To Live)**: 24 horas por defecto
- **Configurable** en `.env`:
  ```
  CACHE_TTL_HOURS=24
  ```

## 🚨 Solución de Problemas

### Error: "Perenual API not configured"
- Verifica que `PERENUAL_API_KEY` esté en `.env`
- Confirma que la key sea válida (formato: `sk-XXXX`)

### Error: "Error fetching plants from Perenual API"
- Verifica tu conexión a internet
- Confirma que no hayas excedido el límite (300/día)
- Verifica que la API key sea válida

### Error 404 de Perenual
- La API key de ejemplo no es válida
- Obtén tu propia key gratuita en perenual.com

## 📊 Tipos de Enfermedades Incluidas

- **Fungal** (23): Royas, mildius, manchas foliares, pudriciones
- **Pest** (10): Ácaros, pulgones, cochinillas, trips, orugas
- **Bacterial** (4): Marchitez bacteriana, fuego bacteriano, cancros
- **Viral** (2): Virus del mosaico
- **Deficiency** (5): Nitrógeno, hierro, magnesio, calcio, potasio

## 🎓 Ejemplos de Enfermedades Reales

- ✅ Pudrición de Raíz (root-rot)
- ✅ Tizón Tardío (late-blight) - Causó la Gran Hambruna Irlandesa
- ✅ Oídio (powdery-mildew)
- ✅ Roya (rust)
- ✅ Ácaros Araña (spider-mites)
- ✅ Pulgones (aphids)
- ✅ Antracnosis (anthracnose)
- ✅ Trips (thrips)
- ✅ Fusarium Wilt (fusarium-wilt)
- ✅ Verticillium Wilt (verticillium-wilt)
- Y 34 más...

## 📝 Notas Adicionales

- Las plantas locales permanecen disponibles siempre
- Las plantas externas requieren API key válida
- Si las APIs externas fallan, la app sigue funcionando con datos locales
- El caché mejora el rendimiento y reduce llamadas a las APIs
- Todas las enfermedades tienen descripciones detalladas, síntomas, tratamiento y prevención

## 🔄 Actualizar API Keys

1. Abre `.env` en `plant-app_back/`
2. Actualiza las keys:
   ```
   PERENUAL_API_KEY=tu_nueva_key
   PEXELS_API_KEY=tu_nueva_key
   ```
3. Reinicia el servidor: `npm run start:dev`

## 📦 Dependencias Nuevas

- `@nestjs/config` - Gestión de variables de entorno
- `@nestjs/axios` - Cliente HTTP para NestJS
- `axios` - Peticiones HTTP
