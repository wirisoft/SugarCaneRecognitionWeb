// src/app/directives/admin-only.directive.ts
import { Directive, OnInit, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../services/permissions/permissions.service';

@Directive({
  selector: '[appAdminOnly]',
  standalone: true
})
export class AdminOnlyDirective implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.permissionsService.isAdmin()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => {
        this.viewContainer.clear();
        if (isAdmin) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}