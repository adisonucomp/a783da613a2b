import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { SgA6ac2e09 } from '../../../services/backend/java/spring/sg-a6ac2e09/sg-a6ac2e09';
import { SgB2c17bdf } from '../../../services/backend/java/spring/sg-b2c17bdf/sg-b2c17bdf';
import { SgB4c4c7b1 } from '../../../services/backend/java/spring/sg-b4c4c7b1/sg-b4c4c7b1';
import { SgC98391c6 } from '../../../services/backend/java/spring/sg-c98391c6/sg-c98391c6';
import { SgD0112a5a } from '../../../services/backend/java/spring/sg-d0112a5a/sg-d0112a5a';

interface FilterOption {
  id: number;
  label: string;
  selected: boolean;
}

interface FilterSection {
  key: string;
  title: string;
  options: FilterOption[];
}

@Component({
  imports: [],
  selector: 'app-pt-home',
  styleUrl: './pt-home.css',
  templateUrl: './pt-home.html',
})
export class PtHome implements OnInit {
  private readonly filtersCacheKey = 'portalHomeFilters';
  private readonly filtersCacheLifetime = 5 * 60_000;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly brandDeviceService = inject(SgB4c4c7b1);
  private readonly brandProcessorService = inject(SgC98391c6);
  private readonly typeProcessorService = inject(SgB2c17bdf);
  private readonly graphicCardService = inject(SgA6ac2e09);
  private readonly operatingSystemService = inject(SgD0112a5a);

  readonly loadingFilters = signal(true);
  readonly filters = signal<FilterSection[]>([
    { key: 'brand-device', title: 'Marcas de Dispositivos', options: [] },
    { key: 'brand-processor', title: 'Marcas de Procesadores', options: [] },
    { key: 'type-processor', title: 'Tipo de Procesadores', options: [] },
    { key: 'graphic-card', title: 'Tarjetas Graficas', options: [] },
    { key: 'operating-system', title: 'Sistemas Operativos', options: [] },
  ]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loadingFilters.set(false);
      return;
    }

    this.restoreFiltersFromCache();
    this.loadFilters();
  }

  private loadFilters(): void {
    forkJoin({
      brandDevice: this.brandDeviceService.getAll().pipe(catchError(() => of([]))),
      brandProcessor: this.brandProcessorService.getAll().pipe(catchError(() => of([]))),
      typeProcessor: this.typeProcessorService.getAll().pipe(catchError(() => of([]))),
      graphicCard: this.graphicCardService.getAll().pipe(catchError(() => of([]))),
      operatingSystem: this.operatingSystemService.getAll().pipe(catchError(() => of([]))),
    }).subscribe(({ brandDevice, brandProcessor, typeProcessor, graphicCard, operatingSystem }) => {
      this.setOptions('brand-device', this.toFilterOptions(brandDevice));
      this.setOptions('brand-processor', this.toFilterOptions(brandProcessor));
      this.setOptions('type-processor', this.toFilterOptions(typeProcessor));
      this.setOptions('graphic-card', this.toFilterOptions(graphicCard));
      this.setOptions('operating-system', this.toFilterOptions(operatingSystem));
      this.loadingFilters.set(false);
      this.saveFiltersToCache();
    });
  }

  toggleOption(sectionKey: string, optionId: number, checked: boolean): void {
    this.filters.update((sections) =>
      sections.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              options: section.options.map((option) =>
                option.id === optionId ? { ...option, selected: checked } : option,
              ),
            }
          : section,
      ),
    );
  }

  private setOptions(sectionKey: string, options: FilterOption[]): void {
    this.filters.update((sections) =>
      sections.map((section) => (section.key === sectionKey ? { ...section, options } : section)),
    );
  }

  private toFilterOptions(items: Array<{ idRegister?: number; name?: string; fdName?: string }>): FilterOption[] {
    return items.map((item) => ({
      id: item.idRegister ?? 0,
      label: item.name ?? item.fdName ?? 'Sin nombre',
      selected: false,
    }));
  }

  private restoreFiltersFromCache(): void {
    try {
      const cachedValue = sessionStorage.getItem(this.filtersCacheKey);
      if (!cachedValue) {
        return;
      }

      const cached = JSON.parse(cachedValue) as { createdAt?: number; filters?: FilterSection[] };
      if (!cached.createdAt || Date.now() - cached.createdAt > this.filtersCacheLifetime || !cached.filters) {
        sessionStorage.removeItem(this.filtersCacheKey);
        return;
      }

      this.filters.set(cached.filters.map((section) => ({
        ...section,
        options: section.options.map((option) => ({ ...option, selected: false })),
      })));
      this.loadingFilters.set(false);
    } catch {
      sessionStorage.removeItem(this.filtersCacheKey);
    }
  }

  private saveFiltersToCache(): void {
    try {
      sessionStorage.setItem(this.filtersCacheKey, JSON.stringify({
        createdAt: Date.now(),
        filters: this.filters(),
      }));
    } catch {
      // La aplicación continúa sin caché si el navegador bloquea el almacenamiento.
    }
  }
}
