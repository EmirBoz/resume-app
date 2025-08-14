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
      // Inline critical images (e.g., avatar) as data URLs to avoid CORS/lazy issues
      await this.inlineLocalImages(element);
      
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
         // Use foreignObject rendering to better match actual browser layout (fixes inline baselines)
         foreignObjectRendering: true,
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
            const badges = clonedElement.querySelectorAll('.app-badge');
            badges.forEach(node => {
              const badge = node as HTMLElement;
              const win = clonedDoc.defaultView;
              if (!win) return;
              const cs = win.getComputedStyle(badge);
              const fontSize = parseFloat(cs.fontSize || '12');
              const paddingLeft = parseFloat(cs.paddingLeft || '0');
              const paddingRight = parseFloat(cs.paddingRight || '0');
              const paddingTop = parseFloat(cs.paddingTop || '0');
              const paddingBottom = parseFloat(cs.paddingBottom || '0');
              const borderTop = parseFloat(cs.borderTopWidth || '0');
              const borderBottom = parseFloat(cs.borderBottomWidth || '0');

              const targetHeight = Math.round(fontSize + paddingTop + paddingBottom + borderTop + borderBottom);
              const contentHeight = Math.max(1, targetHeight - borderTop - borderBottom);

              badge.style.display = 'inline-block';
              badge.style.height = `${targetHeight}px`;
              badge.style.lineHeight = `${contentHeight}px`;
              badge.style.verticalAlign = 'middle';
              badge.style.whiteSpace = 'nowrap';
              badge.style.paddingLeft = `${paddingLeft}px`;
              badge.style.paddingRight = `${paddingRight}px`;
              badge.style.paddingTop = '0px';
              badge.style.paddingBottom = '0px';
            });

            // Center inline-flex anchors (icons + text) to avoid baseline quirks
            // Remove any transforms that can affect baseline in clone
            const transformed = clonedElement.querySelectorAll('.app-badge, a.inline-flex, svg, .size-1, .size-2, .size-3, .size-4');
            transformed.forEach(el => {
              (el as HTMLElement).style.transform = 'none';
            });
            
            // Ensure avatar image is visible and bypass lazy/opacity; hide fallback text
            const avatarImgs = clonedElement.querySelectorAll('.app-avatar img');
            avatarImgs.forEach(img => {
              const el = img as HTMLImageElement;
              el.style.opacity = '1';
              el.style.display = 'block';
              el.style.visibility = 'visible';
              el.setAttribute('crossorigin', 'anonymous');
              // Force absolute URL to avoid base/relative issues in clone context
              try {
                const url = new URL(el.src, window.location.origin);
                el.src = url.toString();
              } catch {}
            });
            const avatarFallbacks = clonedElement.querySelectorAll('.app-avatar > div');
            avatarFallbacks.forEach(fb => {
              (fb as HTMLElement).style.display = 'none';
              (fb as HTMLElement).style.opacity = '0';
              (fb as HTMLElement).style.visibility = 'hidden';
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
      // Use PNG to avoid JPEG color shifts
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Determine exact background color from computed styles to match CV
      // Sample the canvas background pixel to match exact rendered color
      let bgR = 247, bgG = 245, bgB = 243;
      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const data = ctx.getImageData(1, 1, 1, 1).data; // avoid edge anti-alias
          bgR = data[0];
          bgG = data[1];
          bgB = data[2];
        }
      } catch {}
      pdf.setFillColor(bgR, bgG, bgB);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

      // Fit image horizontally; leave a reasonable top margin and align towards top
      const marginLeftRight = 6; // 6mm side margins to avoid hugging edges
      const marginTop = 8; // 8mm top margin
      const marginBottom = 6; // small bottom margin
      const availableWidth = pdfWidth - (marginLeftRight * 2);
      const availableHeight = pdfHeight - (marginTop + marginBottom);
      const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const imgX = (pdfWidth - scaledWidth) / 2; // center horizontally
      const imgY = marginTop; // push content up

      // Add image to PDF
      pdf.addImage(
        imgData,
        'PNG',
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
   * Parse CSS color string to RGB components.
   */
  private parseCssColorToRgb(color: string): { r: number; g: number; b: number } | null {
    // rgb/rgba
    const rgbMatch = color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
      return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
    }
    // hex #rrggbb
    const hexMatch = color.match(/^#([0-9a-f]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return null;
  }

  /**
   * Convert same-origin images inside the target element to data URLs
   * to ensure html2canvas can render them reliably.
   */
  private async inlineLocalImages(root: HTMLElement): Promise<void> {
    const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    const tasks = imgs.map(async (img) => {
      const src = img.getAttribute('src') || '';
      if (!src || src.startsWith('data:')) return;
      try {
        const absoluteUrl = new URL(src, window.location.origin).toString();
        // Only inline same-origin images
        const isSameOrigin = absoluteUrl.startsWith(window.location.origin);
        if (!isSameOrigin) return;
        const res = await fetch(absoluteUrl, { credentials: 'same-origin', cache: 'force-cache' });
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image blob'));
          reader.readAsDataURL(blob);
        });
        img.setAttribute('src', dataUrl);
        img.removeAttribute('crossorigin');
        // Ensure visible
        img.style.opacity = '1';
        img.style.display = 'block';
        img.style.visibility = 'visible';
      } catch {
        // Ignore failures; html2canvas will attempt normal rendering
      }
    });
    await Promise.all(tasks);
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

    // Fix all badges specifically (pre-capture, inline-block exact height)
    const badges = element.querySelectorAll('.app-badge');
    badges.forEach(node => {
      const badgeEl = node as HTMLElement;
      const cs = window.getComputedStyle(badgeEl);
      const fontSize = parseFloat(cs.fontSize || '12');
      const paddingLeft = parseFloat(cs.paddingLeft || '8');
      const paddingRight = parseFloat(cs.paddingRight || '8');
      const paddingTop = parseFloat(cs.paddingTop || '4');
      const paddingBottom = parseFloat(cs.paddingBottom || '4');
      const borderTop = parseFloat(cs.borderTopWidth || '1');
      const borderBottom = parseFloat(cs.borderBottomWidth || '1');
      const targetHeight = Math.round(fontSize + paddingTop + paddingBottom + borderTop + borderBottom);
      const contentHeight = Math.max(1, targetHeight - borderTop - borderBottom);

      badgeEl.style.display = 'inline-block';
      badgeEl.style.height = `${targetHeight}px`;
      badgeEl.style.lineHeight = `${contentHeight}px`;
      badgeEl.style.verticalAlign = 'middle';
      badgeEl.style.whiteSpace = 'nowrap';
      badgeEl.style.paddingLeft = `${paddingLeft}px`;
      badgeEl.style.paddingRight = `${paddingRight}px`;
      badgeEl.style.paddingTop = '0px';
      badgeEl.style.paddingBottom = '0px';
    });

    // Ensure avatar image not hidden by transitions
    const avatarImgs = element.querySelectorAll('.app-avatar img');
    avatarImgs.forEach(img => {
      const el = img as HTMLImageElement;
      el.style.opacity = '1';
      el.style.display = 'block';
      el.style.visibility = 'visible';
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