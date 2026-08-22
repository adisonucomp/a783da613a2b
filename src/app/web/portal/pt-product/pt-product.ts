import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { MdB8043c54 } from '../../../interfaces/working/md-b8043c54';
import { SgA6ac2e09 } from '../../../services/backend/java/spring/sg-a6ac2e09/sg-a6ac2e09';
import { SgB2c17bdf } from '../../../services/backend/java/spring/sg-b2c17bdf/sg-b2c17bdf';
import { SgB4c4c7b1 } from '../../../services/backend/java/spring/sg-b4c4c7b1/sg-b4c4c7b1';
import { SgB8043c54 } from '../../../services/backend/java/spring/sg-b8043c54/sg-b8043c54';
import { SgC98391c6 } from '../../../services/backend/java/spring/sg-c98391c6/sg-c98391c6';
import { SgD0112a5a } from '../../../services/backend/java/spring/sg-d0112a5a/sg-d0112a5a';
import { SgD148f4b4 } from '../../../services/backend/java/spring/sg-d148f4b4/sg-d148f4b4';

interface ProductImage {
  id: number;
  source: string;
}

interface ProductDetail extends MdB8043c54 {
  brandName: string;
  brandImage?: string;
  graphicCardName: string;
  graphicCardImage?: string;
  operatingSystemName: string;
  operatingSystemImage?: string;
  processorName: string;
  processorImage?: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-pt-product',
  styleUrl: './pt-product.css',
  templateUrl: './pt-product.html',
})
export class PtProduct implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly deviceService = inject(SgB8043c54);
  private readonly deviceImageService = inject(SgD148f4b4);
  private readonly brandDeviceService = inject(SgB4c4c7b1);
  private readonly brandProcessorService = inject(SgC98391c6);
  private readonly graphicCardService = inject(SgA6ac2e09);
  private readonly operatingSystemService = inject(SgD0112a5a);
  private readonly typeProcessorService = inject(SgB2c17bdf);

  readonly activeImage = signal('');
  readonly device = signal<ProductDetail | null>(null);
  readonly images = signal<ProductImage[]>([]);
  readonly loading = signal(true);
  readonly quantity = signal(1);
  readonly showImageModal = signal(false);
  readonly mainImage = computed(() => this.activeImage() || this.images()[0]?.source || '');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isInteger(id) || id <= 0) {
        this.loading.set(false);
        return;
      }
      this.loadProduct(id);
    });
  }

  selectImage(image: ProductImage): void {
    this.activeImage.set(image.source);
  }

  openImageModal(): void {
    if (this.mainImage()) {
      this.showImageModal.set(true);
      this.document.body.classList.add('image-viewer-open');
    }
  }

  closeImageModal(): void {
    this.showImageModal.set(false);
    this.document.body.classList.remove('image-viewer-open');
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('image-viewer-open');
  }

  setQuantity(value: string, stock: number): void {
    const parsedValue = Number(value);
    const maximum = Math.max(1, stock);
    this.quantity.set(Number.isFinite(parsedValue) ? Math.min(maximum, Math.max(1, Math.trunc(parsedValue))) : 1);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  }

  relatedImageSource(image?: string): string {
    return image ? this.toImageSource(image) : '';
  }

  formatDate(date: string): string {
    if (!date) {
      return 'No especificada';
    }
    const parsedDate = new Date(`${date}T00:00:00`);
    return Number.isNaN(parsedDate.valueOf()) ? date : new Intl.DateTimeFormat('es-CO').format(parsedDate);
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    forkJoin({
      device: this.deviceService.getById(id).pipe(catchError(() => of(null))),
      deviceImages: this.deviceImageService.getAll().pipe(catchError(() => of([]))),
      brands: this.brandDeviceService.getAll().pipe(catchError(() => of([]))),
      brandProcessors: this.brandProcessorService.getAll().pipe(catchError(() => of([]))),
      graphics: this.graphicCardService.getAll().pipe(catchError(() => of([]))),
      systems: this.operatingSystemService.getAll().pipe(catchError(() => of([]))),
      processors: this.typeProcessorService.getAll().pipe(catchError(() => of([]))),
    }).subscribe(({ device, deviceImages, brands, brandProcessors, graphics, systems, processors }) => {
      if (!device) {
        this.device.set(null);
        this.images.set([]);
        this.activeImage.set('');
        this.loading.set(false);
        return;
      }

      const namesById = (items: Array<{ idRegister?: number; fdName?: string; name?: string }>) => new Map(
        items.map((item) => [item.idRegister, item.name ?? item.fdName ?? 'No especificado']),
      );
      const imagesById = (items: Array<{ fdImage?: string; idRegister?: number }>) => new Map(
        items.map((item) => [item.idRegister, item.fdImage]),
      );
      const processor = processors.find((item) => item.idRegister === device.typeProcessorId);
      const brandImages = imagesById(brands);
      const processorImages = imagesById(brandProcessors);
      const graphicImages = imagesById(graphics);
      const systemImages = imagesById(systems);
      const detail: ProductDetail = {
        ...device,
        brandName: namesById(brands).get(device.brandDeviceId) ?? 'No especificada',
        brandImage: brandImages.get(device.brandDeviceId),
        graphicCardName: namesById(graphics).get(device.graphicCardId) ?? 'No especificada',
        graphicCardImage: graphicImages.get(device.graphicCardId),
        operatingSystemName: namesById(systems).get(device.operatingSystemId) ?? 'No especificado',
        operatingSystemImage: systemImages.get(device.operatingSystemId),
        processorName: namesById(processors).get(device.typeProcessorId) ?? 'No especificado',
        processorImage: processorImages.get(processor?.brandProcessorId),
      };
      const gallery = [
        { id: 0, source: this.toImageSource(device.fdImage) },
        ...deviceImages
          .filter((image) => image.deviceId === id)
          .map((image) => ({ id: image.idRegister ?? image.imageExtId, source: this.toImageSource(image.fdData) })),
      ];

      this.device.set(detail);
      this.images.set(gallery);
      this.activeImage.set(gallery[0]?.source ?? '');
      this.quantity.set(1);
      this.loading.set(false);
    });
  }

  private toImageSource(image: string): string {
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
}
