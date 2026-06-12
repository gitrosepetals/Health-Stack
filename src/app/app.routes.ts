import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AdminLayoutComponent } from './components/admin/layout/layout.component';
import { AdminLoginComponent } from './components/admin/login/login.component';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { AdminArticleFormComponent } from './components/admin/article-form/article-form.component';
import { adminAuthGuard, adminGuestGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
    canActivate: [adminGuestGuard],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'articles/new', component: AdminArticleFormComponent },
      { path: 'articles/:id/edit', component: AdminArticleFormComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
