# React Frontend - Transcendence

This is the new React-based frontend for the Transcendence project, replacing the previous Angular implementation.

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Docker

### Building the Docker Image

```bash
docker build -t transcendence-frontend:latest .
```

### Running with Docker Compose

From the root directory:

```bash
docker-compose up frontend
```

The frontend will be available at `http://localhost:8080`

## Project Structure

```
Frontend/
├── public/
│   └── index.html          # HTML entry point
├── src/
│   ├── App.jsx             # Main App component
│   ├── App.css             # App styles
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx configuration
└── .gitignore              # Git ignore rules
```

## API Integration

The frontend resolves the API base automatically:
- In local development on port 3000, it uses `https://localhost:8082`
- In production and Docker/Nginx, it uses the same-origin `/api` proxy
- You can override it with `REACT_APP_API_URL` if needed

## Key Technologies

- **React 19** - UI library
- **React Scripts 5** - Build tooling and development server
- **Nginx** - Production web server
- **Docker** - Container orchestration

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Migration Notes

This React frontend replaces the Angular implementation. Key differences:
- Uses functional components with hooks instead of Angular classes
- Simplified state management (can add Redux/Context API as needed)
- Direct CSS instead of TypeScript/Tailwind (can be extended)
- Single Page Application with client-side routing

## Next Steps

1. Set up React Router for navigation
2. Configure state management (Redux, Zustand, Context API)
3. Add UI component library (Material-UI, Chakra UI, etc.)
4. Implement authentication/authorization
5. Set up testing framework (Jest, React Testing Library)
6. Add environment configuration

## Troubleshooting

### Port Already in Use
If port 3000 is already in use during development, the CLI will prompt you to use a different port.

### API Connection Issues
Make sure the backend is running and accessible at the configured URL. In production with Docker, ensure services are on the same network.

### Build Errors
Clear `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Support

For issues or questions about the Frontend setup, check the main project documentation.
