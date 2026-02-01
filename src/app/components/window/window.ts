import { Component, Input, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowState } from '../../services/window-manager';
import { WindowManagerService } from '../../services/window-manager';
import { AboutComponent } from '../apps/about/about';
import { ProjectsComponent } from '../apps/projects/projects';
import { SkillsComponent } from '../apps/skills/skills';
import { ContactComponent } from '../apps/contact/contact';
import { TerminalComponent } from '../apps/terminal/terminal';
import { SettingsComponent } from '../apps/settings/settings';
import { ChromeComponent } from '../apps/chrome/chrome';
import { TrashComponent } from '../apps/trash/trash';
import { VscodeComponent } from '../apps/vscode/vscode';

@Component({
  selector: 'app-window',
  imports: [CommonModule, AboutComponent, ProjectsComponent, SkillsComponent, ContactComponent, TerminalComponent, SettingsComponent, ChromeComponent, TrashComponent, VscodeComponent],
  templateUrl: './window.html',
  styleUrl: './window.css',
})
export class WindowComponent implements OnInit {
  @Input() windowState!: WindowState;
  
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartWindowX = 0;
  private dragStartWindowY = 0;
  
  isResizing = false;
  resizeDirection = '';
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;
  private resizeStartWindowX = 0;
  private resizeStartWindowY = 0;
  
  constructor(
    private windowManager: WindowManagerService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    // Initialize window position and size
  }

  close() {
    this.windowManager.closeWindow(this.windowState.id);
  }

  minimize() {
    this.windowManager.minimizeWindow(this.windowState.id);
  }

  maximize() {
    this.windowManager.maximizeWindow(this.windowState.id);
  }

  focus() {
    this.windowManager.focusWindow(this.windowState.id);
  }

  getWindowStyle() {
    const isMobile = window.innerWidth < 640;
    const style: any = {
      position: 'absolute',
      left: this.windowState.isMaximized ? '0' : `${this.windowState.x}%`,
      top: this.windowState.isMaximized ? '0' : `${this.windowState.y}%`,
      width: this.windowState.isMaximized ? '100%' : `${this.windowState.width}%`,
      height: this.windowState.isMaximized ? '100%' : `${this.windowState.height}%`,
      zIndex: this.windowState.zIndex,
    };
    
    // On mobile, ensure windows don't go off screen
    if (isMobile && !this.windowState.isMaximized) {
      style.maxWidth = '95%';
      style.maxHeight = '95%';
    }
    
    return style;
  }

  getComponent() {
    switch (this.windowState.app.id) {
      case 'about':
        return AboutComponent;
      case 'projects':
        return ProjectsComponent;
      case 'skills':
        return SkillsComponent;
      case 'contact':
        return ContactComponent;
      case 'terminal':
        return TerminalComponent;
      case 'settings':
        return SettingsComponent;
      case 'chrome':
        return ChromeComponent;
      case 'trash':
        return TrashComponent;
      case 'vscode':
        return VscodeComponent;
      default:
        return null;
    }
  }

  onHeaderMouseDown(event: MouseEvent) {
    if (this.windowState.isMaximized) {
      return;
    }
    
    this.focus();
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartWindowX = this.windowState.x;
    this.dragStartWindowY = this.windowState.y;
    
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    // Handle resizing first
    if (this.isResizing && !this.windowState.isMaximized) {
      this.handleResize(event);
      return;
    }
    
    // Handle dragging
    if (this.isDragging && !this.windowState.isMaximized) {
      const deltaX = event.clientX - this.dragStartX;
      const deltaY = event.clientY - this.dragStartY;

      // Convert pixel deltas to percentage
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const deltaXPercent = (deltaX / windowWidth) * 100;
      const deltaYPercent = (deltaY / windowHeight) * 100;

      let newX = this.dragStartWindowX + deltaXPercent;
      let newY = this.dragStartWindowY + deltaYPercent;

      // Keep window within bounds
      newX = Math.max(0, Math.min(newX, 100 - this.windowState.width));
      newY = Math.max(0, Math.min(newY, 100 - this.windowState.height));

      this.windowManager.updateWindowPosition(this.windowState.id, newX, newY);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
    }
    if (this.isResizing) {
      this.isResizing = false;
      this.resizeDirection = '';
    }
  }

  onResizeMouseDown(event: MouseEvent, direction: string) {
    if (this.windowState.isMaximized) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    this.focus();
    this.isResizing = true;
    this.resizeDirection = direction;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartWidth = this.windowState.width;
    this.resizeStartHeight = this.windowState.height;
    this.resizeStartWindowX = this.windowState.x;
    this.resizeStartWindowY = this.windowState.y;
  }

  private handleResize(event: MouseEvent) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const deltaX = event.clientX - this.resizeStartX;
    const deltaY = event.clientY - this.resizeStartY;
    
    const deltaXPercent = (deltaX / windowWidth) * 100;
    const deltaYPercent = (deltaY / windowHeight) * 100;
    
    let newWidth = this.resizeStartWidth;
    let newHeight = this.resizeStartHeight;
    let newX = this.resizeStartWindowX;
    let newY = this.resizeStartWindowY;
    
    const minWidth = 20; // Minimum 20% width
    const minHeight = 20; // Minimum 20% height
    
    // Handle different resize directions
    if (this.resizeDirection.includes('right')) {
      newWidth = Math.max(minWidth, Math.min(this.resizeStartWidth + deltaXPercent, 100 - this.resizeStartWindowX));
    }
    if (this.resizeDirection.includes('left')) {
      const widthChange = -deltaXPercent;
      newWidth = Math.max(minWidth, Math.min(this.resizeStartWidth + widthChange, this.resizeStartWidth + this.resizeStartWindowX));
      if (newWidth !== this.resizeStartWidth) {
        newX = this.resizeStartWindowX + (this.resizeStartWidth - newWidth);
      }
    }
    if (this.resizeDirection.includes('bottom')) {
      newHeight = Math.max(minHeight, Math.min(this.resizeStartHeight + deltaYPercent, 100 - this.resizeStartWindowY));
    }
    if (this.resizeDirection.includes('top')) {
      const heightChange = -deltaYPercent;
      newHeight = Math.max(minHeight, Math.min(this.resizeStartHeight + heightChange, this.resizeStartHeight + this.resizeStartWindowY));
      if (newHeight !== this.resizeStartHeight) {
        newY = this.resizeStartWindowY + (this.resizeStartHeight - newHeight);
      }
    }
    
    // Ensure window stays within bounds
    if (newX + newWidth > 100) {
      newWidth = 100 - newX;
    }
    if (newY + newHeight > 100) {
      newHeight = 100 - newY;
    }
    if (newX < 0) {
      newWidth += newX;
      newX = 0;
    }
    if (newY < 0) {
      newHeight += newY;
      newY = 0;
    }
    
    this.windowManager.updateWindowPosition(this.windowState.id, newX, newY);
    this.windowManager.updateWindowSize(this.windowState.id, newWidth, newHeight);
  }

  getResizeCursor(direction: string): string {
    if (this.windowState.isMaximized) {
      return 'default';
    }
    
    const cursors: { [key: string]: string } = {
      'top': 'n-resize',
      'bottom': 's-resize',
      'left': 'w-resize',
      'right': 'e-resize',
      'top-left': 'nw-resize',
      'top-right': 'ne-resize',
      'bottom-left': 'sw-resize',
      'bottom-right': 'se-resize'
    };
    return cursors[direction] || 'default';
  }
}
