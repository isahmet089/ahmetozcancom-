document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        terminal: {
            input: document.querySelector('.terminal-input'),
            output: document.querySelector('.terminal-output'),
            newTerminalBtn: document.querySelector('.new-terminal-btn'),
            terminalTabs: document.querySelector('.terminal-tabs'),
            toggleTerminalBtn: document.querySelector('#toggleTerminal'),
            clearTerminalBtn: document.querySelector('#clearTerminal'),
            terminalPanel: document.querySelector('.terminal-panel')
        },
        window: {
            minimizeBtn: document.querySelector('.vs-window-btn.minimize'),
            maximizeBtn: document.querySelector('.vs-window-btn.maximize'),
            closeBtn: document.querySelector('.vs-window-btn.close')
        },
        activityBar: {
            items: document.querySelectorAll('.activity-bar-item')
        },
        editor: {
            tabs: document.querySelectorAll('.tab'),
            contentSections: document.querySelectorAll('.content-section'),
            files: document.querySelectorAll('.file'),
            folders: document.querySelectorAll('.folder')
        }
    };

    // State Management
    const state = {
        activeFile: null,
        openFolders: new Set(),
        commandHistory: [],
        historyIndex: -1,
        isFullscreen: false
    };

    // Event Handlers
    const handlers = {
        window: {
            minimize: () => {
                // Implement minimize functionality
                console.log('Minimize clicked');
            },
            maximize: () => {
                if (!state.isFullscreen) {
                    document.documentElement.requestFullscreen();
                    state.isFullscreen = true;
                } else {
                    document.exitFullscreen();
                    state.isFullscreen = false;
                }
            },
            close: () => {
                // Implement close functionality
                console.log('Close clicked');
            }
        },
        terminal: {
            input: (e) => {
                if (e.key === 'Enter') {
                    const command = e.target.value.trim();
                    if (command) {
                        state.commandHistory.push(command);
                        state.historyIndex = state.commandHistory.length;
                        processCommand(command);
                        e.target.value = '';
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (state.historyIndex > 0) {
                        state.historyIndex--;
                        e.target.value = state.commandHistory[state.historyIndex];
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (state.historyIndex < state.commandHistory.length - 1) {
                        state.historyIndex++;
                        e.target.value = state.commandHistory[state.historyIndex];
                    } else {
                        state.historyIndex = state.commandHistory.length;
                        e.target.value = '';
                    }
                }
            },
            toggle: () => {
                elements.terminal.terminalPanel.classList.toggle('collapsed');
            },
            clear: () => {
                elements.terminal.output.innerHTML = '';
            }
        },
        activityBar: {
            click: (e) => {
                elements.activityBar.items.forEach(item => item.classList.remove('active'));
                e.currentTarget.classList.add('active');
            }
        }
    };

    // Initialize Event Listeners
    function initializeEventListeners() {
        // Window Controls
        elements.window.minimizeBtn.addEventListener('click', handlers.window.minimize);
        elements.window.maximizeBtn.addEventListener('click', handlers.window.maximize);
        elements.window.closeBtn.addEventListener('click', handlers.window.close);

        // Terminal Controls
        if (elements.terminal.input) {
            elements.terminal.input.addEventListener('keydown', handlers.terminal.input);
        }
        if (elements.terminal.toggleTerminalBtn) {
            elements.terminal.toggleTerminalBtn.addEventListener('click', handlers.terminal.toggle);
        }
        if (elements.terminal.clearTerminalBtn) {
            elements.terminal.clearTerminalBtn.addEventListener('click', handlers.terminal.clear);
        }

        // Activity Bar
        elements.activityBar.items.forEach(item => {
            item.addEventListener('click', handlers.activityBar.click);
        });

        // Editor Tabs
        elements.editor.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetSection = tab.getAttribute('data-tab');
                switchTab(targetSection);
            });
        });

        // File Explorer
        elements.editor.files.forEach(file => {
            file.addEventListener('click', () => {
                elements.editor.files.forEach(f => f.classList.remove('active'));
                file.classList.add('active');
                state.activeFile = file.querySelector('span').textContent;
            });
        });

        elements.editor.folders.forEach(folder => {
            folder.addEventListener('click', () => {
                const folderName = folder.querySelector('.folder-name');
                folderName.classList.toggle('open');
                if (folderName.classList.contains('open')) {
                    state.openFolders.add(folderName);
                } else {
                    state.openFolders.delete(folderName);
                }
            });
        });
    }

    // Tab Switching
    function switchTab(sectionId) {
        elements.editor.tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === sectionId) {
                tab.classList.add('active');
            }
        });

        elements.editor.contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });
    }

    // Terminal Command Processing
    function processCommand(command) {
        const output = document.createElement('div');
        output.className = 'terminal-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = '$';
        
        const cmd = document.createElement('span');
        cmd.className = 'command';
        cmd.textContent = command;
        
        output.appendChild(prompt);
        output.appendChild(cmd);
        
        const result = document.createElement('div');
        result.className = 'terminal-line output';
        
        switch (command.toLowerCase()) {
            case 'help':
                result.textContent = `Available commands:
- help: Show this help message
- ls: List files and directories
- pwd: Show current directory
- cat <file>: Show file contents
- clear: Clear terminal
- about: Show about information
- contact: Show contact information`;
                break;
                
            case 'ls':
                result.textContent = `portfolio/
  index.html
  styles.css
  script.js
  README.md
projects/
  e-commerce/
  task-manager/
  data-analytics/`;
                break;
                
            case 'pwd':
                result.textContent = '/home/user/portfolio';
                break;
                
            case 'clear':
                elements.terminal.output.innerHTML = '';
                return;
                
            case 'about':
                result.textContent = `Ahmet Özcan
Software Developer
Passionate about creating efficient and user-friendly applications.`;
                break;
                
            case 'contact':
                result.textContent = `Email: email@example.com
Phone: +90 555 123 4567
Location: Istanbul, Turkey
GitHub: github.com/username
LinkedIn: linkedin.com/in/username`;
                break;
                
            default:
                if (command.startsWith('cat ')) {
                    const fileName = command.slice(4);
                    const file = Array.from(elements.editor.files)
                        .find(f => f.querySelector('span').textContent === fileName);
                    if (file) {
                        result.textContent = `Contents of ${fileName}:
[File contents would be displayed here]`;
                    } else {
                        result.textContent = `cat: ${fileName}: No such file`;
                    }
                } else {
                    result.textContent = `Command not found: ${command}`;
                }
        }
        
        elements.terminal.output.appendChild(output);
        elements.terminal.output.appendChild(result);
        elements.terminal.output.scrollTop = elements.terminal.output.scrollHeight;
    }

    // Initialize the application
    initializeEventListeners();
    
    // Set initial active tab
    const defaultTab = document.querySelector('.tab.active');
    if (defaultTab) {
        switchTab(defaultTab.getAttribute('data-tab'));
    }
}); 