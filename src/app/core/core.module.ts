import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ForcePasswordChangeGuard } from './guards/force-password-change.guard';

// Interceptors
import { TokenInterceptor } from './interceptors/token.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

// Services
import { AuthService } from './services/auth.service';
import { UserStateService } from './services/user-state.service';
import { PersistenceService } from './services/persistence.service';
import { NotificationService } from './services/notification.service';
import { LoadingService } from './services/loading.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    // Guards
    AuthGuard,
    RoleGuard,
    ForcePasswordChangeGuard,

    // Services
    AuthService,
    UserStateService,
    PersistenceService,
    NotificationService,
    LoadingService,

    // Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
