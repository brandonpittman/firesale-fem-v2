const fs = require("fs");
const { app, BrowserWindow, dialog, Menu, MenuItem } = require("electron");

let mainWindow = null;

app.on("ready", () => {
  console.log("App ready...");

  mainWindow = new BrowserWindow({ show: false, width: 1024, height: 800 });

  Menu.setApplicationMenu(applicationMenu);

  mainWindow.loadFile(`${__dirname}/index.html`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
});

console.log("Starting up...");

exports.getFileFromUser = () => {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      {
        name: "Markdown Files",
        extensions: ["md", "markdown", "mdown"],
      },
      {
        name: "Text Files",
        extensions: ["txt", "text"],
      },
      {
        name: "All Files",
        extensions: ["*"],
      },
    ],
  });

  if (!files) return;

  const file = files[0];

  openFile(file);
};

const openFile = (exports.openFile = (file) => {
  const content = fs.readFileSync(file).toString();
  app.addRecentDocument(file);
  mainWindow.webContents.send("file-opened", file, content);
});

exports.saveMarkdown = (file, content) => {
  if (!file) {
    file = dialog.showSaveDialog(mainWindow, {
      title: "Save Markdown",
      defaultPath: app.getPath("desktop"),
      filters: [
        {
          name: "Markdown Files",
          extensions: ["md"],
        },
      ],
    });
  }

  if (!file) return;

  fs.writeFileSync(file, content);
  openFile(file);
};

exports.saveHtml = (html) => {
  file = dialog.showSaveDialog(mainWindow, {
    title: "Save as HTML",
    defaultPath: app.getPath("desktop"),
    filters: [{ name: "HTML Files", extensions: ["html"] }],
  });

  fs.writeFileSync(file, html);
};

const applicationName = "Fire Sale";
const isMac = process.platform === "darwin";

const template = [
  { role: "appMenu" },
  { role: "fileMenu" },
  {
    label: "Actions",
    submenu: [
      {
        label: "New File",
        accelerator: "CommandOrControl+N",
        click() {
          mainWindow.webContents.send("new-file");
        },
      },
      {
        label: "Open File",
        accelerator: "CommandOrControl+O",
        click() {
          exports.getFileFromUser();
        },
      },
      {
        label: "Save File",
        accelerator: "CommandOrControl+S",
        click() {
          mainWindow.webContents.send("save-markdown");
        },
      },
      {
        label: "Export HTML",
        accelerator: "CommandOrControl+E",
        click() {
          mainWindow.webContents.send("export-html");
        },
      },
      {
        label: "Revert",
        accelerator: "CommandOrControl+R",
        click() {
          mainWindow.webContents.send("revert");
        },
      },
      {
        label: "Reveal in Finder",
        accelerator: "CommandOrControl+Shift+R",
        click() {
          mainWindow.webContents.send("reveal-in-finder");
        },
      },
      {
        label: "Open in Default Application",
        accelerator: "CommandOrControl+Shift+O",
        click() {
          mainWindow.webContents.send("open-in-default-app");
        },
      },
    ],
  },
  {
    role: "editMenu",
  },
  {
    role: "viewMenu",
  },
  {
    role: "windowMenu",
  },
];

const applicationMenu = Menu.buildFromTemplate(template);
