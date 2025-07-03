// src/app/directives/has-role.directive.ts
import { Directive, Input, OnInit, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../services/permissions/permissions.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  @Input() set appHasRole(roles: string | string[]) {
    this.checkRole(roles);
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkRole(roles: string | string[]) {
    this.viewContainer.clear();

    if (Array.isArray(roles)) {
      this.permissionsService.hasAnyRole(roles)
        .pipe(takeUntil(this.destroy$))
        .subscribe(hasRole => {
          if (hasRole) {
            this.viewContainer.createEmbeddedView(this.templateRef);
          }
        });
    } else {
      this.permissionsService.hasRole(roles)
        .pipe(takeUntil(this.destroy$))
        .subscribe(hasRole => {
          if (hasRole) {
            this.viewContainer.createEmbeddedView(this.templateRef);
          }
        });
    }
  }
}