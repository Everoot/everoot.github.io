import { Component, OnInit, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService, App } from '../../services/app-config';
import { WindowManagerService } from '../../services/window-manager';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  favouriteApps = signal<App[]>([]);
  showAllApps = output<void>();

  constructor(
    private appConfig: AppConfigService,
    private windowManager: WindowManagerService
  ) {}

  ngOnInit() {
    this.favouriteApps.set(this.appConfig.getFavouriteApps());
  }

  openApp(app: App) {
    if (app.isExternalApp && app.url) {
      window.open(app.url, '_blank');
    } else {
      this.windowManager.openWindow(app);
    }
  }

  onShowAllApps() {
    this.showAllApps.emit();
  }
}
