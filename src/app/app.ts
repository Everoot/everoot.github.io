import { Component } from '@angular/core';
import { DesktopComponent } from './components/desktop/desktop';

@Component({
  selector: 'app-root',
  imports: [DesktopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Eve Liang - Portfolio';
}
