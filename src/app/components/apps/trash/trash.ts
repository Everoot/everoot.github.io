import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TrashItem {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-trash',
  imports: [CommonModule],
  templateUrl: './trash.html',
  styleUrl: './trash.css',
})
export class TrashComponent implements OnInit {
  empty = signal(true);
  trashItems: TrashItem[] = [];

  ngOnInit() {
    // Get user preference from localStorage
    const wasEmpty = localStorage.getItem('trash-empty');
    if (wasEmpty === 'true') {
      this.empty.set(true);
    } else {
      // Check if there are any items in localStorage
      const savedItems = localStorage.getItem('trash-items');
      if (savedItems) {
        try {
          this.trashItems = JSON.parse(savedItems);
          if (this.trashItems.length > 0) {
            this.empty.set(false);
          }
        } catch (e) {
          // If parsing fails, keep empty
          this.empty.set(true);
        }
      }
    }
  }

  emptyTrash() {
    this.empty.set(true);
    localStorage.setItem('trash-empty', 'true');
  }

  onItemFocus(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const icon = target.querySelector('img');
    const name = target.querySelector('span');
    if (icon) icon.classList.toggle('opacity-60');
    if (name) name.classList.toggle('bg-ub-orange');
  }
}
