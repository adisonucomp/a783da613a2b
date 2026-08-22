import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { MdA6ac2e09 } from '../../../interfaces/working/md-a6ac2e09';
import { MdB2c17bdf } from '../../../interfaces/working/md-b2c17bdf';
import { MdB8043c54 } from '../../../interfaces/working/md-b8043c54';
import { MdD0112a5a } from '../../../interfaces/working/md-d0112a5a';
import { SgA6ac2e09 } from '../../../services/backend/java/spring/sg-a6ac2e09/sg-a6ac2e09';
import { SgB2c17bdf } from '../../../services/backend/java/spring/sg-b2c17bdf/sg-b2c17bdf';
import { SgB4c4c7b1 } from '../../../services/backend/java/spring/sg-b4c4c7b1/sg-b4c4c7b1';
import { SgB8043c54 } from '../../../services/backend/java/spring/sg-b8043c54/sg-b8043c54';
import { SgC98391c6 } from '../../../services/backend/java/spring/sg-c98391c6/sg-c98391c6';
import { SgD0112a5a } from '../../../services/backend/java/spring/sg-d0112a5a/sg-d0112a5a';

interface FilterOption {
  id: number;
  image?: string;
  label: string;
  selected: boolean;
}

interface FilterSection {
  key: string;
  title: string;
  options: FilterOption[];
}

interface ProductCard {
  brandDeviceId: number;
  graphicCard: string;
  graphicCardId: number;
  graphicCardImage?: string;
  id: number;
  image: string;
  name: string;
  operatingSystem: string;
  operatingSystemId: number;
  operatingSystemImage?: string;
  price: number;
  processor: string;
  processorBrandId: number;
  processorImage?: string;
  releaseDate: string;
  typeProcessorId: number;
}

type ProductSort = 'graphic-card' | 'operating-system' | 'price-asc' | 'price-desc' | 'processor' | 'release-asc' | 'release-desc';

@Component({
  imports: [RouterLink],
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
  private readonly deviceService = inject(SgB8043c54);

  readonly loadingFilters = signal(true);
  readonly loadingProducts = signal(true);
  readonly page = signal(1);
  readonly pageSize = 25;
  readonly products = signal<ProductCard[]>([]);
  readonly sort = signal<ProductSort>('release-desc');
  readonly filters = signal<FilterSection[]>([
    { key: 'brand-device', title: 'Marcas de Dispositivos', options: [] },
    { key: 'brand-processor', title: 'Marcas de Procesadores', options: [] },
    { key: 'type-processor', title: 'Tipo de Procesadores', options: [] },
    { key: 'graphic-card', title: 'Tarjetas Graficas', options: [] },
    { key: 'operating-system', title: 'Sistemas Operativos', options: [] },
  ]);
  readonly filteredProducts = computed(() => this.products().filter((product) => this.matchesFilters(product)));
  readonly sortedProducts = computed(() => this.sortProducts(this.filteredProducts(), this.sort()));
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sortedProducts().length / this.pageSize)));
  readonly visibleProducts = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sortedProducts().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loadingFilters.set(false);
      this.loadingProducts.set(false);
      return;
    }

    this.restoreFiltersFromCache();
    this.loadCatalog();
  }

  toggleOption(sectionKey: string, optionId: number, checked: boolean): void {
    this.filters.update((sections) => sections.map((section) =>
      section.key === sectionKey
        ? { ...section, options: section.options.map((option) => option.id === optionId ? { ...option, selected: checked } : option) }
        : section,
    ));
    this.page.set(1);
  }

  previousPage(): void {
    this.page.update((page) => Math.max(1, page - 1));
  }

  nextPage(): void {
    this.page.update((page) => Math.min(this.totalPages(), page + 1));
  }

  setSort(value: string): void {
    const validSorts: ProductSort[] = ['release-desc', 'release-asc', 'processor', 'graphic-card', 'operating-system', 'price-desc', 'price-asc'];
    if (validSorts.includes(value as ProductSort)) {
      this.sort.set(value as ProductSort);
      this.page.set(1);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  }

  productImage(image: string): string {
    if (image.startsWith('data:image/')) {
      return image;
    }

    const mimeType = image.startsWith('iVBORw') ? 'image/png'
      : image.startsWith('/9j/') ? 'image/jpeg'
        : image.startsWith('R0lGOD') ? 'image/gif'
          : image.startsWith('UklGR') ? 'image/webp'
            : 'image/png';
    return `data:${mimeType};base64,${image}`;
  }

  private loadCatalog(): void {
    forkJoin({
      brandDevice: this.brandDeviceService.getAll().pipe(catchError(() => of([]))),
      brandProcessor: this.brandProcessorService.getAll().pipe(catchError(() => of([]))),
      typeProcessor: this.typeProcessorService.getAll().pipe(catchError(() => of([]))),
      graphicCard: this.graphicCardService.getAll().pipe(catchError(() => of([]))),
      operatingSystem: this.operatingSystemService.getAll().pipe(catchError(() => of([]))),
      devices: this.deviceService.getAll().pipe(catchError(() => of([]))),
    }).subscribe(({ brandDevice, brandProcessor, typeProcessor, graphicCard, operatingSystem, devices }) => {
      this.setOptions('brand-device', this.toFilterOptions(brandDevice));
      this.setOptions('brand-processor', this.toFilterOptions(brandProcessor));
      const processorBrandImages = new Map(brandProcessor.map((brand) => [brand.idRegister, brand.fdImage]));
      this.setOptions('type-processor', this.toFilterOptions(typeProcessor, (type) => processorBrandImages.get(type.brandProcessorId)));
      this.setOptions('graphic-card', this.toFilterOptions(graphicCard));
      this.setOptions('operating-system', this.toFilterOptions(operatingSystem));
      this.products.set(this.toProducts(devices, typeProcessor, graphicCard, operatingSystem, brandProcessor));
      this.page.set(1);
      this.loadingFilters.set(false);
      this.loadingProducts.set(false);
      this.saveFiltersToCache();
    });
  }

  private toProducts(
    devices: MdB8043c54[],
    processorTypes: MdB2c17bdf[],
    graphicCards: MdA6ac2e09[],
    operatingSystems: MdD0112a5a[],
    processorBrands: Array<{ fdImage?: string; idRegister?: number }>,
  ): ProductCard[] {
    const namesById = (items: Array<{ idRegister?: number; fdName: string }>) => new Map(
      items.map((item) => [item.idRegister, item.fdName]),
    );
    const processors = namesById(processorTypes);
    const processorTypesById = new Map(processorTypes.map((processor) => [processor.idRegister, processor]));
    const graphics = namesById(graphicCards);
    const systems = namesById(operatingSystems);
    const processorImages = new Map(processorBrands.map((brand) => [brand.idRegister, brand.fdImage]));
    const graphicImages = new Map(graphicCards.map((graphic) => [graphic.idRegister, graphic.fdImage]));
    const systemImages = new Map(operatingSystems.map((system) => [system.idRegister, system.fdImage]));

    return devices
      .filter((device) => typeof device.idRegister === 'number')
      .map((device) => ({
        id: device.idRegister!,
        name: device.fdName,
        image: device.fdImage,
        brandDeviceId: device.brandDeviceId,
        processor: processors.get(device.typeProcessorId) ?? 'No especificado',
        processorBrandId: processorTypesById.get(device.typeProcessorId)?.brandProcessorId ?? 0,
        processorImage: processorImages.get(processorTypesById.get(device.typeProcessorId)?.brandProcessorId),
        typeProcessorId: device.typeProcessorId,
        graphicCard: graphics.get(device.graphicCardId) ?? 'No especificada',
        graphicCardId: device.graphicCardId,
        graphicCardImage: graphicImages.get(device.graphicCardId),
        operatingSystem: systems.get(device.operatingSystemId) ?? 'No especificado',
        operatingSystemId: device.operatingSystemId,
        operatingSystemImage: systemImages.get(device.operatingSystemId),
        price: Number(device.fdPrice) || 0,
        releaseDate: device.fdRelease,
      }));
  }

  private sortProducts(products: ProductCard[], sort: ProductSort): ProductCard[] {
    const byText = (left: string, right: string) => left.localeCompare(right, 'es', { sensitivity: 'base' });
    const byDate = (left: string, right: string) => Date.parse(left || '1900-01-01') - Date.parse(right || '1900-01-01');

    return [...products].sort((left, right) => {
      switch (sort) {
        case 'release-asc': return byDate(left.releaseDate, right.releaseDate);
        case 'release-desc': return byDate(right.releaseDate, left.releaseDate);
        case 'processor': return byText(left.processor, right.processor);
        case 'graphic-card': return byText(left.graphicCard, right.graphicCard);
        case 'operating-system': return byText(left.operatingSystem, right.operatingSystem);
        case 'price-asc': return left.price - right.price;
        case 'price-desc': return right.price - left.price;
      }
    });
  }

  private matchesFilters(product: ProductCard): boolean {
    const selectedOptions = (key: string) => this.filters().find((section) => section.key === key)?.options
      .filter((option) => option.selected)
      .map((option) => option.id) ?? [];
    const matches = (selectedIds: number[], value: number) => selectedIds.length === 0 || selectedIds.includes(value);

    return matches(selectedOptions('brand-device'), product.brandDeviceId)
      && matches(selectedOptions('brand-processor'), product.processorBrandId)
      && matches(selectedOptions('type-processor'), product.typeProcessorId)
      && matches(selectedOptions('graphic-card'), product.graphicCardId)
      && matches(selectedOptions('operating-system'), product.operatingSystemId);
  }

  private setOptions(sectionKey: string, options: FilterOption[]): void {
    this.filters.update((sections) => sections.map((section) => section.key === sectionKey ? { ...section, options } : section));
  }

  private toFilterOptions<T extends { fdImage?: string; fdName?: string; idRegister?: number; name?: string }>(
    items: T[],
    imageResolver?: (item: T) => string | undefined,
  ): FilterOption[] {
    return items.map((item) => ({
      id: item.idRegister ?? 0,
      image: imageResolver?.(item) ?? item.fdImage,
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
      this.filters.set(cached.filters.map((section) => ({ ...section, options: section.options.map((option) => ({ ...option, selected: false })) })));
      this.loadingFilters.set(false);
    } catch {
      sessionStorage.removeItem(this.filtersCacheKey);
    }
  }

  private saveFiltersToCache(): void {
    try {
      sessionStorage.setItem(this.filtersCacheKey, JSON.stringify({ createdAt: Date.now(), filters: this.filters() }));
    } catch {
      // La aplicación continúa sin caché si el navegador bloquea el almacenamiento.
    }
  }
}
