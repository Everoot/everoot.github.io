import { Injectable } from '@angular/core';

export interface App {
  id: string;
  title: string;
  icon: string;
  disabled: boolean;
  favourite: boolean;
  desktop_shortcut: boolean;
  isExternalApp?: boolean;
  url?: string;
  component?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private apps: App[] = [
    {
      id: 'about',
      title: 'About Eve',
      icon: '/assets/themes/Yaru/system/user-home.png',
      disabled: false,
      favourite: true,
      desktop_shortcut: true,
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: '/assets/themes/Yaru/system/folder.png',
      disabled: false,
      favourite: false,
      desktop_shortcut: true,
    },
    {
      id: 'skills',
      title: 'Skills',
      icon: '/assets/themes/Yaru/system/folder.png',
      disabled: false,
      favourite: false,
      desktop_shortcut: true,
    },
    {
      id: 'contact',
      title: 'Contact Me',
      icon: '/assets/themes/Yaru/apps/gedit.png',
      disabled: false,
      favourite: false,
      desktop_shortcut: true,
    },
    {
      id: 'terminal',
      title: 'Terminal',
      icon: '/assets/themes/Yaru/apps/bash.png',
      disabled: false,
      favourite: true,
      desktop_shortcut: false,
    },
    {
      id: 'github',
      title: 'GitHub',
      icon: '/assets/themes/Yaru/apps/github.png',
      disabled: false,
      favourite: false,
      desktop_shortcut: true,
      isExternalApp: true,
      url: 'https://github.com/Everoot',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '/assets/themes/Yaru/apps/gnome-control-center.png',
      disabled: false,
      favourite: true,
      desktop_shortcut: false,
    },
    {
      id: 'chrome',
      title: 'Google Chrome',
      icon: '/assets/themes/Yaru/apps/chrome.png',
      disabled: false,
      favourite: true,
      desktop_shortcut: false,
    },
    {
      id: 'trash',
      title: 'Trash',
      icon: '/assets/themes/Yaru/system/user-trash-full.png',
      disabled: false,
      favourite: true,
      desktop_shortcut: false,
    },
    {
      id: 'vscode',
      title: 'Visual Studio Code',
      icon: '/assets/themes/Yaru/apps/vscode.png',
      disabled: false,
      favourite: true,
      desktop_shortcut: false,
    },
    {
      id: 'blog',
      title: 'Blog',
      icon: '/assets/images/logos/avatar.png',
      disabled: false,
      favourite: true,
      desktop_shortcut: true,
      isExternalApp: true,
      url: 'https://everoot.github.io/Blog/',
    },
  ];

  getApps(): App[] {
    return this.apps;
  }

  getAppById(id: string): App | undefined {
    return this.apps.find(app => app.id === id);
  }

  getDesktopApps(): App[] {
    return this.apps.filter(app => app.desktop_shortcut);
  }

  getFavouriteApps(): App[] {
    return this.apps.filter(app => app.favourite);
  }

  getAllApps(): App[] {
    return this.apps;
  }
}
