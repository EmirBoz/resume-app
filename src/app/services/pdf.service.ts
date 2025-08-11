import { Injectable, signal, inject } from '@angular/core';
import { DataService } from './data.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PDFService {
  // Inject services
  private dataService = inject(DataService);

  // Loading state signal
  isGenerating = signal<boolean>(false);
  
  // Error state signal
  error = signal<string | null>(null);

  /**
   * Generate PDF from HTML element with enhanced options
   */
  async generatePDF(elementId: string, filename: string): Promise<void> {
    if (!this.isPDFSupported()) {
      throw new Error('PDF generation is not supported in this environment');
    }

    try {
      this.isGenerating.set(true);
      this.error.set(null);
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id '${elementId}' not found`);
      }

      // Prepare element for PDF generation
      this.prepareElementForPDF(element);
      
      // Wait for styles to apply and images to load
      await this.waitForImagesAndStyles();
      
      // Extra wait for PDF-specific styles to apply
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate canvas from HTML element with optimized settings
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#f7f5f3', // CV background color
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false, // Disable console logs
        imageTimeout: 15000, // 15 second timeout for images
        removeContainer: true,
        foreignObjectRendering: false, // Better compatibility
        ignoreElements: (element) => {
          // Ignore elements that might cause issues
          return element.classList.contains('print:hidden') || 
                 (element as HTMLElement).style?.display === 'none';
        },
        onclone: (clonedDoc) => {
          // Fix cloned document styles
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            // Ensure all text is properly aligned
            const badges = clonedElement.querySelectorAll('[class*="badge"], .inline-flex');
            badges.forEach(badge => {
              (badge as HTMLElement).style.display = 'inline-flex';
              (badge as HTMLElement).style.alignItems = 'center';
              (badge as HTMLElement).style.justifyContent = 'center';
              (badge as HTMLElement).style.lineHeight = '1.2';
              (badge as HTMLElement).style.verticalAlign = 'baseline';
            });
            
            // Fix any flex containers
            const flexContainers = clonedElement.querySelectorAll('.flex');
            flexContainers.forEach(container => {
              (container as HTMLElement).style.display = 'flex';
            });
          }
        }
      });

      // Create PDF with optimized settings
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true, // Enable compression
      });

      // Calculate dimensions for better fit
      const imgData = canvas.toDataURL('image/jpeg', 0.95); // JPEG with 95% quality
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scaling to fit page with margins
      const margin = 10; // 10mm margin
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const imgX = (pdfWidth - scaledWidth) / 2;
      const imgY = margin;

      // Add image to PDF
      pdf.addImage(
        imgData,
        'JPEG',
        imgX,
        imgY,
        scaledWidth,
        scaledHeight,
        undefined,
        'FAST' // Compression mode
      );

      // Add metadata
      const resumeData = this.dataService.resumeData();
      pdf.setProperties({
        title: `${resumeData.name} - CV`,
        subject: 'Curriculum Vitae',
        author: resumeData.name,
        creator: 'CV Generator',
        keywords: 'CV, Resume, ' + resumeData.name,
      });

      // Save PDF
      pdf.save(filename);

    } catch (error) {
      console.error('PDF generation failed:', error);
      this.error.set(error instanceof Error ? error.message : 'PDF generation failed');
      throw error;
    } finally {
      // Always restore element
      const element = document.getElementById(elementId);
      if (element) {
        this.restoreElementAfterPDF(element);
      }
      this.isGenerating.set(false);
    }
  }

  /**
   * Generate PDF with person's name as filename (main method)
   */
  async generateResumePDF(elementId: string = 'cv-content'): Promise<void> {
    const resumeData = this.dataService.resumeData();
    const filename = this.generateFilename(resumeData.name);
    await this.generatePDF(elementId, filename);
  }

  /**
   * Generate filename from person's name
   */
  private generateFilename(personName: string): string {
    const cleanName = personName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase();
    
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return `${cleanName}_cv_${date}.pdf`;
  }

  /**
   * Wait for images and styles to load
   */
  private async waitForImagesAndStyles(): Promise<void> {
    // Wait for all images to load
    const images = document.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = resolve; // Don't fail on broken images
        setTimeout(resolve, 5000); // Timeout after 5 seconds
      });
    });

    await Promise.all(imagePromises);
    
    // Wait a bit more for styles to apply
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Check if PDF generation is supported
   */
  isPDFSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof document !== 'undefined' && 
           !!document.createElement;
  }

  /**
   * Prepare element for PDF generation
   */
  private prepareElementForPDF(element: HTMLElement): void {
    // Add PDF generation class for specific styling
    element.classList.add('pdf-generating');
    document.body.classList.add('pdf-mode');

    // Hide elements that shouldn't appear in PDF
    const elementsToHide = element.querySelectorAll('.print\\:hidden, [class*="print:hidden"]');
    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Apply PDF-specific styles - remove all margins and padding
    element.style.backgroundColor = '#f7f5f3'; // CV background color
    element.style.color = '#262626'; // CV text color
    element.style.minHeight = 'auto';
    element.style.overflow = 'visible';
    element.style.margin = '0';
    element.style.padding = '0';

    // Ensure proper font rendering
    element.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    element.style.fontSize = '14px';
    element.style.lineHeight = '1.4';

    // Fix any layout issues and remove margins/padding
    const containers = element.querySelectorAll('.container, .max-w-2xl');
    containers.forEach(container => {
      (container as HTMLElement).style.maxWidth = 'none';
      (container as HTMLElement).style.width = '100%';
      (container as HTMLElement).style.margin = '0';
      (container as HTMLElement).style.padding = '1rem'; // Only internal padding
    });

    // Fix body and html for full coverage
    document.body.style.backgroundColor = '#f7f5f3';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.backgroundColor = '#f7f5f3';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';

    // Fix all badges specifically
    const badges = element.querySelectorAll('[class*="badge"], .inline-flex');
    badges.forEach(badge => {
      const badgeEl = badge as HTMLElement;
      badgeEl.style.display = 'inline-flex';
      badgeEl.style.alignItems = 'center';
      badgeEl.style.justifyContent = 'center';
      badgeEl.style.lineHeight = '1';
      badgeEl.style.verticalAlign = 'middle';
      badgeEl.style.padding = '0.25rem 0.5rem';
      badgeEl.style.fontSize = '0.75rem';
      badgeEl.style.fontWeight = '500';
      badgeEl.style.whiteSpace = 'nowrap';
      badgeEl.style.borderRadius = '0.375rem';
      badgeEl.style.backgroundColor = '#e5e7eb';
      badgeEl.style.color = '#374151';
      badgeEl.style.border = '1px solid #d1d5db';
    });
  }

  /**
   * Restore element after PDF generation
   */
  private restoreElementAfterPDF(element: HTMLElement): void {
    // Remove PDF generation classes
    element.classList.remove('pdf-generating');
    document.body.classList.remove('pdf-mode');

    // Restore hidden elements
    const elementsToShow = element.querySelectorAll('.print\\:hidden, [class*="print:hidden"]');
    elementsToShow.forEach(el => {
      (el as HTMLElement).style.display = '';
    });

    // Remove PDF-specific styles
    element.style.backgroundColor = '';
    element.style.color = '';
    element.style.minHeight = '';
    element.style.overflow = '';
    element.style.fontFamily = '';
    element.style.fontSize = '';
    element.style.lineHeight = '';
    element.style.margin = '';
    element.style.padding = '';

    // Restore container styles
    const containers = element.querySelectorAll('.container, .max-w-2xl');
    containers.forEach(container => {
      (container as HTMLElement).style.maxWidth = '';
      (container as HTMLElement).style.width = '';
      (container as HTMLElement).style.margin = '';
      (container as HTMLElement).style.padding = '';
    });

    // Restore body and html styles
    document.body.style.backgroundColor = '';
    document.body.style.margin = '';
    document.body.style.padding = '';
    document.documentElement.style.backgroundColor = '';
    document.documentElement.style.margin = '';
    document.documentElement.style.padding = '';

    // Restore badge styles
    const badges = element.querySelectorAll('[class*="badge"], .inline-flex');
    badges.forEach(badge => {
      const badgeEl = badge as HTMLElement;
      badgeEl.style.display = '';
      badgeEl.style.alignItems = '';
      badgeEl.style.justifyContent = '';
      badgeEl.style.lineHeight = '';
      badgeEl.style.verticalAlign = '';
      badgeEl.style.padding = '';
      badgeEl.style.fontSize = '';
      badgeEl.style.fontWeight = '';
      badgeEl.style.whiteSpace = '';
      badgeEl.style.borderRadius = '';
      badgeEl.style.backgroundColor = '';
      badgeEl.style.color = '';
      badgeEl.style.border = '';
    });
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Get current loading state
   */
  getLoadingState(): boolean {
    return this.isGenerating();
  }

  /**
   * Get current error state
   */
  getError(): string | null {
    return this.error();
  }
}