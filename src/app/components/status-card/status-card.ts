import { Component, Input, OnInit, Output, EventEmitter, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-card',
  imports: [CommonModule],
  templateUrl: './status-card.html',
  styleUrl: './status-card.css',
})
export class StatusCardComponent implements OnInit {
  @Input() visible = false;
  @Input() lockScreen?: () => void;
  @Input() shutDown?: () => void;
  @Output() close = new EventEmitter<void>();
  
  soundLevel = signal(75);
  brightnessLevel = signal(100);

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    const savedSound = localStorage.getItem('sound-level');
    const savedBrightness = localStorage.getItem('brightness-level');
    
    if (savedSound) {
      this.soundLevel.set(parseInt(savedSound));
    }
    if (savedBrightness) {
      this.brightnessLevel.set(parseInt(savedBrightness));
      this.updateBrightness(this.brightnessLevel());
    }
  }

  onSoundChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.soundLevel.set(parseInt(value));
    localStorage.setItem('sound-level', value);
  }

  onBrightnessChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.brightnessLevel.set(parseInt(value));
    localStorage.setItem('brightness-level', value);
    this.updateBrightness(parseInt(value));
  }

  updateBrightness(level: number) {
    // Using CSS filter to adjust brightness
    const brightness = (3 / 400 * level + 0.25);
    const monitorScreen = document.getElementById('monitor-screen');
    if (monitorScreen) {
      monitorScreen.style.filter = `brightness(${brightness})`;
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.visible && !this.elementRef.nativeElement.contains(event.target)) {
      const statusBar = document.getElementById('status-bar');
      if (statusBar && !statusBar.contains(event.target as Node)) {
        this.close.emit();
      }
    }
  }
}
