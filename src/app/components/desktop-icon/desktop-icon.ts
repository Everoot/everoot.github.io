import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { App } from '../../services/app-config';

@Component({
  selector: 'app-desktop-icon',
  imports: [CommonModule],
  templateUrl: './desktop-icon.html',
  styleUrl: './desktop-icon.css',
})
export class DesktopIconComponent {
  @Input() app!: App;
  @Output() openApp = new EventEmitter<App>();

  isMobile(): boolean {
    return window.innerWidth < 768 || 'ontouchstart' in window;
  }

  onDoubleClick() {
    // Desktop: double click
    if (!this.isMobile()) {
      this.openApp.emit(this.app);
    }
  }

  onClick() {
    // Mobile: single click
    if (this.isMobile()) {
      this.openApp.emit(this.app);
    }
  }

  onTouchEnd(event: TouchEvent) {
    // Handle touch events for mobile
    event.preventDefault();
    event.stopPropagation();
    this.openApp.emit(this.app);
  }
}
