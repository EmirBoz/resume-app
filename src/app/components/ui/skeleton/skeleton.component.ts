import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../lib/utils';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent {
  // Input signals
  width = input<string>('100%');
  height = input<string>('1rem');
  className = input<string>('');
  lines = input<number>(1);
  rounded = input<boolean>(true);

  // Computed properties
  skeletonClasses = computed(() => {
    return cn(
      'animate-pulse bg-muted',
      this.rounded() ? 'rounded-md' : '',
      this.className()
    );
  });

  skeletonStyle = computed(() => {
    return {
      width: this.width(),
      height: this.height(),
    };
  });

  // Generate array for multiple lines
  linesArray = computed(() => {
    return Array.from({ length: this.lines() }, (_, i) => i);
  });
}