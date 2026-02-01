import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  contact = {
    email: 'byleve2022@gmail.com',
    github: 'github.com/Everoot',
    location: 'Philadelphia, PA'
  };
}
