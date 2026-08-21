import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ModuleCounts, SgDash } from '../../../services/backend/java/spring/sg-dash/sg-dash';

interface DashboardModule {
  count: number | null;
  icon: string;
  path: string;
  title: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-wg-dashboard',
  styleUrl: './wg-dashboard.css',
  templateUrl: './wg-dashboard.html',
})
export class WgDashboard implements OnInit {
  private readonly dashService = inject(SgDash);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = signal(true);
  readonly modules = signal<DashboardModule[]>(this.createModules());

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.dashService.getModuleCounts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (counts) => this.updateCounts(counts),
        error: () => this.updateCounts({
          brandDevice: 0, brandProcessor: 0, comment: 0, deviceData: 0, deviceImage: 0,
          graphicCard: 0, imageExt: 0, operatingSystem: 0, roleData: 0, typeProcessor: 0, userData: 0,
        }),
      });
  }

  private updateCounts(counts: ModuleCounts): void {
    const quantityByPath: Record<string, number> = {
      '/working/a6ac2e09': counts.graphicCard,
      '/working/b22b6431': counts.imageExt,
      '/working/b2412519': counts.userData,
      '/working/b2c17bdf': counts.typeProcessor,
      '/working/b4c4c7b1': counts.brandDevice,
      '/working/b8043c54': counts.deviceData,
      '/working/b9f50faa': counts.comment,
      '/working/c0de7562': counts.roleData,
      '/working/c98391c6': counts.brandProcessor,
      '/working/d0112a5a': counts.operatingSystem,
      '/working/d148f4b4': counts.deviceImage,
    };

    this.modules.update((modules) => modules.map((module) => ({
      ...module,
      count: quantityByPath[module.path] ?? 0,
    })));
  }

  private createModules(): DashboardModule[] {
    return [
      { title: 'Tarjetas Gráficas', icon: 'bi-gpu-card', path: '/working/a6ac2e09', count: null },
      { title: 'Extensiones de Imágenes', icon: 'bi-file-earmark-image', path: '/working/b22b6431', count: null },
      { title: 'Usuarios', icon: 'bi-people', path: '/working/b2412519', count: null },
      { title: 'Tipos de Procesador', icon: 'bi-cpu', path: '/working/b2c17bdf', count: null },
      { title: 'Marcas de Dispositivos', icon: 'bi-bookmark-star', path: '/working/b4c4c7b1', count: null },
      { title: 'Dispositivos', icon: 'bi-pc-display', path: '/working/b8043c54', count: null },
      { title: 'Comentarios', icon: 'bi-chat-left-text', path: '/working/b9f50faa', count: null },
      { title: 'Roles', icon: 'bi-person-gear', path: '/working/c0de7562', count: null },
      { title: 'Marcas de Procesadores', icon: 'bi-cpu-fill', path: '/working/c98391c6', count: null },
      { title: 'Sistemas Operativos', icon: 'bi-window-stack', path: '/working/d0112a5a', count: null },
      { title: 'Imágenes de Dispositivos', icon: 'bi-images', path: '/working/d148f4b4', count: null },
    ];
  }
}
