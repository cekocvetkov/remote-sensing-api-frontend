import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private errorSubject: Subject<string> = new Subject<string>();

  constructor() { }

  showError(message: string): void {
    // Implement logic to display error banner or toast notification
    // For example, you can use a library like Angular Material Snackbar or Toastr.js
    console.error('!!!!!!!!!!'  + message); // Log error message to console for demonstration
    // Example using Angular Material Snackbar
    // this.snackbar.open(message, 'Close', { duration: 5000 });
    this.errorSubject.next(message);

  }

  get error$() {
    return this.errorSubject.asObservable();
  }

}
