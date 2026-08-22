import { isPlatformBrowser } from '@angular/common';
import { Component, Input, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { SgA6ac2e09 } from '../../../services/backend/java/spring/sg-a6ac2e09/sg-a6ac2e09';
import { SgB2c17bdf } from '../../../services/backend/java/spring/sg-b2c17bdf/sg-b2c17bdf';
import { SgB4c4c7b1 } from '../../../services/backend/java/spring/sg-b4c4c7b1/sg-b4c4c7b1';
import { SgB8043c54 } from '../../../services/backend/java/spring/sg-b8043c54/sg-b8043c54';
import { SgC98391c6 } from '../../../services/backend/java/spring/sg-c98391c6/sg-c98391c6';
import { SgD0112a5a } from '../../../services/backend/java/spring/sg-d0112a5a/sg-d0112a5a';

export type PortalCategory = 'brand-device' | 'brand-processor' | 'device-data' | 'graphic-card' | 'operating-system';

interface CategoryItem { id: number; image?: string; label: string; }
interface ProductItem {
  brandDeviceId: number;
  discount: number;
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
}

@Component({
  imports: [RouterLink],
  selector: 'app-pt-category-products',
  styleUrl: './pt-category-products.css',
  templateUrl: './pt-category-products.html',
})
export class PtCategoryProducts implements OnInit {
  @Input({ required: true }) category!: PortalCategory;
  @Input() showRelatedImages = true;
  @Input({ required: true }) title = '';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly brandDeviceService = inject(SgB4c4c7b1);
  private readonly brandProcessorService = inject(SgC98391c6);
  private readonly deviceService = inject(SgB8043c54);
  private readonly graphicCardService = inject(SgA6ac2e09);
  private readonly operatingSystemService = inject(SgD0112a5a);
  private readonly typeProcessorService = inject(SgB2c17bdf);

  readonly categoryItems = signal<CategoryItem[]>([]);
  readonly loading = signal(true);
  readonly products = signal<ProductItem[]>([]);
  readonly selectedId = signal<number | null>(null);
  readonly filteredProducts = computed(() => this.products().filter((product) => this.matchesCategory(product)));

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    forkJoin({
      brandDevices: this.brandDeviceService.getAll().pipe(catchError(() => of([]))),
      brandProcessors: this.brandProcessorService.getAll().pipe(catchError(() => of([]))),
      devices: this.deviceService.getAll().pipe(catchError(() => of([]))),
      graphicCards: this.graphicCardService.getAll().pipe(catchError(() => of([]))),
      operatingSystems: this.operatingSystemService.getAll().pipe(catchError(() => of([]))),
      typeProcessors: this.typeProcessorService.getAll().pipe(catchError(() => of([]))),
    }).subscribe(({ brandDevices, brandProcessors, devices, graphicCards, operatingSystems, typeProcessors }) => {
      const item = (id: number | undefined, label: string | undefined, image?: string): CategoryItem | null =>
        typeof id === 'number' ? { id, label: label ?? 'Sin nombre', image } : null;
      const toItems = <T extends { fdImage?: string; fdName?: string; idRegister?: number; name?: string }>(items: T[]) =>
        items.map((entry) => item(entry.idRegister, entry.name ?? entry.fdName, entry.fdImage)).filter((entry): entry is CategoryItem => entry !== null);
      const categoryItems: Record<PortalCategory, CategoryItem[]> = {
        'brand-device': toItems(brandDevices),
        'brand-processor': toItems(brandProcessors),
        'device-data': devices.map((device) => item(device.idRegister, device.fdName, device.fdImage)).filter((entry): entry is CategoryItem => entry !== null),
        'graphic-card': toItems(graphicCards),
        'operating-system': toItems(operatingSystems),
      };
      const names = (items: Array<{ fdName?: string; idRegister?: number; name?: string }>) => new Map(
        items.map((entry) => [entry.idRegister, entry.name ?? entry.fdName ?? 'No especificado']),
      );
      const typesById = new Map(typeProcessors.map((type) => [type.idRegister, type]));
      const processors = names(typeProcessors);
      const graphics = names(graphicCards);
      const systems = names(operatingSystems);
      const images = (items: Array<{ fdImage?: string; idRegister?: number }>) => new Map(
        items.map((entry) => [entry.idRegister, entry.fdImage]),
      );
      const processorImages = images(brandProcessors);
      const graphicImages = images(graphicCards);
      const systemImages = images(operatingSystems);

      this.categoryItems.set(categoryItems[this.category]);
      this.products.set(devices.filter((device) => typeof device.idRegister === 'number').map((device) => ({
        id: device.idRegister!,
        name: device.fdName,
        image: device.fdImage,
        discount: Math.min(100, Math.max(0, Number(device.fdDto) || 0)),
        price: Number(device.fdPrice) || 0,
        brandDeviceId: device.brandDeviceId,
        processor: processors.get(device.typeProcessorId) ?? 'No especificado',
        processorBrandId: typesById.get(device.typeProcessorId)?.brandProcessorId ?? 0,
        processorImage: processorImages.get(typesById.get(device.typeProcessorId)?.brandProcessorId),
        graphicCard: graphics.get(device.graphicCardId) ?? 'No especificada',
        graphicCardId: device.graphicCardId,
        graphicCardImage: graphicImages.get(device.graphicCardId),
        operatingSystem: systems.get(device.operatingSystemId) ?? 'No especificado',
        operatingSystemId: device.operatingSystemId,
        operatingSystemImage: systemImages.get(device.operatingSystemId),
      })));
      this.loading.set(false);
    });
  }

  selectCategory(id: number): void {
    this.selectedId.update((selectedId) => selectedId === id ? null : id);
  }

  imageSource(image?: string): string | undefined {
    if (!image) return undefined;
    if (image.startsWith('data:image/')) return image;
    const mimeType = image.startsWith('iVBORw') ? 'image/png' : image.startsWith('/9j/') ? 'image/jpeg' : image.startsWith('R0lGOD') ? 'image/gif' : image.startsWith('UklGR') ? 'image/webp' : 'image/png';
    return `data:${mimeType};base64,${image}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  }

  hasDiscount(product: ProductItem): boolean {
    return product.discount > 0;
  }

  discountedPrice(product: ProductItem): number {
    return product.price * (1 - product.discount / 100);
  }

  private matchesCategory(product: ProductItem): boolean {
    const selectedId = this.selectedId();
    if (selectedId === null) return true;
    switch (this.category) {
      case 'brand-device': return product.brandDeviceId === selectedId;
      case 'brand-processor': return product.processorBrandId === selectedId;
      case 'device-data': return product.id === selectedId;
      case 'graphic-card': return product.graphicCardId === selectedId;
      case 'operating-system': return product.operatingSystemId === selectedId;
    }
  }
}
