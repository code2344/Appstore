# Mini App Store

An iOS-style Mini App Store built with Node.js and Express that allows users to create and install web apps as iOS Web Clips.

## Features

- **Dynamic Front Page**: App Store-like UI with grid layout, rounded cards, and iOS colors
- **App Creation**: Users can create apps with name, description, launch URL, and optional icon upload
- **iOS Integration**: Generates and serves `.mobileconfig` files for each app to install as Web Clips on iOS
- **Modern Design**: Polished iOS-style design with TailwindCSS-inspired custom CSS
- **Responsive**: Works on both desktop and mobile devices

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Appstore
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Creating an App
1. Click "Create App" in the navigation
2. Fill out the form with:
   - **App Name**: The display name for your app
   - **Description**: A brief description of what the app does
   - **Launch URL**: The web URL that the app will open
   - **App Icon** (Optional): Upload an image file (PNG, JPG, GIF)
3. Click "Create App" to add it to the store

### Installing Apps on iOS
1. Open the Mini App Store on your iPhone or iPad
2. Find the app you want to install
3. Tap "Install on iOS"
4. Follow the iOS prompts to install the configuration profile
5. The app will appear on your home screen as a Web Clip

## Technical Details

### File Structure
```
├── server.js              # Main Express server
├── package.json           # Node.js dependencies
├── public/
│   ├── css/
│   │   └── style.css      # iOS-style CSS
│   └── uploads/           # User-uploaded app icons
├── views/
│   ├── index.ejs          # Home page template
│   └── maker.ejs          # App creation form
└── data/
    └── apps.json          # App data storage (created automatically)
```

### API Endpoints
- `GET /` - Home page with app grid
- `GET /maker` - App creation form
- `POST /api/apps` - Create new app (with file upload support)
- `GET /api/apps/:id/mobileconfig` - Download iOS configuration profile

### iOS Web Clip Generation
The app generates Apple `.mobileconfig` files that can be installed on iOS devices to create home screen shortcuts. These files include:
- App name and description
- Launch URL
- App icon (if provided)
- Unique identifiers for iOS

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Dependencies
- **express** - Web framework
- **multer** - File upload handling
- **ejs** - Template engine
- **uuid** - Unique ID generation
- **nodemon** (dev) - Development server with auto-reload

## License

ISC