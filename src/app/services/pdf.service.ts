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

      // Show loading overlay to hide visual changes
      this.showLoadingOverlay();
      
      // Minimum display time for overlay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Prepare element for PDF generation
      this.prepareElementForPDF(element);
      // Inline critical images (e.g., avatar) as data URLs to avoid CORS/lazy issues
      await this.inlineLocalImages(element);
      
      // Wait for styles to apply and images to load
      await this.waitForImagesAndStyles();
      
      // Extra wait for PDF-specific styles to apply
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force element to A4 width for capture
      const a4WidthPx = 794; // A4 width at 96 DPI
      element.style.width = `${a4WidthPx}px`;
      element.style.minWidth = `${a4WidthPx}px`;
      element.style.maxWidth = `${a4WidthPx}px`;
      
      // Wait for layout to adjust
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate canvas from element with fixed width
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#f7f5f3', // CV background color
        width: a4WidthPx,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: true, // Tarayıcı düzenine daha yakın
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

      // Debug: Log canvas dimensions
      console.log('Canvas dimensions:', {
        width: canvas.width,
        height: canvas.height,
        ratio: canvas.height / canvas.width
      });

      // Simple PDF generation - fill the page
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Set background color
      pdf.setFillColor(247, 245, 243); // CV background color
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

      // Calculate dimensions to fit content on single page
      const margin = 5; // 5mm margin
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      // Calculate scaling to fit both width and height
      const scaleX = availableWidth / (canvas.width / 2); // Divide by 2 because scale=2
      const scaleY = availableHeight / (canvas.height / 2);
      const scale = Math.min(scaleX, scaleY); // Use smaller scale to fit both dimensions
      
      const imgWidth = (canvas.width / 2) * scale;
      const imgHeight = (canvas.height / 2) * scale;
      
      // Center the image
      const imgX = (pdfWidth - imgWidth) / 2;
      const imgY = margin;

      // Check if content fits on single page
      if (imgHeight > availableHeight) {
        // Content is too tall - use multiple pages
        const pageHeight = availableHeight;
        const totalPages = Math.ceil(imgHeight / pageHeight);
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
            // Set background for new page
            pdf.setFillColor(247, 245, 243);
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
          }
          
          const sourceY = page * pageHeight * (canvas.height / imgHeight);
          const sourceHeight = Math.min(pageHeight * (canvas.height / imgHeight), canvas.height - sourceY);
          
          // Create a temporary canvas for this page section
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            const pageImgData = tempCanvas.toDataURL('image/png');
            
            pdf.addImage(
              pageImgData,
              'PNG',
              imgX,
              margin,
              imgWidth,
              pageHeight,
              undefined,
              'FAST'
            );
          }
        }
      } else {
        // Content fits on single page
        pdf.addImage(
          imgData,
          'PNG',
          imgX,
          imgY,
          imgWidth,
          imgHeight,
          undefined,
          'FAST' // Compression mode
        );
      }

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
      
      // Hide overlay immediately after PDF save
      this.hideLoadingOverlay();

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
      
      // Hide loading overlay immediately
      this.hideLoadingOverlay();
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

    element.style.width = '100%';
    element.style.maxWidth = 'none';
    element.style.margin = '0';
    element.style.padding = '1rem';

    // Show print-only contact info - more aggressive approach
    const allDivs = element.querySelectorAll('div');
    allDivs.forEach(div => {
      const classList = div.className;
      if (classList.includes('print:flex')) {
        const divEl = div as HTMLElement;
        divEl.style.display = 'flex';
        divEl.style.gap = '0.5rem';
        divEl.style.fontSize = '12px';
        divEl.style.fontFamily = 'ui-monospace, monospace';
        divEl.style.color = 'rgba(0, 0, 0, 0.8)';
        divEl.style.marginTop = '0.25rem';
        divEl.style.flexWrap = 'wrap';
        divEl.style.alignItems = 'center';
        divEl.classList.remove('hidden');
        divEl.style.visibility = 'visible';
        divEl.style.opacity = '1';
      }
    });

    // Hide screen-only contact buttons
    const screenContactButtons = element.querySelectorAll('.print\\:hidden');
    screenContactButtons.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    const avatarImgs = element.querySelectorAll('.app-avatar img');
    avatarImgs.forEach(img => {
      const el = img as HTMLImageElement;
      el.style.opacity = '1';
      el.style.display = 'block';
      el.style.visibility = 'visible';
      // CORS için crossorigin attribute ekle
      el.setAttribute('crossorigin', 'anonymous');
    });



    // Fix all badges specifically (pre-capture, inline-block exact height)
    const badgeElements = element.querySelectorAll('.app-badge');
    badgeElements.forEach(node => {
      const badgeEl = node as HTMLElement;
      const cs = window.getComputedStyle(badgeEl);
      const fontSize = parseFloat(cs.fontSize || '12');
      const paddingLeft = parseFloat(cs.paddingLeft || '8');
      const paddingRight = parseFloat(cs.paddingRight || '8');
      const paddingTop = parseFloat(cs.paddingTop || '4');
      const paddingBottom = parseFloat(cs.paddingBottom || '4');
      const borderTop = parseFloat(cs.borderTopWidth || '1');
      const borderBottom = parseFloat(cs.borderBottomWidth || '1');
      // Use fixed dimensions for better consistency
      const targetHeight = 22; // Fixed height for better appearance
      const contentHeight = 18; // Fixed line-height

      badgeEl.style.display = 'inline-block';
      badgeEl.style.height = `${targetHeight}px`;
      badgeEl.style.lineHeight = `${contentHeight}px`;
      badgeEl.style.verticalAlign = 'middle';
      badgeEl.style.whiteSpace = 'nowrap';
      badgeEl.style.paddingLeft = '8px';
      badgeEl.style.paddingRight = '8px';
      badgeEl.style.paddingTop = '2px';
      badgeEl.style.paddingBottom = '2px';
    });

    // Ensure avatar image not hidden by transitions
    const avatarImages = element.querySelectorAll('.app-avatar img');
    avatarImages.forEach(img => {
      const el = img as HTMLImageElement;
      el.style.opacity = '1';
      el.style.display = 'block';
      el.style.visibility = 'visible';
    });
  }

  /**
   * Show loading overlay during PDF generation
   */
  private showLoadingOverlay(): void {
    // Remove any existing overlays first (but don't call hideLoadingOverlay to avoid recursion)
    const existingOverlays = document.querySelectorAll('#pdf-loading-overlay');
    existingOverlays.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
    const overlay = document.createElement('div');
    overlay.id = 'pdf-loading-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: system-ui, sans-serif;
      font-size: 16px;
      color: #333;
    `;
    overlay.innerHTML = `
      <div style="text-align: center;">
        <div style="margin-bottom: 16px;">Generating PDF...</div>
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #333; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(overlay);
    console.log('PDF loading overlay created and added to body');
  }

  /**
   * Hide loading overlay
   */
  private hideLoadingOverlay(): void {
    console.log('Attempting to remove PDF loading overlay');
    
    // Remove all overlays with this ID
    const overlays = document.querySelectorAll('#pdf-loading-overlay');
    console.log(`Found ${overlays.length} overlay(s) to remove`);
    
    overlays.forEach((overlay, index) => {
      try {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
          console.log(`Removed overlay ${index + 1}`);
        }
      } catch (error) {
        console.error(`Error removing overlay ${index + 1}:`, error);
      }
    });
    
    // Double check - use remove() method as fallback
    const remainingOverlays = document.querySelectorAll('#pdf-loading-overlay');
    remainingOverlays.forEach((overlay, index) => {
      try {
        overlay.remove();
        console.log(`Force removed remaining overlay ${index + 1}`);
      } catch (error) {
        console.error(`Error force removing overlay ${index + 1}:`, error);
      }
    });
  }

  /**
   * Restore element after PDF generation
   */
  private restoreElementAfterPDF(element: HTMLElement): void {
    // Remove PDF generation classes
    element.classList.remove('pdf-generating');
    document.body.classList.remove('pdf-mode');

    // Restore main element styles
    element.style.width = '';
    element.style.minWidth = '';
    element.style.maxWidth = '';
    element.style.margin = '';
    element.style.padding = '';

    // Force a reflow to ensure styles are applied
    element.offsetHeight;

    // Restore all print contact info elements
    const printContactDivs = element.querySelectorAll('div');
    printContactDivs.forEach(div => {
      const classList = div.className;
      if (classList.includes('print:flex')) {
        const divEl = div as HTMLElement;
        divEl.style.display = '';
        divEl.style.gap = '';
        divEl.style.fontSize = '';
        divEl.style.fontFamily = '';
        divEl.style.color = '';
        divEl.style.marginTop = '';
        divEl.style.flexWrap = '';
        divEl.style.alignItems = '';
        divEl.style.visibility = '';
        divEl.style.opacity = '';
        divEl.classList.add('hidden'); // Restore hidden class
      }
    });

    // Restore screen contact buttons (show icons again) - use same selector as prepare
    const screenContactButtons = element.querySelectorAll('.print\\:hidden');
    screenContactButtons.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = '';
      htmlEl.style.visibility = '';
      htmlEl.style.opacity = '';
      console.log('Restored screen contact button:', htmlEl.tagName, htmlEl.className);
    });

    // Force reflow again after all changes
    element.offsetHeight;
    
    console.log('Element restore completed');
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
