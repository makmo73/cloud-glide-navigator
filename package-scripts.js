
// This file will be used to add scripts to package.json
module.exports = {
  scripts: {
    "electron:dev": "concurrently \"vite dev\" \"electron electron/main.js\"",
    "electron:build": "vite build && electron-builder",
    "electron:build:mac": "vite build && electron-builder --mac",
    "electron:build:win": "vite build && electron-builder --win",
    "electron:build:linux": "vite build && electron-builder --linux"
  }
};
