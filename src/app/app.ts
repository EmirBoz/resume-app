import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, ThemeService } from './services';
import { SkeletonComponent } from './components/ui';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Inject services
  private dataService = inject(DataService);
  private themeService = inject(ThemeService);

  // Expose data for template
  resumeData = this.dataService.resumeData;
  
  // Loading state
  isLoading = signal<boolean>(false);

  // Error state
  errorState = signal<string | null>(null);

  // Computed properties
  pageTitle = computed(() => `${this.resumeData().name} - Resume`);
  
  constructor() {
    // Initialize theme system
    this.themeService.initSystemThemeListener();
  }

  // Error boundary-like functionality
  handleError(error: Error, sectionName: string): void {
    console.error(`Error in ${sectionName}:`, error);
    this.errorState.set(`Error loading ${sectionName}`);
  }

  // Retry functionality
  retry(): void {
    this.errorState.set(null);
    this.isLoading.set(false);
  }
}
