import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminGraphQLService } from '../../../../services/admin-graphql.service';
import { DataService } from '../../../../services';
import { AdminService } from '../../../../services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-backup-export-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './backup-export-form.html',
  styleUrl: './backup-export-form.scss'
})
export class BackupExportFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private adminGraphQLService = inject(AdminGraphQLService);
  private dataService = inject(DataService);
  private adminService = inject(AdminService);
  
  // Form state
  importForm!: FormGroup;
  isExporting = signal(false);
  isImporting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  ngOnInit() {
    this.initializeForm();
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private initializeForm() {
    this.importForm = this.fb.group({
      importData: ['']
    });
  }
  
  canImport(): boolean {
    return !!(this.selectedFile() || this.importForm.get('importData')?.value?.trim());
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        this.selectedFile.set(file);
        this.clearMessages();
        
        // Read file content and populate textarea
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          this.importForm.patchValue({ importData: content });
        };
        reader.readAsText(file);
      } else {
        this.errorMessage.set('Please select a valid JSON file.');
        this.selectedFile.set(null);
      }
    }
  }
  
  async exportData() {
    this.isExporting.set(true);
    this.clearMessages();
    
    try {
      const exportedData = await this.adminGraphQLService.exportData().toPromise();
      
      if (!exportedData) {
        throw new Error('Failed to export data');
      }
      
      // Create and download file
      const blob = new Blob([exportedData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cv-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.successMessage.set('CV data exported successfully! File downloaded to your device.');
      
    } catch (error: any) {
      console.error('Error exporting data:', error);
      this.errorMessage.set(error.message || 'Failed to export data. Please try again.');
    } finally {
      this.isExporting.set(false);
    }
  }
  
  async importData() {
    if (!this.canImport()) return;
    
    this.isImporting.set(true);
    this.clearMessages();
    
    try {
      const importData = this.importForm.get('importData')?.value?.trim();
      
      if (!importData) {
        throw new Error('No data to import');
      }
      
      // Validate JSON
      let parsedData;
      try {
        parsedData = JSON.parse(importData);
      } catch (e) {
        throw new Error('Invalid JSON format. Please check your data.');
      }
      
      // Call GraphQL mutation
      const success = await this.adminGraphQLService.importData(importData).toPromise();
      
      if (!success) {
        throw new Error('Failed to import data');
      }
      
      // Refresh data service to update UI
      this.dataService.refreshFromGraphQL();
      
      this.successMessage.set('Data imported successfully! Your CV has been updated.');
      this.resetForm();
      
      // Close panel after successful import
      setTimeout(() => {
        this.adminService.closeAdminPanel();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error importing data:', error);
      this.errorMessage.set(error.message || 'Failed to import data. Please try again.');
    } finally {
      this.isImporting.set(false);
    }
  }
  
  closePanel() {
    this.adminService.closeAdminPanel();
  }
  
  private resetForm() {
    this.importForm.reset();
    this.selectedFile.set(null);
    
    // Reset file input
    const fileInput = document.getElementById('importFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  
  private clearMessages() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
