import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border-border',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
export type BadgeSize = VariantProps<typeof badgeVariants>['size'];

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  // Input signals
  variant = input<BadgeVariant>('default');
  size = input<BadgeSize>('default');
  className = input<string>('');

  // Computed classes
  badgeClasses = computed(() => {
    return cn(badgeVariants({ 
      variant: this.variant(), 
      size: this.size() 
    }), this.className());
  });
}