// src/app/directives/user-only.directive.ts  
import { Directive, OnInit, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../services/permissions/permissions.service';

@Directive({
  selector: '[appUserOnly]',
  standalone: true
})
export class UserOnlyDirective implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.permissionsService.isUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isUser => {
        this.viewContainer.clear();
        if (isUser) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
