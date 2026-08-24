# ReloCompass for Android

Native Android client for **ReloCompass** — the AI-powered relocation platform
(visas, housing, jobs abroad with visa sponsorship, and an AI assistant that
cites its sources).

- **Language:** Kotlin
- **UI:** Jetpack Compose + Material 3 (light + dark)
- **Min SDK:** 24 (Android 7.0) · **Target SDK:** 34
- **Networking:** Retrofit 2 + OkHttp 4 + Gson
- **Persistence:** Jetpack DataStore (token + session)
- **Backend:** the deployed FastAPI service (`/api` — jobs, auth, users, chat)

## Features

| Area | What you get |
|---|---|
| Auth | Register (student / job seeker / employer), login, token restore on app start, logout |
| Dashboard | Role-aware greeting and quick actions |
| AI Assistant | RAG chat with the live assistant, multi-turn sessions, source citations under replies |
| Jobs | Search board with `q` / location / visa-sponsorship filters, job detail, one-tap apply with optional cover letter |
| Applications | Status tracking (pending → reviewed → shortlisted → accepted/rejected) |
| Employer Portal | Post jobs, view applicants with profiles + cover letters, change application status, delete listings |
| Profile | Update name, phone, destination country/city, bio (feeds the assistant's context) |

## Build & run

> The Gradle wrapper JAR isn't checked in (binary). On first open, Android
> Studio generates it automatically; or run `gradle wrapper --gradle-version 8.7`
> once inside `android/`. A wrapper `gradlew` script is included.

1. Open the `android/` folder in **Android Studio** (Ladybug or newer).
2. Let Gradle sync (wrapper properties pin Gradle 8.7 / AGP 8.5.2).
3. Run the `app` configuration on a device or emulator.

The app points at the hosted backend by default. To build against a different
deployment (e.g. a local machine running the FastAPI server on
`http://10.0.2.2:8000` for the Android emulator), add to `local.properties`:

```properties
API_BASE_URL=http://10.0.2.2:8000
```

or override on the command line:

```bash
./gradlew assembleDebug -PapiBaseUrl=http://10.0.2.2:8000
```

## Tests

```bash
./gradlew testDebugUnitTest
```

- `ErrorsTest` — FastAPI error envelopes flatten into readable messages.
- `DtoContractTest` — pins the snake_case JSON contract the backend returns,
  so a field rename fails the build instead of silently breaking the app.

## Project layout

```
android/
├── app/src/main/java/com/relocompass/app/
│   ├── MainActivity.kt        # boot: ApiClient init + Compose root
│   ├── api/                   # Retrofit interfaces, DTOs, error mapping
│   ├── data/                  # TokenStore (DataStore), SessionViewModel
│   └── ui/
│       ├── ReloApp.kt         # auth gate + navigation
│       ├── theme/             # brand palette, Material 3 schemes
│       ├── components/        # AppScaffold, pills, buttons, bottom bar
│       └── screens/           # auth, dashboard, assistant, jobs,
│                             # applications, employer, profile
└── app/src/test/              # JVM unit tests (error + DTO contract)
```

## Demo accounts (hosted backend)

| Role | Email | Password |
|---|---|---|
| Student | student@relocompass.org | Student@12345 |
| Job seeker | jobseeker@relocompass.org | JobSeeker@12345 |
| Employer | employer@relocompass.org | Employer@12345 |
| Admin | admin@relocompass.org | Admin@12345 |

The login screen shows one-tap chips for the first three.

## Notes

- HTTPS only — `usesCleartextTraffic="false"`. For emulator development against
  a local backend, use an HTTPS tunnel (e.g. `ngrok http 8000`) as the
  `API_BASE_URL` rather than `http://10.0.2.2:8000`, or add a
  `network_security_config.xml` permitting cleartext to that host for debug
  builds only.
- **Release signing:** generate a keystore (`keytool -genkeypair …`) and wire
  `signingConfigs.release` in `app/build.gradle.kts` from `local.properties`
  before shipping a signed APK/AAB. Debug builds run unsigned as usual.
- The API token is stored in app-private DataStore (backup disabled via
  `allowBackup="false"`) and attached by an OkHttp interceptor; logout clears it.
- Release builds enable R8 minification; keep rules for Retrofit/Gson live in
  `app/proguard-rules.pro`.
