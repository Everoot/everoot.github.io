import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService, App } from '../../services/app-config';
import { WindowManagerService } from '../../services/window-manager';
import { DesktopIconComponent } from '../desktop-icon/desktop-icon';

@Component({
  selector: 'app-all-applications',
  imports: [CommonModule, DesktopIconComponent],
  templateUrl: './all-applications.html',
  styleUrl: './all-applications.css',
})
export class AllApplicationsComponent implements OnInit {
  @Input() apps: App[] = [];
  @Input() openApp?: (app: App) => void;
  
  query = signal('');
  allApps = signal<App[]>([]);

  filteredApps = computed(() => {
    const currentQuery = this.query().toLowerCase().trim();
    if (!currentQuery) {
      return this.allApps();
    }
    return this.allApps().filter(app => 
      app.title.toLowerCase().includes(currentQuery)
    );
  });

  constructor(
    private appConfig: AppConfigService,
    private windowManager: WindowManagerService
  ) {}

  ngOnInit() {
    if (this.apps.length === 0) {
      this.allApps.set(this.appConfig.getAllApps());
    } else {
      this.allApps.set([...this.apps]);
    }
  }

  onQueryChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.query.set(input.value);
  }

  handleOpenApp(app: App) {
    if (this.openApp) {
      this.openApp(app);
    } else {
      if (app.isExternalApp && app.url) {
        window.open(app.url, '_blank');
      } else {
        this.windowManager.openWindow(app);
      }
    }
    // Close the all applications view after opening an app
    // This will be handled by the parent component
  }
}
