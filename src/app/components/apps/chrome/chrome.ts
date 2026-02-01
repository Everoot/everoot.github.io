import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-chrome',
  imports: [CommonModule, FormsModule],
  templateUrl: './chrome.html',
  styleUrl: './chrome.css',
})
export class ChromeComponent implements OnInit, AfterViewInit {
  @ViewChild('chromeScreen', { static: false }) chromeScreen?: ElementRef<HTMLIFrameElement>;
  @ViewChild('urlBar', { static: false }) urlBar?: ElementRef<HTMLInputElement>;
  
  url: string = 'https://www.google.com/webhp?igu=1';
  safeUrl: SafeResourceUrl;
  displayUrl = 'https://www.google.com';
  private homeUrl = 'https://www.google.com/webhp?igu=1';

  constructor(private sanitizer: DomSanitizer) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  ngOnInit() {
    // Load last visited URL from localStorage
    const lastVisitedUrl = localStorage.getItem('chrome-url');
    const lastDisplayedUrl = localStorage.getItem('chrome-display-url');
    if (lastVisitedUrl) {
      this.url = lastVisitedUrl;
      this.displayUrl = lastDisplayedUrl || lastVisitedUrl;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    }
  }

  ngAfterViewInit() {
    // Ensure iframe loads the URL
    if (this.chromeScreen) {
      setTimeout(() => {
        this.updateIframeUrl();
      }, 100);
    }
  }

  private updateIframeUrl() {
    if (this.chromeScreen?.nativeElement) {
      const iframe = this.chromeScreen.nativeElement;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
      // Force reload by setting src
      iframe.src = this.url;
    }
  }

  refreshChrome() {
    if (this.chromeScreen?.nativeElement) {
      const iframe = this.chromeScreen.nativeElement;
      // Force reload by appending timestamp or re-setting src
      iframe.src = iframe.src;
    }
  }

  goToHome() {
    this.url = this.homeUrl;
    this.displayUrl = 'https://www.google.com';
    this.updateIframeUrl();
    this.storeVisitedUrl(this.homeUrl, 'https://www.google.com');
  }

  onUrlKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let url = (event.target as HTMLInputElement).value.trim();
      if (url.length === 0) return;

      // Add https:// if not present
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      url = encodeURI(url);
      let displayUrl = url;
      
      // Special handling for Google
      if (url.includes('google.com')) {
        url = this.homeUrl;
        displayUrl = 'https://www.google.com';
      }

      this.url = url;
      this.displayUrl = displayUrl;
      this.updateIframeUrl();
      this.storeVisitedUrl(url, displayUrl);
      
      if (this.urlBar?.nativeElement) {
        this.urlBar.nativeElement.blur();
      }
    }
  }

  private storeVisitedUrl(url: string, displayUrl: string) {
    localStorage.setItem('chrome-url', url);
    localStorage.setItem('chrome-display-url', displayUrl);
  }
}
