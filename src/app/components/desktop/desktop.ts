import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { AppConfigService, App } from '../../services/app-config';
import { WindowManagerService } from '../../services/window-manager';
import { DesktopIconComponent } from '../desktop-icon/desktop-icon';
import { SidebarComponent } from '../sidebar/sidebar';
import { WindowComponent } from '../window/window';
import { NavbarComponent } from '../navbar/navbar';
import { AllApplicationsComponent } from '../all-applications/all-applications';

@Component({
  selector: 'app-desktop',
  imports: [CommonModule, KeyValuePipe, DesktopIconComponent, SidebarComponent, WindowComponent, NavbarComponent, AllApplicationsComponent],
  templateUrl: './desktop.html',
  styleUrl: './desktop.css',
})
export class DesktopComponent implements OnInit, OnDestroy {
  desktopApps = signal<App[]>([]);
  hideSidebar = signal(false);
  backgroundImage = signal('wall-1');
  allAppsView = signal(false);
  private backgroundChangeHandler?: (event: any) => void;

  constructor(
    public appConfig: AppConfigService,
    public windowManager: WindowManagerService
  ) {}

  ngOnInit() {
    this.desktopApps.set(this.appConfig.getDesktopApps());
    
    // Load background image from localStorage or use default
    const savedBg = localStorage.getItem('bg-image');
    if (savedBg) {
      this.backgroundImage.set(savedBg);
    } else {
      this.backgroundImage.set('wall-1');
      localStorage.setItem('bg-image', 'wall-1');
    }

    // Listen for background changes
    this.backgroundChangeHandler = (event: any) => {
      this.backgroundImage.set(event.detail);
    };
    window.addEventListener('background-changed', this.backgroundChangeHandler);
  }

  ngOnDestroy() {
    if (this.backgroundChangeHandler) {
      window.removeEventListener('background-changed', this.backgroundChangeHandler);
    }
  }

  openApp(app: App) {
    if (app.isExternalApp && app.url) {
      window.open(app.url, '_blank');
    } else {
      this.windowManager.openWindow(app);
    }
    // Close all applications view when opening an app
    if (this.allAppsView()) {
      this.allAppsView.set(false);
    }
  }

  showAllApps() {
    this.allAppsView.update(view => !view);
  }

  onLockScreen() {
    // TODO: Implement lock screen
    console.log('Lock screen');
  }

  onShutDown() {
    // TODO: Implement shutdown
    console.log('Shut down');
  }

  getBackgroundStyle() {
    const bgImages: { [key: string]: string } = {
      'wall-1': '/assets/images/wallpapers/wall-1.png',
      'wall-2': '/assets/images/wallpapers/wall-2.jpg',
      'wall-3': '/assets/images/wallpapers/wall-3.webp',
      'wall-4': '/assets/images/wallpapers/wall-4.webp',
      'wall-5': '/assets/images/wallpapers/wall-5.webp',
      'wall-6': '/assets/images/wallpapers/wall-6.webp',
      'wall-7': '/assets/images/wallpapers/wall-7.webp',
      'wall-8': '/assets/images/wallpapers/wall-8.webp',
    };
    
    const bgImage = bgImages[this.backgroundImage()] || bgImages['wall-1'];
    
    return {
      'background-image': `url('${bgImage}')`,
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
      'background-position-x': 'center'
    };
  }
}
