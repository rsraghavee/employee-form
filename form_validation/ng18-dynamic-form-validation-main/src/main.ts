import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import 'zone.js';
import { Subscription, tap } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { LabelComponent } from './label.component';
import { ControlErrorComponent } from './error.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LabelComponent, ControlErrorComponent, HttpClientModule],
  template: `
    <div class="container">
      <div class="col-md-8 offset-md-2">
        <h2 class="my-3 text-center">Employee Management Form</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-light p-4 rounded">
          <div class="mb-3">
            <app-label for="name" [control]="form.controls.name">Name</app-label>
            <input id="name" type="text" class="form-control" formControlName="name">
            <control-error controlName="name"></control-error>
          </div>

          <div class="mb-3">
            <app-label for="employeeId" [control]="form.controls.employeeId">Employee ID</app-label>
            <input id="employeeId" type="text" class="form-control" formControlName="employeeId">
            <control-error controlName="employeeId"></control-error>
          </div>

          <div class="mb-3">
            <app-label for="email" [control]="form.controls.email">Email</app-label>
            <input id="email" type="email" class="form-control" formControlName="email">
            <control-error
              controlName="email"
              [customErrors]="{ email: 'Please enter a valid email address' }"
            ></control-error>
          </div>

          <div class="mb-3">
            <app-label for="phone" [control]="form.controls.phone">Phone Number</app-label>
            <input id="phone" type="text" class="form-control" formControlName="phone">
            <control-error controlName="phone"></control-error>
          </div>

          <div class="mb-3">
            <app-label for="department" [control]="form.controls.department">Department</app-label>
            <select id="department" class="form-select" formControlName="department">
              <option value="" disabled>Select Department</option>
              <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
            </select>
            <control-error controlName="department"></control-error>
          </div>

          <div class="mb-3">
            <app-label for="dateOfJoining" [control]="form.controls.dateOfJoining">Date of Joining</app-label>
            <input id="dateOfJoining" type="date" class="form-control" formControlName="dateOfJoining" max="{{ currentDate }}">
            <control-error controlName="dateOfJoining"></control-error>
          </div>

          <div class="mb-3">
            <app-label for="role" [control]="form.controls.role">Role</app-label>
            <input id="role" type="text" class="form-control" formControlName="role">
            <control-error controlName="role"></control-error>
          </div>

          <div class="d-grid gap-2">
            <button class="btn btn-primary" [disabled]="form.invalid" type="submit">Submit</button>
            <button class="btn btn-secondary" type="button" (click)="onReset()">Reset</button>
          </div>

          <div *ngIf="submitted" class="alert alert-success mt-3">
            Employee successfully added!
          </div>
        </form>
      </div>
    </div>
  `,
})
export class App implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  sub = new Subscription();
  http = inject(HttpClient);
  submitted = false;
  currentDate = new Date().toISOString().split('T')[0];
  departments = ['HR', 'Engineering', 'Marketing'];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    employeeId: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{1,10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    department: ['', Validators.required],
    dateOfJoining: ['', Validators.required],
    role: ['', [Validators.required, Validators.minLength(3)]],
  });


  ngOnInit() {
    this.setUpValidation();
  }

  setUpValidation() {
    this.sub = this.form.controls.dateOfJoining.valueChanges
      .pipe(startWith(this.form.controls.dateOfJoining.value))
      .subscribe((date) => {
        if (date && new Date(date) > new Date()) {
          this.form.controls.dateOfJoining.setErrors({ futureDate: true });
        } else {
          this.form.controls.dateOfJoining.setErrors(null);
        }
      });
  }
  

  onSubmit() {
    if (this.form.valid) {
      this.http.post('http://localhost:3000/api/employees', this.form.value)
        .subscribe({
          next: (response) => {
            console.log('Employee successfully added:', response);
            this.submitted = true;
            this.form.reset(); // Resets all form fields
            setTimeout(() => (this.submitted = false), 3000);
          },
          error: (error) => {
            console.error('Error saving employee:', error);
          }
        });
      console.log(this.form.value);
      this.submitted = true;
    }
  }

  onReset() {
    this.form.reset();
    this.submitted = false;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

bootstrapApplication(App, {
  providers: [provideHttpClient()],
});
