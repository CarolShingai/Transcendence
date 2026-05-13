# CONTRIBUTIONS SUMMARY - TRANSCENDENCE PROJECT

## 👥 CONTRIBUTIONS BY DEVELOPER

### 1. BARBARA BISCHAIN (@barbarabischain)

#### What she did:
- **🎮 Game Development**
  - Implementation of game entities (enemies: Fire, Carcará, Libelula, Hárpia, Tirannus)
  - Character animations and sprites
  - Map system (Cerrado, Mataatlântica, Amazonas)
  - Player image movement fixes
  - Removal of redundant game folder
  - Game engine fixes

#### Areas: Frontend/Game (Phaser.js)

---

### 2. CAROL SHINGAI (@CarolShingai)

#### What she did:
- **🔐 Authentication and 2FA**
  - OAuth2 integration with Google
  - Full Two-Factor Authentication (2FA) implementation
  - Automated authentication tests (71 tests)
  - Username, name, and password validation
  - TwoFactorLoginCard components
  - 2FA component improvements
  - Success messages for 2FA setup
  - Improved 2FA styling

- **🔧 Infrastructure and DevOps**
  - Automatic self-signed certificate generation for HTTPS in dev
  - Makefile configuration for HTTPS support
  - Dev/prod environment setup
  - Environment variables (.env)

- **👨‍💼 Friend Management**
  - Backend/frontend friend integration
  - User search endpoint
  - UsersController implementation
  - FriendDTO with profilePic
  - User search functionality
  - Friend identification in search
  - API base URL (HTTPS)

- **🔌 WebSocket and Real-Time Presence**
  - usePresenceWebSocket hook for tracking online users
  - Real-time online/offline status for friends
  - WebSocket integration in App.jsx
  - Frontend WebSocket configuration

- **📋 Miscellaneous Features**
  - Code refactoring
  - Input validation improvements
  - Authentication bug fixes

#### Areas: Backend (Auth/Controllers) + Frontend (Auth/Components/WebSocket)

---

### 3. LUANA R (@luana-r)

#### What she did:
- **📊 Monitoring and Observability**
  - Prometheus and Grafana implementation
  - Spring Boot Actuator integration
  - Infrastructure dashboards (CPU, memory)
  - Configured datasources

- **👥 Friend Improvements**
  - Improved friend invite display
  - Pending invite status
  - App footer with privacy policy

- **🔧 Infrastructure**
  - Makefile path corrections

#### Areas: Backend (Monitoring) + Frontend (UI)

---

### 4. THIAGO SANTANA DANTAS CAVALCANTE (@Thiagosdcavalcante)

#### What he did:
- **🎮 Game System**
  - Implementation of multiple game scenes (Cerrado, Mataatlântica, GameScene)
  - HUD system (display of lives, score, power-ups)
  - Enemy collision mechanics (harpies, carcarás)
  - MenuScene and SettingsScene
  - Match reporting and registration implementation
  - Match history and ranked leaderboard integration

- **👥 Friend System**
  - Complete friend management integration (frontend/backend)
  - Remote user search with debouncing
  - Send, accept, and reject friend invites
  - Friend avatar display
  - FriendsSearch, HomeFriendsCard, PublicProfileCard components
  - Friend sorting by nickname/name
  - Duplicate invite handling

- **Ranking and User Profile**
  - Ranked player leaderboard
  - Public profile components (PublicProfileCard, PublicProfileHeader)
  - Best score and ranked position display
  - Match history data integration
  - 4xx and 5xx error pages

#### Areas: Backend (Match/Maps) + Frontend (UI/Game/Friends)

---

## 📈 SUMMARY BY AREAS

### 🎮 Game/Frontend-Game
- **Thiago:** Scenes, HUD, match reporting, leaderboards
- **Barbara:** Entities, sprites, maps, animations

### 👥 Friend System
- **Thiago:** Search, UI, components, integration
- **Carol:** Backend (controller/service), API, WebSocket
- **Luana:** UX improvements

### 🔐 Authentication/2FA
- **Carol:** OAuth2, 2FA backend, validations, 2FA components

### 📊 DevOps/Infrastructure
- **Luana:** Monitoring (Prometheus, Grafana)
- **Carol:** HTTPS, Makefile, certificates

## 🎯 PROJECT HIGHLIGHTS

✅ **Architecture:** Backend (Kotlin/Spring Boot) + Frontend (React) + Game (Phaser.js)

✅ **Main Features:**
- Complete authentication system (OAuth2 + 2FA)
- Real-time friend management (WebSocket)
- Educational game with multiple scenes
- Ranking and match history
- Production monitoring (Prometheus/Grafana)

✅ **Quality:**
- 71 automated tests
- Robust input validation
- HTTPS in development
- Error handling (4xx/5xx)

---
