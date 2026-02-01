import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockComponent } from '../clock/clock';
import { StatusComponent } from '../status/status';
import { StatusCardComponent } from '../status-card/status-card';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, ClockComponent, StatusComponent, StatusCardComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  @Input() showAllApps?: () => void;
  @Output() lockScreen = new EventEmitter<void>();
  @Output() shutDown = new EventEmitter<void>();
  
  statusCardVisible = signal(false);

  onStatusBarFocus() {
    this.statusCardVisible.set(true);
  }

  onStatusBarClick() {
    this.statusCardVisible.update(v => !v);
  }

  onStatusCardClose() {
    this.statusCardVisible.set(false);
  }

  onLockScreen() {
    this.lockScreen.emit();
    this.statusCardVisible.set(false);
  }

  onShutDown() {
    this.shutDown.emit();
    this.statusCardVisible.set(false);
  }
}
