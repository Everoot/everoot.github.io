import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clock',
  imports: [CommonModule],
  templateUrl: './clock.html',
  styleUrl: './clock.css',
})
export class ClockComponent implements OnInit, OnDestroy {
  private monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private dayList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  private updateInterval: any;
  
  currentTime = signal(new Date());
  displayTime = signal('');

  ngOnInit() {
    this.updateTime();
    this.updateInterval = setInterval(() => {
      this.updateTime();
    }, 10000); // Update every 10 seconds
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  updateTime() {
    const now = new Date();
    this.currentTime.set(now);
    
    const day = this.dayList[now.getDay()];
    let hour = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, '0');
    const month = this.monthList[now.getMonth()];
    const date = now.getDate();
    const meridiem = hour < 12 ? 'AM' : 'PM';
    
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    
    this.displayTime.set(`${day} ${month} ${date} ${hour}:${minute} ${meridiem}`);
  }
}
