// src/app/directives/can-perform.directive.ts
import { Directive, Input, OnInit, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../services/permissions/permissions.service';

@Directive({
  selector: '[appCanPerform]',
  standalone: true
})
export class CanPerformDirective implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  @Input() appCanPerform: string = '';
  @Input() appCanPerformResource: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.checkPermission();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermission() {
    this.viewContainer.clear();

    if (this.appCanPerform && this.appCanPerformResource) {
      this.permissionsService.canPerformAction(this.appCanPerform, this.appCanPerformResource)
        .pipe(takeUntil(this.destroy$))
        .subscribe(canPerform => {
          if (canPerform) {
            this.viewContainer.createEmbeddedView(this.templateRef);
          }
        });
    }
  }
}
