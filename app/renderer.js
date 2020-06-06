const path = require('path');
const { remote, ipcRenderer } = require('electron');
const { getFileFromUser } = remote.require('./main');
const marked = require('marked');
const currentWindow = remote.getCurrentWindow();

let appTitle = 'Fire Sale';
let filePath = null;
let originalContent = '';
let defaultExtension = 'md';

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
  updateUserInterface(currentContent !== originalContent);
});

openFileButton.addEventListener('click', () => {
  getFileFromUser();
});

const updateUserInterface = isDirty => {
  let title = appTitle;
  title = filePath
    ? `${path.basename(filePath)} - ${title}`
    : `untitled.${defaultExtension} - ${title}`;

  isDirty && (title = `${title} (Unsaved changes)`);
  currentWindow.setTitle(title);
  currentWindow.setRepresentedFilename(filePath);
  currentWindow.setDocumentEdited(isDirty);

  saveMarkdownButton.disabled = !isDirty;
  revertButton.disabled = !isDirty;
};

ipcRenderer.on('file-opened', (event, file, content) => {
  filePath = file;
  originalContent = content;
  markdownView.value = content;
  renderMarkdownToHtml(content);
  updateUserInterface();
});

updateUserInterface(false);

