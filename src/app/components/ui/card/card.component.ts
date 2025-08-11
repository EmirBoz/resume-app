import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../lib/utils';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  // Input for additional CSS classes
  className = input<string>('');

  // Computed classes
  cardClasses = computed(() => {
    return cn('rounded-lg bg-card text-card-foreground', this.className());
  });
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="headerClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class CardHeaderComponent {
  className = input<string>('');

  headerClasses = computed(() => {
    return cn('flex flex-col space-y-1.5', this.className());
  });
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 [class]="titleClasses()">
      <ng-content></ng-content>
    </h3>
  `
})
export class CardTitleComponent {
  className = input<string>('');

  titleClasses = computed(() => {
    return cn('text-2xl font-semibold leading-none tracking-tight', this.className());
  });
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p [class]="descriptionClasses()">
      <ng-content></ng-content>
    </p>
  `
})
export class CardDescriptionComponent {
  className = input<string>('');

  descriptionClasses = computed(() => {
    return cn('text-sm text-foreground', this.className());
  });
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="contentClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class CardContentComponent {
  className = input<string>('');

  contentClasses = computed(() => {
    return cn('text-pretty font-mono text-sm text-muted-foreground', this.className());
  });
}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="footerClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class CardFooterComponent {
  className = input<string>('');

  footerClasses = computed(() => {
    return cn('flex items-center', this.className());
  });
}