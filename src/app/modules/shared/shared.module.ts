import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [ToastComponent, LoadingSpinnerComponent],
  imports: [CommonModule],
  exports: [ToastComponent, LoadingSpinnerComponent],
})
export class SharedModule {}
