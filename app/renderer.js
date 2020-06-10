const path = require("path");
const { remote, ipcRenderer, shell } = require("electron");
const main = remote.require("./main");
const { openFile, getFileFromUser, saveMarkdown, saveHtml } = main;
const marked = require("marked");
const currentWindow = remote.getCurrentWindow();

let appTitle = "Fire Sale";
let filePath = null;
let originalContent = "";
let defaultExtension = "md";

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
// const newFileButton = document.querySelector("#new-file");
// const openFileButton = document.querySelector("#open-file");
// const saveMarkdownButton = document.querySelector("#save-markdown");
// const revertButton = document.querySelector("#revert");
// const saveHtmlButton = document.querySelector("#save-html");
// const showFileButton = document.querySelector("#show-file");
// const openInDefaultButton = document.querySelector("#open-in-default");

document.addEventListener("dragstart", (e) => e.preventDefault());
document.addEventListener("dragleave", (e) => e.preventDefault());
document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", (e) => e.preventDefault());

const cleanUpClasses = () => {
  markdownView.classList.add("bg-purple-100");
  markdownView.classList.remove("bg-green-200");
  markdownView.classList.remove("bg-red-200");
};
const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];
const fileTypeIsSupported = (file) =>
  ["text/plain", "text/markdown"].includes(file.type);

markdownView.addEventListener("dragover", (event) => {
  const file = getDraggedFile(event);

  if (fileTypeIsSupported(file)) {
    markdownView.classList.remove("bg-purple-100");
    markdownView.classList.add("bg-green-200");
  } else {
    markdownView.classList.remove("bg-purple-100");
    markdownView.classList.add("bg-red-200");
  }
});

markdownView.addEventListener("dragleave", () => cleanUpClasses());

markdownView.addEventListener("drop", (event) => {
  const file = getDroppedFile(event);

  if (fileTypeIsSupported(file)) {
    openFile(file.path);
  } else {
    alert("File type not supported.");
  }
  cleanUpClasses();
});

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const revertDocument = () => {
  const result = confirm("Are you sure you want to revert?");
  if (result) {
    markdownView.value = originalContent;
    renderMarkdownToHtml(originalContent);
    updateUserInterface(false);
  }
};

const newFile = () => {
  let result = true;

  if (markdownView.value !== originalContent || filePath) {
    result = confirm("Are you sure you want to create a new file?");
  }

  if (result) {
    filePath = null;
    markdownView.value = "";
    renderMarkdownToHtml(markdownView.value);
    updateUserInterface(false);
  }
};

ipcRenderer.on("new-file", newFile);

// revertButton.addEventListener("click", revertDocument);

ipcRenderer.on("revert", revertDocument);

markdownView.addEventListener("keyup", (event) => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
  updateUserInterface(currentContent !== originalContent);
});

// openFileButton.addEventListener("click", () => {
//   getFileFromUser();
// });

const exportHtml = () => {
  let html = htmlView.innerHTML;
  saveHtml(html);
};

// saveHtmlButton.addEventListener("click", exportHtml);

ipcRenderer.on("export-html", exportHtml);

const saveAsMarkdown = () => {
  let currentContent = markdownView.value;
  saveMarkdown(filePath, currentContent);
  originalContent = currentContent;
  updateUserInterface();
};

ipcRenderer.on("save-markdown", saveAsMarkdown);

// saveMarkdownButton.addEventListener("click", saveAsMarkdown);

const revealInFinder = () => {
  if (!filePath) return alert("Nope!");
  shell.showItemInFolder(filePath);
};

// showFileButton.addEventListener("click", revealInFinder);

ipcRenderer.on("reveal-in-finder", revealInFinder);

const openInDefaultApp = () => {
  if (!filePath) return alert("Nope!");
  shell.openItem(filePath);
};

// openInDefaultButton.addEventListener("click", openInDefaultApp);

ipcRenderer.on("open-in-default-app", openInDefaultApp);

const updateUserInterface = (isDirty = false) => {
  let title = appTitle;
  title = filePath
    ? `${path.basename(filePath)} - ${title}`
    : `Untitled - ${title}`;

  isDirty && (title = `${title} (Unsaved changes)`);
  currentWindow.setTitle(title);
  filePath && currentWindow.setRepresentedFilename(filePath);
  currentWindow.setDocumentEdited(isDirty);

  saveMarkdownButton.disabled = !isDirty;
  revertButton.disabled = !isDirty;
  showFileButton.disabled = !filePath;
  openInDefaultButton.disabled = !filePath;
  markdownView.autofocus();
};

ipcRenderer.on("file-opened", (_event, file, content) => {
  filePath = file;
  originalContent = content;
  markdownView.value = content;
  renderMarkdownToHtml(content);
  updateUserInterface();
});

updateUserInterface();
