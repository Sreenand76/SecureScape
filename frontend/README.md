# SecureScape Frontend

Educational web security platform frontend built with React and Tailwind CSS.

## Features

- **Interactive Demos**: SQL Injection, XSS, and CSRF demonstrations
- **Mode Toggle**: Switch between insecure (vulnerable) and secure (mitigated) implementations
- **Educational UI**: Clean, academic design focused on learning
- **Attacker Panel**: Payload library and request logger
- **Accessibility**: WCAG AA compliant with keyboard navigation

## Tech Stack

- **React 18**: UI framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling (no UI libraries)
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **React Icons**: Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (Button, Input, Card, etc.)
│   ├── layout/          # Layout components (Header, Sidebar, Layout)
│   └── attacker/        # Attacker panel components
├── contexts/            # React contexts (SecurityModeContext)
├── pages/               # Page components (Dashboard, SQLInjection, XSS, CSRF)
├── services/            # API service layer
├── App.jsx              # Main app component with routing
└── main.jsx             # Entry point
```

## Keyboard Shortcuts

- `Alt+M`: Toggle security mode (Insecure/Secure)
- `Alt+A`: Toggle attacker panel
- `Esc`: Close modals/panels

## API Integration

The frontend expects a backend API running on `http://localhost:5000` with the following endpoints:

### SQL Injection
- `POST /api/attack/sql/login` - Vulnerable login
- `POST /api/secure/sql/login` - Secure login
- `GET /api/attack/sql/search` - Vulnerable search
- `GET /api/secure/sql/search` - Secure search

### XSS
- `GET /api/attack/xss/comments` - Get comments (vulnerable)
- `GET /api/secure/xss/comments` - Get comments (secure)
- `POST /api/attack/xss/comment` - Add comment (vulnerable)
- `POST /api/secure/xss/comment` - Add comment (secure)

### CSRF
- `GET /api/attack/csrf/form` - Get form (vulnerable)
- `GET /api/secure/csrf/form` - Get form with token (secure)
- `POST /api/attack/csrf/transfer` - Transfer (vulnerable)
- `POST /api/secure/csrf/transfer` - Transfer with token validation (secure)

## Development

### Code Style

- Use functional components with hooks
- Follow React best practices
- Maintain accessibility standards
- Use Tailwind utility classes (no custom CSS unless necessary)

### Component Guidelines

- Keep components small and focused
- Use TypeScript-style prop documentation
- Include accessibility attributes (ARIA labels, roles)
- Support keyboard navigation

## License

Academic project - for educational purposes only.
