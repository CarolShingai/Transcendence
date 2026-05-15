*This project has been created as part of the 42 curriculum by babischa, cshingai, lsouza-r, tsantana*

# Transcendence

A full-stack web application featuring real-time gaming, user authentication, social networking, and comprehensive monitoring infrastructure.

## 📋 Description

### Project Overview

Transcendence is an educational game platform built with a modern tech stack, featuring a game integrated with social features. The project combines a Kotlin/Spring Boot backend, a React frontend, and a Phaser.js game engine to create an engaging learning experience about Brazilian ecosystems through interactive gameplay.

### Key Features

- **🎮 Interactive Game Engine**: Multiple game scenes with collision detection, HUD system, and scoring mechanics powered by Phaser.js
- **🔐 Enterprise-Grade Authentication**: OAuth2 integration with Google and Two-Factor Authentication (2FA) using TOTP
- **👥 Real-Time Social Features**: Friend management system with live online/offline status tracking via WebSocket
- **🏅 Competitive Ranking System**: Ranked ladder with match history and player leaderboards
- **📊 Production Monitoring**: Prometheus metrics collection and Grafana dashboards for infrastructure monitoring
- **🛡️ Secure Infrastructure**: HTTPS support, environment-based configuration, automated certificate generation

---

## 🏗️ Technical Stack

### Frontend
- **Framework**: React 18
- **Game Engine**: Phaser 3 (educational game with multiple scenes)
- **Real-Time Communication**: WebSocket for presence tracking and friend status
- **Styling**: CSS3 with responsive design
- **HTTP Client**: Axios with HTTPS support

### Backend
- **Language**: Kotlin
- **Framework**: Spring Boot 4.x
- **Authentication**: Spring Security with OAuth2 and JWT
- **Testing**: JUnit 5, Mockito (71 comprehensive integration tests)
- **Database Migration**: Flyway
- **API**: RESTful endpoints with proper error handling

### Database
- **Primary**: MySQL 
- **Choice Rationale**: Relational structure fits the user/friend/match model perfectly; ACID compliance ensures data integrity for authentication and ranking systems
- **Persistence Layer**: JPA/Hibernate

### Infrastructure & Monitoring
- **Monitoring**: Prometheus + Grafana
- **Metrics Exposure**: Spring Boot Actuator
- **Infrastructure Visualization**: CPU and memory dashboards
- **Containerization**: Docker with Docker Compose
- **Security**: SSL/TLS certificates with HTTPS support

### Development Tools
- **Build System**: Gradle (Kotlin DSL)
- **Version Control**: Git with feature-branch workflow
- **API Testing**: MockMvc integration tests
- **Build Automation**: Makefile for simplified operations

---

## 👥 Team Information

### Carol Shingai (cshingai)
**Roles**: Tech Lead, Backend Developer  
**Responsibilities**:
- Core authentication system design and implementation
- OAuth2 integration with Google
- Two-Factor Authentication (2FA) implementation
- Spring Security configuration
- API endpoint design for user management
- Writing and maintaining backend test suite (71 tests)
- Environment configuration and deployment setup

### Thiago Cavalcante (tsantana)
**Roles**: Full-Stack Developer, Frontend Developer  
**Responsibilities**:
- game architecture and implementation
- All game scenes (Cerrado, Mataatlântica, GameScene, MenuScene, SettingsScene)
- HUD system and collision mechanics
- Match reporting and ranking system
- User search and friend management features (both backend and frontend)
- Profile system (public profiles with ranking display)
- Error handling pages (4xx/5xx)
- Backend controllers for matches and user management

### barbara Bischain (babischa)
**Roles**: Product Owner, Game Developer  
**Responsibilities**:
- Game entity implementation (Tyrannus, Hárpia, Carcará, Libelula, Fire enemies)
- Sprite creation and animation systems
- Game map design and implementation
- Visual mechanics and player movement
- Game engine bug fixes and optimizations

### luana Ribeiro (lsouza-r)
**Roles**: Project Manager, DevOps & Infrastructure Developer  
**Responsibilities**:
- Production monitoring infrastructure setup (Prometheus + Grafana)
- Spring Boot Actuator integration
- Infrastructure dashboard creation
- Docker and Docker Compose configuration
- Friend invite UI improvements
- Privacy Policy and Terms of Use components
- Build and deployment pipeline optimization

---

## 📊 Project Management

### Work Organization
- **Workflow**: Feature-branch based development with Pull Requests
- **Task Distribution**: Features assigned based on expertise (frontend, backend, game, infrastructure)
- **Development Cycle**: 6-day sprint with daily integration
- **Code Review**: All changes reviewed via GitHub Pull Requests before merging

### Tools Used
- **Version Control**: GitHub with protected main branch
- **Issue Tracking**: GitHub Issues for feature planning
- **Project Board**: GitHub Projects for task management
- **CI/CD**: GitHub Actions (configured for test automation)

### Communication Channels
- **Primary**: GitHub Issues and Pull Request discussions
- **Synchronous**: In-person daily standups during development
- **Documentation**: Commit messages and PR descriptions for asynchronous communication

---

## 🎮 Features List

### Authentication & Security
| Feature | Developer | Description |
|---------|-----------|-------------|
| OAuth2 Login | CarolShingai | Google OAuth2 integration with redirect-based flow |
| Two-Factor Authentication | CarolShingai | TOTP-based 2FA with QR code generation |
| JWT Tokens | CarolShingai | Secure token-based session management |
| Password Validation | CarolShingai | Enforced strong password requirements (uppercase, lowercase, digit, special char, min 8 chars) |
| Username/Nickname Validation | CarolShingai | Input validation with character and length constraints |

### Game System
| Feature | Developer | Description |
|---------|-----------|-------------|
| Multiple Game Scenes | Thiagosdcavalcante, barbarabischain | Cerrado, Mataatlântica, Amazonas map implementation |
| Game Entities | barbarabischain | Enemy groups (Hárpia, Carcará, Libelula, Fire, Tyrannus) |
| Collision Detection | Thiagosdcavalcante, barbarabischain | Enemy collision mechanics with scoring |
| HUD System | Thiagosdcavalcante | Real-time display of lives, score, power-ups |
| Match Reporting | Thiagosdcavalcante | Match result registration to backend |
| Match History | Thiagosdcavalcante | Player match history retrieval and display |
| Settings Screen | Thiagosdcavalcante | Game configuration options |

### Social Features
| Feature | Developer | Description |
|---------|-----------|-------------|
| User Search | Thiagosdcavalcante, CarolShingai | Search users by name or nickname with debouncing |
| Friend Requests | Thiagosdcavalcante, CarolShingai | Send, accept, reject friend invitations |
| Friend List | Thiagosdcavalcante | Display user's friends with sorting by nickname |
| Real-Time Presence | CarolShingai | WebSocket-based online/offline status tracking |
| Public Profiles | Thiagosdcavalcante | View other players' profiles with stats |
| Friend Avatars | Thiagosdcavalcante, CarolShingai | Display profile pictures in friend lists |

### Ranking System
| Feature | Developer | Description |
|---------|-----------|-------------|
| Ranked Leaderboard | Thiagosdcavalcante | Global player ranking based on match results |
| Best Score Display | Thiagosdcavalcante | Show player's highest ranked score |
| Ranked Position | Thiagosdcavalcante | Display current ranking position |
| Match Statistics | Thiagosdcavalcante | Win/loss record and match history |

### Infrastructure & Monitoring
| Feature | Developer | Description |
|---------|-----------|-------------|
| Prometheus Integration | luana-r | Metrics collection and exposure |
| Grafana Dashboards | luana-r | CPU and memory usage visualization |
| Spring Boot Actuator | luana-r | Application health and metrics endpoints |
| HTTPS Support | CarolShingai | SSL/TLS certificate generation and configuration |
| Environment Configuration | CarolShingai | Dev/prod configuration with environment variables |
| Privacy Policy | luana-r | Legal compliance documentation |

### UI/UX
| Feature | Developer | Description |
|---------|-----------|-------------|
| Error Pages | Thiagosdcavalcante | Custom 4xx and 5xx error handling pages |
| Profile Edit | CarolShingai | User can modify name, nickname, profile picture |
| Two-Factor Setup UI | CarolShingai | Interactive 2FA setup with QR code display |
| Responsive Design | Thiagosdcavalcante | Mobile and desktop compatible layout |

---

## 📦 Database Schema

### Core Tables

```
Users
├── id (PK)
├── email (UNIQUE)
├── password (hashed)
├── nickname (UNIQUE)
├── name
├── profile_picture_url
├── two_factor_enabled
└── timestamps

Friendships
├── id (PK)
├── requester_id (FK -> Users)
├── receiver_id (FK -> Users)
├── status (PENDING, ACCEPTED, REJECTED)
└── created_at

Matches
├── id (PK)
├── player_1_id (FK -> Users)
├── player_2_id (FK -> Users)
├── winner_id (FK -> Users, nullable)
├── map_id (FK -> Maps)
├── match_date
└── score_data (JSON)

Maps
├── id (PK)
├── name
├── description
└── created_at

Rankings
├── id (PK)
├── user_id (FK -> Users, UNIQUE)
├── position
├── wins
├── losses
└── best_score
```

### Key Relationships
- **Users ↔ Friendships**: One user can have many friend requests (both sent and received)
- **Users ↔ Matches**: One user can participate in many matches
- **Matches ↔ Maps**: Multiple matches can use the same map
- **Users ↔ Rankings**: One-to-one relationship with a dedicated ranking record
- **Users ↔ Recovery Codes**: One user can have multiple 2FA recovery codes

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        BIGINT id PK
        VARCHAR nickname
        VARCHAR name
        VARCHAR email
        VARCHAR username
        VARCHAR password_hash
        INT profile_pic
        VARCHAR status
        BOOLEAN two_factor_enabled
        VARCHAR two_factor_secret_encrypted
        TIMESTAMP two_factor_confirmed_at
        BOOLEAN active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    MAPS {
        BIGINT id PK
        VARCHAR name
    }

    MATCHES {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT map_id FK
        INT score
        INT duration_seconds
        VARCHAR client_match_id
        TEXT metadata
        TIMESTAMP created_at
    }

    FRIENDSHIPS {
        BIGINT id PK
        BIGINT requester_id FK
        BIGINT receiver_id FK
        VARCHAR status
        TIMESTAMP created_at
    }

    RECOVERY_CODES {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR code
        BOOLEAN used
        TIMESTAMP created_at
    }

    USERS --o{ MATCHES : "has"
    MAPS --o{ MATCHES : "has"
    USERS --o{ FRIENDSHIPS : "requester"
    USERS --o{ FRIENDSHIPS : "receiver"
    USERS ||--o{ RECOVERY_CODES : "owner"
```

---

## 🎯 Modules

### Overview
The project implements a comprehensive set of modules to achieve **18 points** total, exceeding the 14-point minimum requirement for the 42 curriculum ft_transcendence project.

### Module Breakdown

#### Major Modules (2 points each)

| Module | Developer | Status | Implementation Details |
|--------|-----------|--------|-------------------------|
| **Use a framework for both frontend and backend** | cshingai, tsantana | ✅ Complete | React 18 (Frontend) + Spring Boot 4.x (Backend) with full-stack integration |
| **Real-time features using WebSockets** | tsantana, cshingai | ✅ Complete | Friend presence tracking, online/offline status updates, real-time notifications |
| **Public API with 5+ endpoints** | cshingai | ✅ Complete | RESTful endpoints: Users (GET/POST), Matches (GET/POST), Friends (GET/DELETE), Rankings (GET), Profiles (GET) |
| **Standard user management & authentication** | cshingai | ✅ Complete | User signup, secure login, profile management, password hashing & salting |
| **Monitoring with Prometheus & Grafana** | lsouza-r | ✅ Complete | Prometheus metrics collection, custom Grafana dashboards (CPU/Memory), alerting rules |

**Major Modules Total: 10 points**

#### Minor Modules (1 point each)

| Module | Developer | Status | Implementation Details |
|--------|-----------|--------|-------------------------|
| **Backend framework** | cshingai | ✅ Complete | Spring Boot 4.x with dependency injection, REST controllers, service layer |
| **Frontend framework** | tsantana | ✅ Complete | React 18 with hooks, component composition, state management |
| **ORM for database** | cshingai | ✅ Complete | JPA/Hibernate with automatic entity mapping and relationship management |
| **Browser compatibility support** | tsantana | ✅ Complete | Full support for Chrome, Firefox, Edge; documented in BROWSER_COMPATIBILITY.md |
| **Game statistics & match history** | tsantana, babischa | ✅ Complete | Match tracking, win/loss records, game statistics dashboard, leaderboard integration |
| **OAuth 2.0 authentication** | cshingai | ✅ Complete | Google OAuth2 integration with secure redirect flow and token management |
| **Two-Factor Authentication (2FA)** | cshingai | ✅ Complete | TOTP-based 2FA with QR code generation, recovery codes, time window verification |
| **Game customization options** | babischa | ✅ Complete | Configurable difficulty levels, map selection, power-ups, game settings |

**Minor Modules Total: 8 points**

### Points Calculation
```
Major Modules:  5 × 2 = 10 points
Minor Modules:  8 × 1 =  8 points
────────────────────────────
Total:                  18 points
```

### Module Justifications

**Why These Modules?**
- **Frameworks (Frontend + Backend)**: Essential for building scalable, maintainable applications. React provides component reusability while Spring Boot offers enterprise-grade backend capabilities.
- **WebSockets**: Critical for real-time social features and friend presence tracking, enabling seamless multi-user experiences.
- **Public API**: Enables third-party integrations and provides proper abstraction for frontend-backend communication with rate limiting and security.
- **User Management**: Foundation for all features, requiring secure authentication and proper authorization mechanisms.
- **Monitoring (Prometheus/Grafana)**: Production-ready infrastructure observability for tracking application health and performance metrics.
- **Browser Compatibility**: Ensures accessibility across all major browsers, improving user reach and experience consistency.
- **Game Statistics**: Enhances game engagement through ranking systems and performance tracking.
- **OAuth & 2FA**: Implements enterprise-grade security practices for user authentication and account protection.
- **Game Customization**: Increases game replayability and allows users to tailor their experience to preferences.

---

## 🚀 Instructions

### Prerequisites

**Required Software**:
- Docker & Docker Compose (for full stack deployment)
- Java 21+ (for backend development)
- Node.js 18+ (for frontend development)
- MySQL 8.0+ (if running backend separately)
- Make (for automated commands)

**Recommended**:
- Git
- Gradle 8.x (included as wrapper)
- npm or yarn (for frontend package management)

### Environment Setup

1. **Clone the repository**:
```bash
git clone <repository-url>
cd trans_github
```

2. **Create environment files**:

Create `.env` in the project root:
```bash
# Frontend Configuration
REACT_APP_API_BASE_URL=https://localhost:8082/api
REACT_APP_WS_URL=wss://localhost:8082/ws

# Backend Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/transcendence
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=password
SPRING_JPA_HIBERNATE_DDL_AUTO=validate

# OAuth2 Configuration
OAUTH2_GOOGLE_CLIENT_ID=<your-client-id>
OAUTH2_GOOGLE_CLIENT_SECRET=<your-client-secret>
APP_FRONTEND_BASE_URL=https://localhost:3000

# JWT Configuration
JWT_SECRET=<your-jwt-secret-key>
JWT_EXPIRATION=86400000

# Monitoring
MONITORING_ENABLED=true
```

3. **Generate SSL certificates** (for HTTPS):
```bash
make cert
```

**Developer Helpers**

- `make cert`: generate local PKCS12 keystore for HTTPS (dev).
- `make clean-legacy`: remove legacy containers from older compose runs that may hold fixed names or ports (use when ports are unexpectedly in use).
- `make reset-dev`: runs `clean-legacy` then `make start` to reset and bring the dev stack up.

Friends list auto-refresh (frontend)

- The `FriendsSearch` component now automatically refreshes its user list after you successfully send an invite and also listens for a global browser event to reload when other friend actions happen (accept/reject).
- If you implement accept/reject handlers elsewhere (e.g. in the pending requests UI), dispatch the following event so `FriendsSearch` updates automatically:

```javascript
// notify any listeners that friends data changed
window.dispatchEvent(new CustomEvent('friends:changed', { detail: { type: 'invite-accepted', requestId: 123 } }));
```

- `FriendsSearch` will also behave correctly when the initial set of users contains only the current user or when all results are filtered out because they are already friends or have pending invites: it shows a placeholder item with the message `Ninguém disponível para adicionar!` in the same style as friend items.

Files changed:

- `Frontend/src/components/elements/FriendsSearch.jsx`: now auto-reloads after invite, listens for `friends:changed`, and renders the standardized placeholder.
- `Makefile`: added `clean-legacy` and `reset-dev` targets.
- `Backend`: reject friend requests now delete the request (so rejected users can be invited again); controller returns `204 No Content`.

Recommended workflow:

1. When changing friend state from any UI, dispatch `friends:changed` so all components stay in sync.
2. Use `make reset-dev` to clear legacy containers and start a clean dev environment.


### Running the Project

#### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services (Backend, Frontend, Database, Monitoring)
docker-compose up -d

# Stop all services
docker-compose down
```

Services will be available at:
- Frontend: https://localhost:3000
- Backend API: https://localhost:8082
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

#### Option 2: Manual Development Setup

**Backend**:
```bash
cd Backend

# Build the project
./gradlew build

# Run tests
./gradlew test

# Start the application
./gradlew bootRun
```

Backend will be available at: `https://localhost:8082`

**Frontend**:
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Frontend will be available at: `https://localhost:3000`

**Database**:
```bash
# Ensure MySQL is running
# Migrations are applied automatically by Flyway on backend startup
```

### Compilation & Building

**Backend**:
```bash
cd Backend
./gradlew clean build -x test  # Skip tests for faster build
./gradlew bootJar  # Create executable JAR
```

**Frontend**:
```bash
cd Frontend
npm run build  # Creates optimized production build
```

**Game**:
The game is bundled with the frontend and uses Phaser.js. No separate compilation needed.

### Testing

**Backend Integration Tests**:
```bash
cd Backend
./gradlew test  # Run all 71 test cases
```

Tests cover:
- Authentication endpoints
- OAuth2 flow
- Two-Factor Authentication
- User management
- Friend system
- Profile updates
- Error handling

---

## 📚 Resources

### Game Development
- [Phaser 3 Official Documentation](https://phaser.io/docs/2.13.2)
- [Phaser Examples](https://labs.phaser.io/)
- [Game Development Best Practices](https://gamedev.stackexchange.com/)

### Backend & Spring Boot
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Guide](https://spring.io/projects/spring-security)
- [Hibernate/JPA Reference](https://hibernate.org/orm/documentation/)
- [RESTful API Design Best Practices](https://restfulapi.net/)

### Frontend & React
- [React Official Documentation](https://react.dev/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Axios Documentation](https://axios-http.com/)

### OAuth2 & Authentication
- [OAuth 2.0 Specification](https://datatracker.ietf.org/doc/html/rfc6749)
- [Google OAuth 2.0 Integration](https://developers.google.com/identity/protocols/oauth2)
- [TOTP Implementation (RFC 6238)](https://datatracker.ietf.org/doc/html/rfc6238)

### DevOps & Monitoring
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Database
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Flyway Database Migration](https://flywaydb.org/documentation/)
- [Database Design Best Practices](https://www.sqlshack.com/en/database-design-best-practices/)

---

## 👨‍💻 Individual Contributions

### CarolShingai (cshingai)

**Primary Focus**: Backend Authentication & Infrastructure

**Contributions**:
- Designed and implemented OAuth2 authentication flow with Google
- Implemented Two-Factor Authentication (2FA) using TOTP
- Created Spring Security configuration with proper authorization
- Designed and implemented User Management endpoints
- Wrote comprehensive integration test suite (71 tests covering all endpoints)
- Implemented password, username, and nickname validation
- Set up HTTPS with auto-generated certificates for development
- Configured environment-based setup for dev/prod environments
- Coordinated backend/frontend integration for authentication

**Modules Implemented**:
- `AuthController` - OAuth2 and login endpoints
- `AuthTwoFactorController` - 2FA setup and verification
- `UsersController` - User search and management
- `UserService` - Core user business logic
- `JwtTokenProvider` - JWT token generation and validation
- `SecurityConfiguration` - Spring Security beans and chains

**Challenges & Solutions**:
- **Challenge**: OAuth2 redirect handling between frontend and backend on different ports
- **Solution**: Implemented configurable frontend base URL in properties files with environment variable overrides
- **Challenge**: 2FA timing issues with TOTP tokens
- **Solution**: Allowed small time window (±1 step) for code verification to account for clock skew

---

### Thiagosdcavalcante (tsantana)

**Primary Focus**: Full-Stack Development (Game + Social Features + Backend Services)

**Contributions**:
- Architected and implemented the complete game system with multiple scenes
- Designed match reporting and ranking systems
- Implemented user search and friend management (both UI and backend)
- Created profile system with public profile viewing
- Designed and implemented ranked leaderboard
- Built error handling pages for HTTP errors
- Implemented match history retrieval system
- Created database migrations using Flyway
- Designed and built Match and Map entities/repositories

**Modules Implemented**:
- `GameScene`, `CerradoScene`, `MataatlanticaScene` - Game implementations
- `MatchController` - Match registration endpoints
- `MatchService` - Match business logic
- `RankedService` - Ranking calculations
- `FriendsSearch` component - User search UI
- `PublicProfileCard` component - Player profiles
- `HomeCard` component - Friend list management

**Challenges & Solutions**:
- **Challenge**: Synchronizing game state between Phaser and React
- **Solution**: Implemented clientMatchId tracking and retry queueing for failed submissions
- **Challenge**: Managing complex friend state with optimistic UI updates
- **Solution**: Implemented local state management with fallback to server state
- **Challenge**: Collision detection performance in game with many enemies
- **Solution**: Used spatial partitioning and object pooling techniques in Phaser

---

### barbarabischain (babischa)

**Primary Focus**: Game Development (Graphics, Animation, Entities)

**Contributions**:
- Designed and implemented all game enemy entities (Tyrannus boss, Hárpia, Carcará, Libelula, Fire)
- Created sprite sheets and animation frames for all entities
- Implemented three complete game maps (Cerrado, Mataatlântica, Amazonas)
- Fixed player movement and image positioning issues
- Optimized game assets for web performance
- Implemented collision groups for different entity types
- Cleaned up redundant game folders and consolidated code

**Game Elements Created**:
- Enemy entity groups with specific behaviors
- Animation sequences for all enemy types
- Background art and map layouts
- Player character sprite and animations
- Particle effects for game events

**Challenges & Solutions**:
- **Challenge**: Performance issues with many simultaneous enemies
- **Solution**: Implemented object pooling and lazy loading of sprites
- **Challenge**: Sprite positioning inconsistencies across browsers
- **Solution**: Used viewport-relative positioning with proper scale factors

---

### luana-r (lsouza-r)

**Primary Focus**: Infrastructure, DevOps, & Monitoring

**Contributions**:
- Designed and implemented Prometheus metrics collection
- Created Grafana dashboards for infrastructure visualization
- Integrated Spring Boot Actuator for application metrics exposure
- Configured Docker and Docker Compose for full stack deployment
- Implemented persistent volume management for monitoring data
- Enhanced friend invite display with improved UX
- Added Privacy Policy and Terms of Use components
- Fixed Makefile scripts and build paths
- Configured datasources and provisioned Grafana dashboards

**Infrastructure Components**:
- Prometheus configuration for multi-source metric collection
- Grafana dashboards for CPU, memory, and application metrics
- Docker services orchestration (Backend, Frontend, Database, Monitoring)
- Volume configurations for data persistence

**Challenges & Solutions**:
- **Challenge**: Prometheus scrape configuration for multiple targets
- **Solution**: Implemented service discovery with proper labels and network configuration
- **Challenge**: Grafana dashboard provisioning automation
- **Solution**: Used provisioning files with datasource configuration templates

---

## �‍💻 Individual Contributions Breakdown

### Carol Shingai (cshingai) - Backend Lead & Authentication Specialist

**Summary**:
Carol led the backend architecture and security implementation, ensuring a robust, scalable foundation for the entire application.

**Key Contributions**:
- **Authentication System**: Designed and implemented complete OAuth2 flow with Google, including secure redirect handling and token management
- **Two-Factor Authentication**: Built TOTP-based 2FA system with QR code generation, recovery codes, and time-window verification
- **Spring Security Configuration**: Set up comprehensive security chains, JWT token providers, and authorization mechanisms
- **User Management Endpoints**: Created REST controllers for user CRUD operations, search, profile updates, and friend management
- **Testing Suite**: Wrote 71 integration tests covering authentication, authorization, user management, and API endpoints
- **Environment Configuration**: Implemented multi-environment setup (dev/prod) with environment variables and property files
- **HTTPS Setup**: Automated SSL/TLS certificate generation for development and production environments
- **API Design**: Designed 5+ public API endpoints with proper request validation and error handling
- **Database Migrations**: Set up Flyway for automated database schema management and versioning

**Modules Owned**:
- Backend Framework (Spring Boot) - 1 point
- Public API with 5+ endpoints - 2 points
- Standard User Management & Authentication - 2 points
- OAuth 2.0 Integration - 1 point
- Two-Factor Authentication (2FA) - 1 point

**Technical Components**:
- `AuthController` - OAuth2, login, logout endpoints
- `AuthTwoFactorController` - 2FA setup, verification, recovery codes
- `UsersController` - User search, profile management, friend system
- `UserService` - Business logic for user operations
- `JwtTokenProvider` - Token generation, validation, refresh logic
- `SecurityConfiguration` - Spring Security bean definitions and filter chains
- `PasswordEncoder` - Secure password hashing and validation

**Challenges Faced & Solutions**:
1. **Challenge**: OAuth2 redirect handling between frontend and backend on different ports/domains
   - **Solution**: Implemented configurable frontend base URL in properties with environment variable overrides
   
2. **Challenge**: 2FA TOTP token timing issues (clock skew between client/server)
   - **Solution**: Allowed ±1 time window verification step to account for network latency and clock differences
   
3. **Challenge**: Securing JWT tokens while maintaining performance
   - **Solution**: Implemented token caching strategy with short expiration times and refresh token mechanism
   
4. **Challenge**: User input validation both frontend and backend
   - **Solution**: Created comprehensive validation rules (password strength, username format, email verification)

---

### Thiago Cavalcante (tsantana) - Full-Stack Developer & Frontend Lead

**Summary**:
Thiago architected the frontend application and coordinated full-stack integration, focusing on game mechanics, social features, and user experience.

**Key Contributions**:
- **Game Architecture**: Designed complete game system with multiple scenes (Cerrado, Mataatlântica, Amazonas)
- **Real-time Social Features**: Implemented WebSocket-based friend presence tracking and notifications
- **Ranking System**: Created match reporting, ranking calculations, and leaderboard visualization
- **User Search**: Built frontend search component with debouncing and backend filtering
- **Friend Management**: Implemented add/remove friends UI with request status management
- **Profile System**: Created public profile pages with player stats and game history
- **Frontend Framework**: Set up React 18 with component composition and state management
- **Match History**: Designed match retrieval and display system with filtering and sorting
- **Error Handling**: Created custom error pages (4xx, 5xx) with helpful messages
- **Responsive Design**: Ensured mobile and desktop compatibility across all pages
- **Database Integration**: Designed Match, Maps, and Rankings entities with proper relationships

**Modules Owned**:
- Frontend Framework (React) - 1 point
- Real-time WebSocket Features - 2 points
- Game Statistics & Match History - 1 point
- Browser Compatibility Support - 1 point
- Game Customization Options - 1 point

**Technical Components**:
- `GameScene.jsx` - Main game scene with enemy spawning and collision detection
- `CerradoScene.jsx`, `MataatlanticaScene.jsx`, `AmazonasScene.jsx` - Themed game maps
- `FriendsSearch.jsx` - User search with debouncing and autocomplete
- `PublicProfileCard.jsx` - Player profile display with statistics
- `RankingLeaderboard.jsx` - Ranked player leaderboard visualization
- `MatchController` - Match registration and retrieval endpoints
- `MatchService` - Match business logic and ranking calculations
- `RankedService` - ELO rating and ranking system implementation
- WebSocket handlers for real-time presence updates

**Challenges Faced & Solutions**:
1. **Challenge**: Synchronizing game state (Phaser) with React component state
   - **Solution**: Implemented clientMatchId tracking and retry queue for failed match submissions
   
2. **Challenge**: Managing complex friend state with optimistic UI updates
   - **Solution**: Implemented local state management with server state fallback on conflicts
   
3. **Challenge**: Real-time WebSocket connection stability
   - **Solution**: Added automatic reconnection logic with exponential backoff strategy
   
4. **Challenge**: Game performance with many simultaneous enemies
   - **Solution**: Collaborated with graphics team on object pooling and sprite optimization
   
5. **Challenge**: Consistent ranking calculations across different game modes
   - **Solution**: Centralized ranking logic in RankedService with well-defined formulas

---

### Barbara Bischain (babischa) - Product Owner & Game Developer

**Summary**:
Barbara led product vision and implemented game graphics/animation, creating the interactive game experience.

**Key Contributions**:
- **Game Entity Design**: Implemented all enemy types (Tyrannus, Hárpia, Carcará, Libelula, Fire) with unique behaviors
- **Sprite Creation**: Created sprite sheets and animation frames for all game entities
- **Map Design**: Implemented three complete game maps with distinct themes and layouts
- **Animation System**: Built animation sequences for idle, attack, and death states
- **Player Character**: Designed and implemented player sprite with movement animations
- **Game Balance**: Tuned enemy difficulty, spawn rates, and scoring mechanics
- **Asset Optimization**: Optimized all game assets for web performance
- **Collision Groups**: Implemented entity collision categorization for efficient physics detection
- **Visual Effects**: Created particle effects for scoring and enemy elimination
- **Product Vision**: Defined game features and user experience requirements

**Modules Owned**:
- Game Customization Options - 1 point
- Game Development (primary graphics/entities) - Contributed to overall game system

**Technical Components**:
- `CarcaraGroup.js` - Carcará enemy group with specific attack patterns
- `HarpiaGroup.js` - Hárpia flying enemy with altitude variations
- `LibelulaGroup.js` - Libelula dragonfly enemy
- `FireGroup.js` - Fire obstacle hazard
- `Tyrannus.js` - Boss enemy with advanced AI
- Sprite asset pipelines and texture factories
- Collision detection and physics configurations
- Animation state machines for entity behavior

**Challenges Faced & Solutions**:
1. **Challenge**: Performance degradation with many simultaneous animated sprites
   - **Solution**: Implemented object pooling and lazy sprite instantiation
   
2. **Challenge**: Sprite positioning inconsistencies across different browsers (Safari/Firefox)
   - **Solution**: Used viewport-relative positioning with proper scale factor calculations
   
3. **Challenge**: Balancing game difficulty to avoid too easy/too hard scenarios
   - **Solution**: Implemented difficulty curves and progressive enemy spawning
   
4. **Challenge**: Asset file size and load times
   - **Solution**: Optimized textures with proper compression and atlasing strategies

---

### Luana Ribeiro (lsouza-r) - Project Manager & DevOps Engineer

**Summary**:
Luana managed project coordination and implemented production-ready monitoring infrastructure.

**Key Contributions**:
- **Project Management**: Coordinated daily standups, sprint planning, and task distribution
- **Prometheus Setup**: Configured metrics collection from application and infrastructure
- **Grafana Dashboards**: Created custom dashboards for CPU, memory, and application metrics
- **Docker Infrastructure**: Configured Docker Compose for complete stack orchestration
- **Spring Boot Actuator**: Integrated metrics exposure endpoints with Prometheus scraping
- **Persistent Volumes**: Set up data persistence for database and monitoring systems
- **CI/CD Preparation**: Set up GitHub Actions for automated testing and build pipelines
- **Documentation**: Created deployment guides and troubleshooting documentation
- **UI Improvements**: Enhanced friend invite display and notification system
- **Privacy & Legal**: Implemented Privacy Policy and Terms of Service components
- **Monitoring Alerting**: Set up Prometheus alerting rules for critical metrics

**Modules Owned**:
- Monitoring with Prometheus & Grafana - 2 points

**Technical Components**:
- `prometheus.yml` - Prometheus configuration with scrape targets
- Grafana dashboard definitions (JSON) with custom visualizations
- Docker Compose orchestration files
- Health check configurations and readiness probes
- Alert rules for metric thresholds
- Volume definitions for data persistence
- Environment variable management across services

**Challenges Faced & Solutions**:
1. **Challenge**: Prometheus scrape configuration for multiple target services
   - **Solution**: Implemented service discovery with proper Docker Compose networking and labels
   
2. **Challenge**: Grafana dashboard provisioning automation
   - **Solution**: Created provisioning YAML files with dashboard templates and datasource configuration
   
3. **Challenge**: Coordinating development workflow across 4 developers
   - **Solution**: Implemented feature branch strategy with code review requirements before merge
   
4. **Challenge**: Managing environment configurations (dev/prod) across team
   - **Solution**: Created standardized .env.example files and environment setup documentation

---

## �🔍 Known Limitations

1. **Game Graphics**: Educational sprite quality (not production-grade artwork)
2. **Scaling**: Single-server deployment (not horizontally scalable at current state)
3. **Real-time Updates**: Limited to active WebSocket connections (no persistent state sync)
4. **Mobile Game**: Game optimized for desktop; mobile experience limited
5. **Match Logic**: Simplified match result validation (could add anti-cheat measures)

---

## 📝 License

This project is created as part of the 42 School curriculum. Academic use only.

---

## 🙏 Acknowledgments

- 42 School for project structure and requirements
- Spring Boot and React communities for excellent documentation
- Phaser.js framework for game development capabilities
- All contributors who made this project possible

