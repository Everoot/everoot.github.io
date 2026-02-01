import { Injectable, signal } from '@angular/core';
import { App } from './app-config';

export interface WindowState {
  id: string;
  app: App;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class WindowManagerService {
  private windows = signal<Map<string, WindowState>>(new Map());
  private nextZIndex = signal(1000);
  private backgroundImage = signal('wall-1');

  getWindows() {
    return this.windows();
  }

  getBackgroundImage() {
    return this.backgroundImage();
  }

  setBackgroundImage(image: string) {
    this.backgroundImage.set(image);
    localStorage.setItem('bg-image', image);
  }

  openWindow(app: App) {
    const windows = new Map(this.windows());
    const existingWindow = windows.get(app.id);

    if (existingWindow && existingWindow.isMinimized) {
      // Restore minimized window
      existingWindow.isMinimized = false;
      existingWindow.isFocused = true;
      existingWindow.zIndex = this.nextZIndex();
      this.nextZIndex.update(v => v + 1);
      windows.set(app.id, existingWindow);
      this.windows.set(windows);
      this.trackFrequentApp(app.id);
      return;
    }

    if (existingWindow && existingWindow.isOpen) {
      // Focus existing window
      this.focusWindow(app.id);
      return;
    }

    // Track frequent apps for new windows
    this.trackFrequentApp(app.id);

    // Create new window - center it on screen with slight offset for multiple windows
    const openWindows = Array.from(windows.values()).filter(w => w.isOpen && !w.isMinimized);
    const windowCount = openWindows.length;
    
    // Window dimensions (percentage) - responsive based on screen size
    const isMobile = window.innerWidth < 640; // Tailwind's sm breakpoint
    const windowWidthPercent = isMobile ? 85 : 60;
    const windowHeightPercent = isMobile ? 60 : 70;
    
    // Calculate centered position
    const centerX = (100 - windowWidthPercent) / 2;
    const centerY = (100 - windowHeightPercent) / 2;
    
    // Add offset for multiple windows (cascade effect)
    const offsetPercent = 3; // 3% offset per window
    const finalX = Math.max(5, Math.min(centerX + (windowCount * offsetPercent), 100 - windowWidthPercent - 5));
    const finalY = Math.max(5, Math.min(centerY + (windowCount * offsetPercent), 100 - windowHeightPercent - 5));
    
    const newWindow: WindowState = {
      id: app.id,
      app,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      x: finalX,
      y: finalY,
      width: windowWidthPercent,
      height: windowHeightPercent,
      zIndex: this.nextZIndex()
    };

    this.nextZIndex.update(v => v + 1);
    windows.set(app.id, newWindow);
    this.windows.set(windows);
  }

  closeWindow(id: string) {
    const windows = new Map(this.windows());
    const window = windows.get(id);
    if (window) {
      window.isOpen = false;
      windows.set(id, window);
      this.windows.set(windows);
    }
  }

  minimizeWindow(id: string) {
    const windows = new Map(this.windows());
    const window = windows.get(id);
    if (window) {
      window.isMinimized = true;
      window.isFocused = false;
      windows.set(id, window);
      this.windows.set(windows);
    }
  }

  maximizeWindow(id: string) {
    const windows = new Map(this.windows());
    const window = windows.get(id);
    if (window) {
      window.isMaximized = !window.isMaximized;
      if (window.isMaximized) {
        window.x = 0;
        window.y = 0;
        window.width = 100;
        window.height = 100;
      }
      windows.set(id, window);
      this.windows.set(windows);
    }
  }

  focusWindow(id: string) {
    const windows = new Map(this.windows());
    windows.forEach((window, key) => {
      window.isFocused = key === id;
      if (key === id) {
        window.zIndex = this.nextZIndex();
        this.nextZIndex.update(v => v + 1);
      }
    });
    this.windows.set(windows);
  }

  updateWindowPosition(id: string, x: number, y: number) {
    const windows = new Map(this.windows());
    const window = windows.get(id);
    if (window && !window.isMaximized) {
      window.x = x;
      window.y = y;
      windows.set(id, window);
      this.windows.set(windows);
    }
  }

  updateWindowSize(id: string, width: number, height: number) {
    const windows = new Map(this.windows());
    const window = windows.get(id);
    if (window && !window.isMaximized) {
      window.width = width;
      window.height = height;
      windows.set(id, window);
      this.windows.set(windows);
    }
  }

  private trackFrequentApp(appId: string) {
    const frequentAppsStr = localStorage.getItem('frequentApps');
    let frequentApps: { id: string; frequency: number }[] = frequentAppsStr 
      ? JSON.parse(frequentAppsStr) 
      : [];
    
    const currentApp = frequentApps.find(app => app.id === appId);
    if (currentApp) {
      // Increase frequency if app is found
      frequentApps.forEach((app) => {
        if (app.id === currentApp.id) {
          app.frequency += 1;
        }
      });
    } else {
      // New app opened
      frequentApps.push({ id: appId, frequency: 1 });
    }

    // Sort by frequency (descending)
    frequentApps.sort((a, b) => {
      if (a.frequency < b.frequency) return 1;
      if (a.frequency > b.frequency) return -1;
      return 0;
    });

    localStorage.setItem('frequentApps', JSON.stringify(frequentApps));
  }
}
