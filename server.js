const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Set up EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Data file path
const APPS_DATA_FILE = path.join(__dirname, 'data', 'apps.json');

// Initialize apps data file if it doesn't exist
if (!fs.existsSync(path.dirname(APPS_DATA_FILE))) {
  fs.mkdirSync(path.dirname(APPS_DATA_FILE), { recursive: true });
}

if (!fs.existsSync(APPS_DATA_FILE)) {
  fs.writeFileSync(APPS_DATA_FILE, JSON.stringify([]));
}

// Helper functions
function getApps() {
  try {
    const data = fs.readFileSync(APPS_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveApps(apps) {
  try {
    fs.writeFileSync(APPS_DATA_FILE, JSON.stringify(apps, null, 2));
    return true;
  } catch (error) {
    return false;
  }
}

// Routes
app.get('/', (req, res) => {
  const apps = getApps();
  res.render('index', { apps });
});

app.get('/maker', (req, res) => {
  res.render('maker');
});

app.post('/api/apps', upload.single('icon'), (req, res) => {
  try {
    const { name, description, launchUrl } = req.body;
    
    if (!name || !description || !launchUrl) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const apps = getApps();
    const newApp = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      launchUrl: launchUrl.trim(),
      icon: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString()
    };

    apps.push(newApp);
    
    if (saveApps(apps)) {
      res.json({ success: true, app: newApp });
    } else {
      res.status(500).json({ error: 'Failed to save app' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/apps/:id/mobileconfig', (req, res) => {
  try {
    const apps = getApps();
    const app = apps.find(a => a.id === req.params.id);
    
    if (!app) {
      return res.status(404).send('App not found');
    }

    const mobileconfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>${app.icon ? fs.readFileSync(path.join(__dirname, 'public', app.icon)).toString('base64') : ''}</data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>${app.name}</string>
            <key>PayloadDescription</key>
            <string>${app.description}</string>
            <key>PayloadDisplayName</key>
            <string>${app.name}</string>
            <key>PayloadIdentifier</key>
            <string>com.appstore.webclip.${app.id}</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>${app.id}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>${app.launchUrl}</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Install ${app.name} as a Web Clip</string>
    <key>PayloadDisplayName</key>
    <string>${app.name}</string>
    <key>PayloadIdentifier</key>
    <string>com.appstore.${app.id}</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${uuidv4()}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

    res.setHeader('Content-Type', 'application/x-apple-aspen-config');
    res.setHeader('Content-Disposition', `attachment; filename="${app.name}.mobileconfig"`);
    res.send(mobileconfig);
  } catch (error) {
    res.status(500).send('Error generating mobileconfig');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});