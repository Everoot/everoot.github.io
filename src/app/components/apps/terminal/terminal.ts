import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WindowManagerService } from '../../../services/window-manager';
import { AppConfigService } from '../../../services/app-config';

interface TerminalRow {
  id: number;
  command: string;
  result: string;
  isActive: boolean;
}

@Component({
  selector: 'app-terminal',
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal.html',
  styleUrl: './terminal.css',
})
export class TerminalComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('terminalBody', { static: false }) terminalBody!: ElementRef;
  
  terminalRows = signal<TerminalRow[]>([]);
  currentDirectory = signal('~');
  currentDirName = signal('root');
  commandHistory: string[] = [];
  commandHistoryIndex = -1;
  currentRowId = 1;
  cursorVisibleMap: { [key: number]: boolean } = {};
  private cursorInterval: any;
  private currentActiveRowId: number = 0;
  currentInputs: { [key: number]: string } = {};
  
  childDirectories: { [key: string]: string[] } = {
    root: ['about', 'projects', 'skills', 'contact', 'resume.txt', 'README.md', '.git', '.config'],
    about: [],
    projects: ['agent-experience', 'oculomics-ai', 'housing-management', 'portfolio', 'ubuntu-portfolio'],
    skills: [],
    contact: [],
  };

  fileSystem: { [key: string]: { type: 'file' | 'directory', content?: string } } = {
    'resume.txt': { type: 'file', content: 'Eve Liang\nFull-Stack Software Engineer\nEmail: byleve2022@gmail.com\nGitHub: github.com/Everoot' },
    'README.md': { type: 'file', content: 'Welcome to Eve Liang\'s Portfolio Terminal!\n\nAvailable Commands:\n- help          Show available commands\n- ls            List directory contents\n- cd <dir>      Change directory\n- cat <file>    Display file contents\n- clear         Clear terminal\n- pwd           Show current directory\n- whoami        Show user information\n- history       Show command history\n- man <cmd>     Show manual for command' },
    '.git': { type: 'directory' },
    '.config': { type: 'directory' },
  };

  constructor(
    private windowManager: WindowManagerService,
    private appConfig: AppConfigService
  ) {}

  ngOnInit() {
    this.restartTerminal();
  }

  ngAfterViewChecked() {
    // This lifecycle hook runs after every change detection
    // We don't need to do anything here as cursor is managed by startCursor
  }

  ngOnDestroy() {
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
  }

  restartTerminal() {
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
    this.terminalRows.set([]);
    this.currentRowId = 1;
    this.appendTerminalRow();
  }

  appendTerminalRow() {
    const newRow: TerminalRow = {
      id: this.currentRowId,
      command: '',
      result: '',
      isActive: true
    };
    this.terminalRows.update(rows => [...rows, newRow]);
    this.currentInputs[this.currentRowId] = '';
    this.cursorVisibleMap[this.currentRowId] = true;
    this.currentRowId += 2;
    
    // Focus the new input after a short delay
    setTimeout(() => {
      this.startCursor(newRow.id);
    }, 100);
  }

  onCommandInput(rowId: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const command = input.value;

    if (event.key === 'Enter') {
      event.preventDefault();
      if (command.trim().length !== 0) {
        this.removeCursor(rowId);
        this.executeCommand(rowId, command.trim());
        this.commandHistory.push(command.trim());
        this.commandHistoryIndex = this.commandHistory.length;
        this.clearInput(rowId);
      } else {
        return;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      let prevCommand = '';
      if (this.commandHistoryIndex <= -1) {
        prevCommand = '';
      } else {
        prevCommand = this.commandHistory[this.commandHistoryIndex];
      }
      input.value = prevCommand;
      this.currentInputs[rowId] = prevCommand;
      const span = document.querySelector(`#show-${rowId}`) as HTMLElement;
      if (span) {
        span.textContent = prevCommand;
      }
      this.commandHistoryIndex--;
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.commandHistoryIndex >= this.commandHistory.length) return;
      if (this.commandHistoryIndex <= -1) this.commandHistoryIndex = 0;
      let prevCommand = '';
      if (this.commandHistoryIndex === this.commandHistory.length) {
        prevCommand = '';
      } else {
        prevCommand = this.commandHistory[this.commandHistoryIndex];
      }
      input.value = prevCommand;
      this.currentInputs[rowId] = prevCommand;
      const span = document.querySelector(`#show-${rowId}`) as HTMLElement;
      if (span) {
        span.textContent = prevCommand;
      }
      this.commandHistoryIndex++;
    } else if (event.key === 'Tab') {
      event.preventDefault();
      // Basic tab completion
      const partial = command.toLowerCase();
      const commands = ['cd', 'ls', 'pwd', 'cat', 'echo', 'clear', 'exit', 'help', 'whoami', 'history', 'man', 'touch', 'mkdir', 'rm', 'mv', 'cp', 'about', 'projects', 'skills', 'contact', 'settings', 'code', 'chrome'];
      const matches = commands.filter(cmd => cmd.startsWith(partial));
      if (matches.length === 1) {
        input.value = matches[0] + ' ';
        this.currentInputs[rowId] = matches[0] + ' ';
        const span = document.querySelector(`#show-${rowId}`) as HTMLElement;
        if (span) {
          span.textContent = matches[0] + ' ';
        }
        setTimeout(() => {
          input.setSelectionRange(matches[0].length + 1, matches[0].length + 1);
        }, 0);
      }
    }
  }

  onInputChange(rowId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.currentInputs[rowId] = value;
    // Update the display span directly
    const span = document.querySelector(`#show-${rowId}`) as HTMLElement;
    if (span) {
      span.textContent = value;
    }
  }

  executeCommand(rowId: number, command: string) {
    const rows = this.terminalRows();
    const rowIndex = rows.findIndex(r => r.id === rowId);
    if (rowIndex === -1) return;

    const words = command.split(' ').filter(Boolean);
    const main = words[0].toLowerCase();
    const args = words.slice(1);
    let result = '';

    // Mark current row as inactive and set command
    rows[rowIndex].isActive = false;
    rows[rowIndex].command = command;
    
    // Update the display to show the command
    const span = document.querySelector(`#show-${rowId}`) as HTMLElement;
    if (span) {
      span.textContent = command;
    }

    switch (main) {
      case 'cd':
        if (args.length === 0 || args[0] === '' || args[0] === '~') {
          this.currentDirectory.set('~');
          this.currentDirName.set('root');
        } else if (args.length > 1) {
          result = 'bash: cd: too many arguments';
        } else {
          const target = args[0];
          if (target === '..') {
            // Go to parent directory
            const pathParts = this.currentDirectory().split('/').filter(p => p && p !== '~');
            if (pathParts.length > 0) {
              pathParts.pop();
              if (pathParts.length === 0) {
                this.currentDirectory.set('~');
                this.currentDirName.set('root');
              } else {
                this.currentDirectory.set('~/' + pathParts.join('/'));
                this.currentDirName.set(pathParts[pathParts.length - 1]);
              }
            }
          } else if (target === '.') {
            // Stay in current directory
            // Do nothing
          } else if (target.startsWith('~/')) {
            // Absolute path from home
            const pathParts = target.substring(2).split('/').filter(p => p);
            if (pathParts.length > 0 && this.childDirectories['root']?.includes(pathParts[0])) {
              this.currentDirectory.set('~/' + pathParts.join('/'));
              this.currentDirName.set(pathParts[pathParts.length - 1]);
            } else {
              result = `bash: cd: ${target}: No such file or directory`;
            }
          } else if (this.childDirectories[this.currentDirName()]?.includes(target)) {
            this.currentDirectory.update(dir => dir + '/' + target);
            this.currentDirName.set(target);
          } else {
            result = `bash: cd: ${target}: No such file or directory`;
          }
        }
        break;

      case 'ls':
        if (args.length > 2 || (args.length === 1 && args[0] !== '-l' && args[0] !== '-a' && args[0] !== '-la' && args[0] !== '-al')) {
          const target = args.find(arg => !arg.startsWith('-')) || this.currentDirName();
          const dir = this.childDirectories[target] || this.childDirectories[this.currentDirName()];
          if (dir) {
            const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
            const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
            const items = showHidden ? dir : dir.filter(item => !item.startsWith('.'));
            
            if (longFormat) {
              result = items.map(item => {
                const isDir = this.childDirectories[item] !== undefined || this.fileSystem[item]?.type === 'directory';
                const isFile = this.fileSystem[item]?.type === 'file';
                const type = isDir ? 'd' : '-';
                const perms = isDir ? 'rwxr-xr-x' : 'rw-r--r--';
                const size = isFile ? '1.2K' : '4.0K';
                const date = 'Jan 31 20:00';
                const name = item;
                const color = isDir ? 'text-ubt-blue' : 'text-white';
                return `<span class="${color}">${type}${perms} 1 eve eve ${size} ${date} ${name}</span>`;
              }).join('<br>');
            } else {
              result = items.map(item => {
                const isDir = this.childDirectories[item] !== undefined || this.fileSystem[item]?.type === 'directory';
                const color = isDir ? 'text-ubt-blue' : 'text-white';
                return `<span class="${color} font-bold mr-2">${item}</span>`;
              }).join('');
            }
          } else {
            result = `ls: cannot access '${target}': No such file or directory`;
          }
        } else {
          const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
          const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
          const dir = this.childDirectories[this.currentDirName()] || [];
          const items = showHidden ? dir : dir.filter(item => !item.startsWith('.'));
          
          if (longFormat) {
            result = items.map(item => {
              const isDir = this.childDirectories[item] !== undefined || this.fileSystem[item]?.type === 'directory';
              const isFile = this.fileSystem[item]?.type === 'file';
              const type = isDir ? 'd' : '-';
              const perms = isDir ? 'rwxr-xr-x' : 'rw-r--r--';
              const size = isFile ? '1.2K' : '4.0K';
              const date = 'Jan 31 20:00';
              const name = item;
              const color = isDir ? 'text-ubt-blue' : 'text-white';
              return `<span class="${color}">${type}${perms} 1 eve eve ${size} ${date} ${name}</span>`;
            }).join('<br>');
          } else {
            result = items.map(item => {
              const isDir = this.childDirectories[item] !== undefined || this.fileSystem[item]?.type === 'directory';
              const color = isDir ? 'text-ubt-blue' : 'text-white';
              return `<span class="${color} font-bold mr-2">${item}</span>`;
            }).join('');
          }
        }
        break;

      case 'pwd':
        result = this.currentDirectory().replace('~', '/home/eve');
        break;

      case 'echo':
        if (args.length === 0) {
          result = '';
        } else {
          // Handle echo with quotes
          let text = args.join(' ');
          if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
            text = text.slice(1, -1);
          }
          result = this.escapeHtml(text);
        }
        break;

      case 'clear':
        this.restartTerminal();
        return;

      case 'exit':
        this.windowManager.closeWindow('terminal');
        return;

      case 'help':
        result = `Available Commands:<br>
<span class="text-ubt-green">File Operations:</span><br>
  ls [options] [dir]    List directory contents (-l: long format, -a: show hidden)<br>
  cd [dir]              Change directory<br>
  pwd                   Print working directory<br>
  cat [file]            Display file contents<br>
  touch [file]          Create empty file<br>
  mkdir [dir]           Create directory<br>
  rm [file]             Remove file<br>
  mv [src] [dest]       Move/rename file<br>
  cp [src] [dest]       Copy file<br>
<br>
<span class="text-ubt-green">System:</span><br>
  whoami                Display current user<br>
  history               Show command history<br>
  clear                 Clear terminal<br>
  exit                  Close terminal<br>
  help                  Show this help message<br>
  man [cmd]             Show manual for command<br>
<br>
<span class="text-ubt-green">Applications:</span><br>
  about                 Open About window<br>
  projects              Open Projects window<br>
  skills                Open Skills window<br>
  contact               Open Contact window<br>
  settings              Open Settings window<br>
  code                  Open VS Code<br>
  chrome                Open Chrome browser`;
        break;

      case 'about':
        this.windowManager.openWindow(this.appConfig.getAppById('about')!);
        result = 'Opening About window...';
        break;

      case 'projects':
        this.windowManager.openWindow(this.appConfig.getAppById('projects')!);
        result = 'Opening Projects window...';
        break;

      case 'skills':
        this.windowManager.openWindow(this.appConfig.getAppById('skills')!);
        result = 'Opening Skills window...';
        break;

      case 'contact':
        this.windowManager.openWindow(this.appConfig.getAppById('contact')!);
        result = 'Opening Contact window...';
        break;

      case 'settings':
        this.windowManager.openWindow(this.appConfig.getAppById('settings')!);
        result = 'Opening Settings window...';
        break;

      case 'code':
        this.windowManager.openWindow(this.appConfig.getAppById('vscode')!);
        result = 'Opening VS Code...';
        break;

      case 'chrome':
        this.windowManager.openWindow(this.appConfig.getAppById('chrome')!);
        result = 'Opening Chrome...';
        break;

      case 'cat':
        if (args.length === 0) {
          result = 'cat: missing file operand<br>Try \'cat --help\' for more information.';
        } else {
          const fileName = args[0];
          if (this.fileSystem[fileName]?.type === 'file' && this.fileSystem[fileName].content) {
            result = this.fileSystem[fileName].content!.replace(/\n/g, '<br>');
          } else if (this.childDirectories[this.currentDirName()]?.includes(fileName)) {
            result = `cat: ${fileName}: Is a directory`;
          } else {
            result = `cat: ${fileName}: No such file or directory`;
          }
        }
        break;

      case 'touch':
        if (args.length === 0) {
          result = 'touch: missing file operand<br>Try \'touch --help\' for more information.';
        } else {
          const fileName = args[0];
          if (!this.fileSystem[fileName]) {
            this.fileSystem[fileName] = { type: 'file', content: '' };
            if (!this.childDirectories[this.currentDirName()]) {
              this.childDirectories[this.currentDirName()] = [];
            }
            if (!this.childDirectories[this.currentDirName()].includes(fileName)) {
              this.childDirectories[this.currentDirName()].push(fileName);
            }
            result = '';
          } else {
            result = ''; // Touch updates timestamp, but we don't track that
          }
        }
        break;

      case 'mkdir':
        if (args.length === 0) {
          result = 'mkdir: missing operand<br>Try \'mkdir --help\' for more information.';
        } else {
          const dirName = args[0];
          if (this.childDirectories[dirName]) {
            result = `mkdir: cannot create directory '${dirName}': File exists`;
          } else {
            this.childDirectories[dirName] = [];
            if (!this.childDirectories[this.currentDirName()]) {
              this.childDirectories[this.currentDirName()] = [];
            }
            this.childDirectories[this.currentDirName()].push(dirName);
            this.fileSystem[dirName] = { type: 'directory' };
            result = '';
          }
        }
        break;

      case 'rm':
        if (args.length === 0) {
          result = 'rm: missing operand<br>Try \'rm --help\' for more information.';
        } else {
          const fileName = args[0];
          if (this.fileSystem[fileName]) {
            delete this.fileSystem[fileName];
            const dir = this.childDirectories[this.currentDirName()];
            if (dir) {
              const index = dir.indexOf(fileName);
              if (index > -1) {
                dir.splice(index, 1);
              }
            }
            result = '';
          } else {
            result = `rm: cannot remove '${fileName}': No such file or directory`;
          }
        }
        break;

      case 'mv':
        if (args.length < 2) {
          result = 'mv: missing file operand<br>Try \'mv --help\' for more information.';
        } else {
          const src = args[0];
          const dest = args[1];
          if (this.fileSystem[src]) {
            this.fileSystem[dest] = this.fileSystem[src];
            delete this.fileSystem[src];
            const dir = this.childDirectories[this.currentDirName()];
            if (dir) {
              const srcIndex = dir.indexOf(src);
              if (srcIndex > -1) {
                dir.splice(srcIndex, 1);
              }
              if (!dir.includes(dest)) {
                dir.push(dest);
              }
            }
            result = '';
          } else {
            result = `mv: cannot stat '${src}': No such file or directory`;
          }
        }
        break;

      case 'cp':
        if (args.length < 2) {
          result = 'cp: missing file operand<br>Try \'cp --help\' for more information.';
        } else {
          const src = args[0];
          const dest = args[1];
          if (this.fileSystem[src]) {
            this.fileSystem[dest] = { ...this.fileSystem[src] };
            const dir = this.childDirectories[this.currentDirName()];
            if (dir && !dir.includes(dest)) {
              dir.push(dest);
            }
            result = '';
          } else {
            result = `cp: cannot stat '${src}': No such file or directory`;
          }
        }
        break;

      case 'whoami':
        result = 'eve';
        break;

      case 'history':
        if (this.commandHistory.length === 0) {
          result = '';
        } else {
          result = this.commandHistory.map((cmd, idx) => {
            return `<span class="text-gray-400">${idx + 1}</span>  ${this.escapeHtml(cmd)}`;
          }).join('<br>');
        }
        break;

      case 'man':
        if (args.length === 0) {
          result = 'What manual page do you want?<br>For example, try \'man ls\' or \'man cd\'.';
        } else {
          const cmd = args[0].toLowerCase();
          const manPages: { [key: string]: string } = {
            'ls': 'LS(1)                    User Commands                   LS(1)<br><br>NAME<br>       ls - list directory contents<br><br>SYNOPSIS<br>       ls [OPTION]... [FILE]...<br><br>DESCRIPTION<br>       List  information  about  the FILEs (the current directory by default).<br>       Sort entries alphabetically.<br><br>OPTIONS<br>       -a, --all<br>              do not ignore entries starting with .<br><br>       -l     use a long listing format<br><br>EXAMPLES<br>       ls          list current directory<br>       ls -a       list all files including hidden<br>       ls -l       long format listing',
            'cd': 'CD(1)                    User Commands                   CD(1)<br><br>NAME<br>       cd - change directory<br><br>SYNOPSIS<br>       cd [DIRECTORY]<br><br>DESCRIPTION<br>       Change the current directory to DIRECTORY.  The default DIRECTORY is the<br>       value of the HOME shell variable.<br><br>EXAMPLES<br>       cd          go to home directory<br>       cd ..       go to parent directory<br>       cd ~/projects  go to projects directory',
            'cat': 'CAT(1)                   User Commands                  CAT(1)<br><br>NAME<br>       cat - concatenate files and print on the standard output<br><br>SYNOPSIS<br>       cat [FILE]...<br><br>DESCRIPTION<br>       Concatenate FILE(s) to standard output.<br><br>EXAMPLES<br>       cat file.txt    display file contents',
            'pwd': 'PWD(1)                   User Commands                  PWD(1)<br><br>NAME<br>       pwd - print name of current/working directory<br><br>SYNOPSIS<br>       pwd<br><br>DESCRIPTION<br>       Print the full filename of the current working directory.',
            'mkdir': 'MKDIR(1)                 User Commands                MKDIR(1)<br><br>NAME<br>       mkdir - make directories<br><br>SYNOPSIS<br>       mkdir [OPTION]... DIRECTORY...<br><br>DESCRIPTION<br>       Create the DIRECTORY(ies), if they do not already exist.',
            'rm': 'RM(1)                    User Commands                   RM(1)<br><br>NAME<br>       rm - remove files or directories<br><br>SYNOPSIS<br>       rm [OPTION]... FILE...<br><br>DESCRIPTION<br>       This manual page documents the GNU version of rm.',
            'touch': 'TOUCH(1)                 User Commands                TOUCH(1)<br><br>NAME<br>       touch - change file timestamps<br><br>SYNOPSIS<br>       touch [OPTION]... FILE...<br><br>DESCRIPTION<br>       Update the access and modification times of each FILE to the current time.',
          };
          result = manPages[cmd] || `No manual entry for ${cmd}`;
        }
        break;

      default:
        result = `bash: ${main}: command not found<br>Type 'help' to see available commands.`;
    }

    rows[rowIndex].result = result;
    this.terminalRows.set([...rows]);
    
    // Update result in DOM
    const resultDiv = document.querySelector(`#row-result-${rowId}`) as HTMLElement;
    if (resultDiv) {
      resultDiv.innerHTML = result;
    }
    
    this.appendTerminalRow();
  }

  escapeHtml(text: string): string {
    if (!text) return '';
    return text.split('').map(char => {
      switch (char) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#x27;';
        case '/':
          return '&#x2F;';
        default:
          return char;
      }
    }).join('');
  }

  startCursor(rowId: number) {
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
    
    this.currentActiveRowId = rowId;
    this.cursorVisibleMap[rowId] = true;
    
    // Ensure input is focused
    setTimeout(() => {
      const input = document.querySelector(`#terminal-input-${rowId}`) as HTMLInputElement;
      if (input) {
        input.focus();
        // Set up input listener
        input.addEventListener('input', () => {
          const span = document.querySelector(`#show-${rowId}`) as HTMLElement;
          if (span) {
            span.textContent = input.value;
          }
        });
      }
    }, 0);
    
    // Start cursor blinking
    this.cursorInterval = setInterval(() => {
      const cursor = document.querySelector(`#cursor-${rowId}`) as HTMLElement;
      if (cursor) {
        if (cursor.style.visibility === 'visible') {
          cursor.style.visibility = 'hidden';
          this.cursorVisibleMap[rowId] = false;
        } else {
          cursor.style.visibility = 'visible';
          this.cursorVisibleMap[rowId] = true;
        }
      }
    }, 500);
  }

  stopCursor(rowId: number) {
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
    const cursor = document.querySelector(`#cursor-${rowId}`) as HTMLElement;
    if (cursor) {
      cursor.style.visibility = 'visible';
      this.cursorVisibleMap[rowId] = true;
    }
  }

  removeCursor(rowId: number) {
    this.stopCursor(rowId);
    const cursor = document.querySelector(`#cursor-${rowId}`) as HTMLElement;
    if (cursor) {
      cursor.style.display = 'none';
    }
  }

  clearInput(rowId: number) {
    const input = document.querySelector(`#terminal-input-${rowId}`) as HTMLInputElement;
    if (input) {
      input.blur();
    }
  }

  focusCursor(rowId: number) {
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
    this.startCursor(rowId);
  }

  unFocusCursor(rowId: number) {
    this.stopCursor(rowId);
  }

  getCurrentCommand(rowId: number): string {
    return this.currentInputs[rowId] || '';
  }
}
