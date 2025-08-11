import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../lib/utils';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  // Input signals
  src = input<string>('');
  alt = input<string>('');
  fallback = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  className = input<string>('');

  // Internal state
  imageLoaded = signal<boolean>(false);
  imageError = signal<boolean>(false);

  // Computed properties
  avatarClasses = computed(() => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-16 w-16 text-lg',
      xl: 'h-28 w-28 text-2xl'
    };

    return cn(
      'relative flex shrink-0 overflow-hidden rounded-full',
      sizeClasses[this.size()],
      this.className()
    );
  });

  imageClasses = computed(() => {
    return cn(
      'aspect-square h-full w-full object-cover',
      this.imageLoaded() ? 'opacity-100' : 'opacity-0'
    );
  });

  fallbackClasses = computed(() => {
    return cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
      !this.imageLoaded() || this.imageError() ? 'opacity-100' : 'opacity-0'
    );
  });

  showImage = computed(() => {
    return this.src() && !this.imageError();
  });

  showFallback = computed(() => {
    return this.fallback() && (!this.src() || this.imageError() || !this.imageLoaded());
  });

  onImageLoad(): void {
    this.imageLoaded.set(true);
    this.imageError.set(false);
  }

  onImageError(): void {
    this.imageError.set(true);
    this.imageLoaded.set(false);
  }
}