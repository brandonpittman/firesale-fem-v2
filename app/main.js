const fs = require('fs');
const { app, BrowserWindow, dialog } = require('electron');

let mainWindow = null;

app.on('ready', () => {
  console.log('App ready...');

  mainWindow = new BrowserWindow({ show: false, width: 1024, height: 800 });

  mainWindow.loadFile(`${__dirname}/index.html`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
});

console.log('Starting up...');

exports.getFileFromUser = () => {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: 'Markdown Files',
        extensions: ['md', 'markdown', 'mdown']
      },
      {
        name: 'Text Files',
        extensions: ['txt', 'text']
      },
      {
        name: 'All Files',
        extensions: ['*']
      }
    ]
  });

  if (!files) return;

  const file = files[0];

  openFile(file);
};

const openFile = file => {
  const content = fs.readFileSync(file).toString();
  app.addRecentDocument(file);
  mainWindow.webContents.send('file-opened', file, content);
};

exports.saveMarkdown = (file, content) => {
  if (!file) {
    file = dialog.showSaveDialog(mainWindow, {
      title: 'Save Markdown',
      defaultPath: app.getPath('desktop'),
      filters: [
        {
          name: 'Markdown Files',
          extensions: ['md']
        }
      ]
    });
  }

  if (!file) return;

  fs.writeFileSync(file, content);
  openFile(file);
};

exports.saveHtml = html => {
  file = dialog.showSaveDialog(mainWindow, {
    title: 'Save as HTML',
    defaultPath: app.getPath('desktop'),
    filters: [{ name: 'HTML Files', extensions: ['html'] }]
  });

  fs.writeFileSync(file, html);
};
