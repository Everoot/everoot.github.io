import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-vscode',
  imports: [CommonModule],
  templateUrl: './vscode.html',
  styleUrl: './vscode.css',
})
export class VscodeComponent implements OnInit {
  // Using github1s to view code in browser
  // This is not my work, but it's amazing!
  // Original repo: https://github.com/conwnet/github1s
  // You can change this to your own repository
  private githubRepo = 'everoot/everoot.github.io';
  private defaultPath = 'src/app/app.ts';
  github1sUrl: string;
  safeGithub1sUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // Build the github1s URL
    this.github1sUrl = `https://github1s.com/${this.githubRepo}/blob/HEAD/${this.defaultPath}`;
    this.safeGithub1sUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.github1sUrl);
  }

  ngOnInit() {
    // Load last viewed path from localStorage if available
    const lastPath = localStorage.getItem('vscode-path');
    if (lastPath) {
      this.github1sUrl = `https://github1s.com/${this.githubRepo}/blob/HEAD/${lastPath}`;
      this.safeGithub1sUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.github1sUrl);
    }
  }

  // Method to navigate to a specific file (can be called from parent if needed)
  navigateToFile(filePath: string) {
    this.github1sUrl = `https://github1s.com/${this.githubRepo}/blob/HEAD/${filePath}`;
    this.safeGithub1sUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.github1sUrl);
    localStorage.setItem('vscode-path', filePath);
  }
}
