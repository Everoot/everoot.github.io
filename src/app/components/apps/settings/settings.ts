import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowManagerService } from '../../../services/window-manager';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent {
  wallpapers: { [key: string]: string } = {
    'wall-1': '/assets/images/wallpapers/wall-1.png',
    'wall-2': '/assets/images/wallpapers/wall-2.jpg',
  };

  wallpaperKeys = Object.keys(this.wallpapers);
  currentBg = 'wall-1';

  constructor(private windowManager: WindowManagerService) {
    this.currentBg = this.windowManager.getBackgroundImage();
  }

  changeBackground(wallpaper: string) {
    this.currentBg = wallpaper;
    this.windowManager.setBackgroundImage(wallpaper);
    // Trigger change detection by dispatching a custom event
    window.dispatchEvent(new CustomEvent('background-changed', { detail: wallpaper }));
  }

  getWallpaperStyle(wallpaper: string) {
    return {
      'background-image': `url('${this.wallpapers[wallpaper]}')`,
      'background-size': 'cover',
      'background-repeat': 'no-repeat',
      'background-position': 'center center'
    };
  }
}
