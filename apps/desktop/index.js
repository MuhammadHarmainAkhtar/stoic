// DUMMY 
const { app, BrowserWindow } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL('https://localhost:3000'); // Or your local Next.js app
}

app.whenReady().then(createWindow);