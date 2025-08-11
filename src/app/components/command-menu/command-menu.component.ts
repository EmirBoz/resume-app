import { Component, input, signal, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services';
import { ButtonComponent } from '../ui';
import {
  CommandDialogComponent,
  CommandInputComponent,
  CommandListComponent,
  CommandEmptyComponent,
  CommandGroupComponent,
  CommandItemComponent,
  CommandSeparatorComponent
} from '../ui/command/command.component';

interface CommandLink {
  url: string;
  title: string;
}

@Component({
  selector: 'app-command-menu',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CommandDialogComponent,
    CommandInputComponent,
    CommandListComponent,
    CommandEmptyComponent,
    CommandGroupComponent,
    CommandItemComponent,
    CommandSeparatorComponent
  ],
  templateUrl: './command-menu.component.html',
  styleUrl: './command-menu.component.scss'
})
export class CommandMenuComponent implements OnInit, OnDestroy {
  // Inject services
  private dataService = inject(DataService);

  // Component state
  isOpen = signal<boolean>(false);
  searchValue = signal<string>('');
  isMac = signal<boolean>(false);

  // Data
  resumeData = this.dataService.resumeData;

  // Computed properties
  links = signal<CommandLink[]>([]);

  constructor() {
    // Detect Mac
    if (typeof window !== 'undefined') {
      this.isMac.set(window.navigator.userAgent.indexOf('Mac') > -1);
    }

    // Setup links from resume data
    effect(() => {
      const data = this.resumeData();
      const commandLinks: CommandLink[] = [];

      // Add social links
      if (data.contact.social) {
        data.contact.social.forEach(social => {
          commandLinks.push({
            url: social.url,
            title: social.name
          });
        });
      }

      // Add personal website if available
      if (data.personalWebsiteUrl) {
        commandLinks.push({
          url: data.personalWebsiteUrl,
          title: 'Personal Website'
        });
      }

      this.links.set(commandLinks);
    });
  }

  ngOnInit() {
    // Add keyboard event listener (only in browser)
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  ngOnDestroy() {
    // Remove keyboard event listener (only in browser)
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Cmd/Ctrl + K to toggle command menu
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.toggleOpen();
    }

    // Escape to close
    if (event.key === 'Escape' && this.isOpen()) {
      this.closeMenu();
    }
  }

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }

  closeMenu() {
    this.isOpen.set(false);
    this.searchValue.set('');
  }

  onOpenChange(open: boolean) {
    this.isOpen.set(open);
    if (!open) {
      this.searchValue.set('');
    }
  }

  onSearch(value: string) {
    this.searchValue.set(value);
  }

  // Actions
  handlePrint() {
    this.closeMenu();
    window.print();
  }

  handleLinkClick(url: string) {
    this.closeMenu();
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Helper methods
  getKeyboardShortcut(): string {
    return this.isMac() ? '⌘K' : 'Ctrl+K';
  }

  getKeyboardDisplay(): string {
    return this.isMac() ? '⌘' : 'Ctrl';
  }
}