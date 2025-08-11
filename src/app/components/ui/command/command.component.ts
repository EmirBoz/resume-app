import { Component, input, output, computed, signal, effect, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { cn } from '../../../../lib/utils';

@Component({
  selector: 'app-command-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 bg-black/80" (click)="onOpenChange.emit(false)">
        <div 
          class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
          (click)="$event.stopPropagation()"
        >
          <ng-content></ng-content>
        </div>
      </div>
    }
  `
})
export class CommandDialogComponent {
  open = input<boolean>(false);
  onOpenChange = output<boolean>();
}

@Component({
  selector: 'app-command-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center border-b px-3">
      <svg class="mr-2 h-4 w-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
      </svg>
      <input
        #inputRef
        class="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        [placeholder]="placeholder()"
        [(ngModel)]="searchValue"
        (ngModelChange)="onSearch.emit($event)"
        (keydown)="onKeyDown.emit($event)"
      />
    </div>
  `
})
export class CommandInputComponent implements AfterViewInit {
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;
  
  placeholder = input<string>('Type a command or search...');
  onSearch = output<string>();
  onKeyDown = output<KeyboardEvent>();
  
  searchValue = '';

  ngAfterViewInit() {
    // Auto focus the input
    setTimeout(() => {
      this.inputRef.nativeElement.focus();
    }, 100);
  }
}

@Component({
  selector: 'app-command-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-h-[300px] overflow-y-auto overflow-x-hidden">
      <ng-content></ng-content>
    </div>
  `
})
export class CommandListComponent {}

@Component({
  selector: 'app-command-empty',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-6 text-center text-sm">
      <ng-content></ng-content>
    </div>
  `
})
export class CommandEmptyComponent {}

@Component({
  selector: 'app-command-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden p-1 text-foreground">
      @if (heading()) {
        <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {{ heading() }}
        </div>
      }
      <ng-content></ng-content>
    </div>
  `
})
export class CommandGroupComponent {
  heading = input<string>();
}

@Component({
  selector: 'app-command-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      (click)="onSelect.emit()"
      [class]="className()"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class CommandItemComponent {
  className = input<string>('');
  onSelect = output<void>();
}

@Component({
  selector: 'app-command-separator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="-mx-1 h-px bg-border"></div>
  `
})
export class CommandSeparatorComponent {}