import { Injectable, signal } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PDFService {
  // Loading state signal
  isGenerating = signal<boolean>(false);

  /**
   * Generate PDF from HTML element
   */
  async generatePDF(elementId: string, filename: string): Promise<void> {
    try {
      this.isGenerating.set(true);
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id '${elementId}' not found`);
      }

      // Apply print styles temporarily
      document.body.classList.add('print-mode');
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // Add image to PDF
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Save PDF
      pdf.save(filename);

    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    } finally {
      // Remove print styles
      document.body.classList.remove('print-mode');
      this.isGenerating.set(false);
    }
  }

  /**
   * Generate PDF with person's name as filename
   */
  async generateResumePDF(personName: string, elementId: string = 'cv-content'): Promise<void> {
    const filename = `${personName.replace(/\s+/g, '_')}_CV.pdf`;
    await this.generatePDF(elementId, filename);
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
    // Hide elements that shouldn't appear in PDF
    const elementsToHide = element.querySelectorAll('.print-hidden');
    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Apply print-specific styles
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#000000';
  }

  /**
   * Restore element after PDF generation
   */
  private restoreElementAfterPDF(element: HTMLElement): void {
    // Restore hidden elements
    const elementsToShow = element.querySelectorAll('.print-hidden');
    elementsToShow.forEach(el => {
      (el as HTMLElement).style.display = '';
    });

    // Remove print-specific styles
    element.style.backgroundColor = '';
    element.style.color = '';
  }
}