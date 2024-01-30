import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { MainState, MainStore } from './main.component.store';
import { provideComponentStore } from '@ngrx/component-store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
export interface SentinelRequest {
  extent?: number[];
  dateFrom: Date;
  dateTo: Date;
  cloudCoverage: number;
}
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  providers: [provideComponentStore(MainStore)],
})
export class MainComponent implements OnInit {
  sentinelForm: FormGroup = new FormGroup({});
  vm$ = this.mainStore.vm$;
  constructor(private mainStore: MainStore, private formBuilder: FormBuilder) {}
  ngOnInit(): void {
    this.sentinelForm = this.formBuilder.group({
      dateFrom: [
        new Date('2023-06-01').toISOString().split('T')[0],
        Validators.required,
      ],
      dateTo: [
        new Date('2023-07-01').toISOString().split('T')[0],
        Validators.required,
      ],
      cloudCoverage: [
        22,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });
  }

  // onLoadImage(itemId: string) {
  //   this.mainStore.loadImage(itemId);
  // }
  onDrawEnd(extent: number[]) {
    console.log('!!!!!');
    console.log(this.sentinelForm.value);
    if (this.sentinelForm.valid) {
      // Handle the form submission logic here
      console.log('Form submitted:', this.sentinelForm.value);
      this.mainStore.loadImage({
        extent: extent,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
        cloudCoverage: this.cloudCoverage,
      });
    } else {
      // Mark all controls as touched to display validation messages
      this.sentinelForm.markAllAsTouched();
    }
  }
  onChange(ev: any) {
    console.log(ev.target.value);
  }

  onSubmit() {}
  // Accessor methods for form controls
  get dateFrom(): Date {
    return this.sentinelForm.get('dateFrom')?.value;
  }
  get dateTo(): Date {
    return this.sentinelForm.get('dateTo')?.value;
  }
  get cloudCoverage() {
    return this.sentinelForm.get('cloudCoverage')?.value;
  }

  onClassify() {
    this.mainStore.classify({
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      cloudCoverage: this.cloudCoverage,
    });
  }
  onObjectDetection() {
    console.log('DETECTIOOON');

    console.log(this.cloudCoverage);
    console.log(this.mainStore);
    this.mainStore.objectDetection({
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      cloudCoverage: this.cloudCoverage,
    });
  }
}
