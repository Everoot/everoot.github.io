# Ubuntu Portfolio - Eve Liang

A personal portfolio website with Ubuntu theme built with Angular, deployed at [https://everoot.github.io/](https://everoot.github.io/).

A modern desktop environment simulator built with Angular 19, providing a complete Ubuntu desktop experience.

## Tech Stack

- **Angular 19** - Frontend framework with component-based architecture and reactive data binding
- **TypeScript** - Type-safe JavaScript superset
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Angular Signals** - Reactive state management for efficient data flow
- **Angular CDK** - Component development kit providing accessibility and interaction features

## Features

- Ubuntu desktop environment simulation
- Window management system (drag, resize, minimize/maximize)
- Sidebar application launcher
- Multiple application windows (About, Projects, Skills, Contact, Terminal, VS Code, Chrome, Settings)
- Background image switching
- Desktop icon shortcuts
- Responsive design (mobile and desktop support)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm start
# or
ng serve
```

Visit http://localhost:4200 to view the development version

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/ubuntu-portfolio/browser/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/          # Components directory
│   │   ├── desktop/        # Desktop main component
│   │   ├── window/         # Window component
│   │   ├── sidebar/        # Sidebar component
│   │   ├── navbar/         # Top navigation bar
│   │   └── apps/           # Application components
│   └── services/           # Services directory
│       ├── app-config.ts   # Application configuration service
│       └── window-manager.ts # Window management service
├── assets/                 # Static assets
│   ├── images/            # Image resources
│   └── themes/            # Theme resources
└── styles.css             # Global styles
```

## Customization

### Modify Personal Information

Edit the configuration in `src/app/services/app-config.ts`:
- Application list and icons
- Desktop shortcuts
- Sidebar favorite applications

### Modify Application Content

Edit the corresponding application components:
- `src/app/components/apps/about/` - About page
- `src/app/components/apps/projects/` - Projects showcase
- `src/app/components/apps/skills/` - Skills list
- `src/app/components/apps/contact/` - Contact information

