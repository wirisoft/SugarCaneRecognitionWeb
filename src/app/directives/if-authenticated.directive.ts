// src/app/directives/if-authenticated.directive.ts
import { Directive, OnInit, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../services/permissions/permissions.service';

@Directive({
  selector: '[appIfAuthenticated]',
  standalone: true
})
export class IfAuthenticatedDirective implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.permissionsService.isAuthenticated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        this.viewContainer.clear();
        if (isAuthenticated) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}