import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';
import { MdA6ac2e09 } from '../../../interfaces/working/md-a6ac2e09';
import { MdB2c17bdf } from '../../../interfaces/working/md-b2c17bdf';
import { MdB8043c54 } from '../../../interfaces/working/md-b8043c54';
import { MdB9f50faa } from '../../../interfaces/working/md-b9f50faa';
import { MdD0112a5a } from '../../../interfaces/working/md-d0112a5a';
import { SgA6ac2e09 } from '../../../services/backend/java/spring/sg-a6ac2e09/sg-a6ac2e09';
import { SgB2c17bdf } from '../../../services/backend/java/spring/sg-b2c17bdf/sg-b2c17bdf';
import { SgB4c4c7b1 } from '../../../services/backend/java/spring/sg-b4c4c7b1/sg-b4c4c7b1';
import { SgB8043c54 } from '../../../services/backend/java/spring/sg-b8043c54/sg-b8043c54';
import { DeviceRating, SgB9f50faa } from '../../../services/backend/java/spring/sg-b9f50faa/sg-b9f50faa';
import { SgB2412519 } from '../../../services/backend/java/spring/sg-b2412519/sg-b2412519';
import { SgC98391c6 } from '../../../services/backend/java/spring/sg-c98391c6/sg-c98391c6';
import { SgD0112a5a } from '../../../services/backend/java/spring/sg-d0112a5a/sg-d0112a5a';
import { AuthSession } from '../../../services/core/auth-session/auth-session';

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
  releaseDate: string;
  typeProcessorId: number;
}

interface ProductComment extends MdB9f50faa {
  userName: string;
}

const EMPTY_DEVICE_RATING: DeviceRating = {
  averageRating: 0,
  opinionCount: 0,
  rating1Count: 0,
  rating2Count: 0,
  rating3Count: 0,
  rating4Count: 0,
  rating5Count: 0,
};

type ProductSort = 'graphic-card' | 'operating-system' | 'price-asc' | 'price-desc' | 'processor' | 'release-asc' | 'release-desc';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-pt-home',
  styleUrl: './pt-home.css',
  templateUrl: './pt-home.html',
})
export class PtHome implements OnInit, OnDestroy {
  private readonly filtersCacheKey = 'portalHomeFilters';
  private readonly filtersCacheLifetime = 5 * 60_000;
  private readonly formBuilder = inject(FormBuilder);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly brandDeviceService = inject(SgB4c4c7b1);
  private readonly brandProcessorService = inject(SgC98391c6);
  private readonly typeProcessorService = inject(SgB2c17bdf);
  private readonly graphicCardService = inject(SgA6ac2e09);
  private readonly operatingSystemService = inject(SgD0112a5a);
  private readonly deviceService = inject(SgB8043c54);
  private readonly commentService = inject(SgB9f50faa);
  private readonly userService = inject(SgB2412519);
  readonly authSession = inject(AuthSession);

  readonly commentAuthorLoading = signal(false);
  readonly commentAuthorId = signal<number | null>(null);
  readonly commentFormOpen = signal(false);
  readonly commentSubmitting = signal(false);
  readonly commentsDeviceId = signal<number | null>(null);
  readonly commentsLoading = signal(false);
  readonly commentsModalOpen = signal(false);
  readonly commentsProductName = signal('');
  readonly deviceRating = signal<DeviceRating>(EMPTY_DEVICE_RATING);
  readonly loadingFilters = signal(true);
  readonly loadingProducts = signal(true);
  readonly page = signal(1);
  readonly pageSize = 25;
  readonly products = signal<ProductCard[]>([]);
  readonly productRatings = signal<Record<number, DeviceRating>>({});
  readonly productComments = signal<ProductComment[]>([]);
  readonly ratingLevels = [5, 4, 3, 2, 1];
  readonly ratingStars = [1, 2, 3, 4, 5];
  readonly commentForm = this.formBuilder.nonNullable.group({
    fdContent: ['', [Validators.required, Validators.maxLength(2_000)]],
    fdRating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
  });
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

  ngOnDestroy(): void {
    this.document.body.classList.remove('comments-modal-open');
  }

  openComments(product: ProductCard): void {
    this.commentsProductName.set(product.name);
    this.commentsDeviceId.set(product.id);
    this.commentFormOpen.set(false);
    this.commentsModalOpen.set(true);
    this.document.body.classList.add('comments-modal-open');
    this.loadComments(product.id);
  }

  openCommentForm(): void {
    if (!this.authSession.isAuthenticated() || this.commentAuthorLoading()) {
      return;
    }

    const userName = this.authSession.getUserName()?.trim().toLocaleLowerCase();
    if (!userName) {
      void Swal.fire({ icon: 'warning', title: 'No fue posible identificar su sesión', confirmButtonText: 'Aceptar' });
      return;
    }

    this.commentAuthorLoading.set(true);
    this.userService.getAll().pipe(
      catchError(() => of([])),
      finalize(() => this.commentAuthorLoading.set(false)),
    ).subscribe((users) => {
      const user = users.find((entry) => entry.fdLogin?.trim().toLocaleLowerCase() === userName);
      if (!user?.idRegister) {
        void Swal.fire({ icon: 'warning', title: 'No fue posible identificar al usuario', text: 'Inicie sesión nuevamente e inténtelo de nuevo.', confirmButtonText: 'Aceptar' });
        return;
      }

      this.commentAuthorId.set(user.idRegister);
      this.commentForm.reset({ fdContent: '', fdRating: 5 });
      this.commentFormOpen.set(true);
    });
  }

  cancelCommentForm(): void {
    this.commentFormOpen.set(false);
    this.commentForm.reset({ fdContent: '', fdRating: 5 });
  }

  setCommentRating(rating: number): void {
    this.commentForm.controls.fdRating.setValue(rating);
    this.commentForm.controls.fdRating.markAsTouched();
  }

  submitComment(): void {
    const deviceId = this.commentsDeviceId();
    const userId = this.commentAuthorId();
    if (!deviceId || !userId || this.commentSubmitting()) {
      return;
    }

    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const now = new Date();
    const payload = {
      ...this.commentForm.getRawValue(),
      deviceId,
      fdDate: now.toISOString().slice(0, 10),
      fdHour: now.toTimeString().slice(0, 8),
      userId,
    };
    this.commentSubmitting.set(true);
    this.commentService.create(payload).pipe(finalize(() => this.commentSubmitting.set(false))).subscribe({
      next: () => {
        this.cancelCommentForm();
        this.loadComments(deviceId);
        void Swal.fire({ icon: 'success', title: 'Opinión publicada', confirmButtonText: 'Aceptar', timer: 1800, timerProgressBar: true });
      },
      error: () => {
        void Swal.fire({ icon: 'error', title: 'No fue posible publicar la opinión', confirmButtonText: 'Aceptar' });
      },
    });
  }

  private loadComments(deviceId: number): void {
    this.productComments.set([]);
    this.deviceRating.set(EMPTY_DEVICE_RATING);
    this.commentsLoading.set(true);
    forkJoin({
      comments: this.commentService.getAll().pipe(catchError(() => of([]))),
      rating: this.commentService.getDeviceRating(deviceId).pipe(catchError(() => of(EMPTY_DEVICE_RATING))),
      users: this.authSession.isAuthenticated() ? this.userService.getAll().pipe(catchError(() => of([]))) : of([]),
    }).subscribe(({ comments, rating, users }) => {
      const usersById = new Map(users.map((user) => [
        user.idRegister,
        `${user.fdName} ${user.fdSrnm}`.trim() || user.fdLogin,
      ]));
      this.productComments.set(
        comments
          .filter((comment) => comment.deviceId === deviceId)
          .sort((left, right) => `${right.fdDate} ${right.fdHour}`.localeCompare(`${left.fdDate} ${left.fdHour}`))
          .map((comment) => ({
            ...comment,
            userName: usersById.get(comment.userId) ?? `Usuario #${comment.userId}`,
          })),
      );
      this.deviceRating.set(rating);
      this.productRatings.update((ratings) => ({ ...ratings, [deviceId]: rating }));
      this.commentsLoading.set(false);
    });
  }

  closeComments(): void {
    this.commentsModalOpen.set(false);
    this.commentFormOpen.set(false);
    this.document.body.classList.remove('comments-modal-open');
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

  hasDiscount(product: ProductCard): boolean {
    return product.discount > 0;
  }

  discountedPrice(product: ProductCard): number {
    return product.price * (1 - product.discount / 100);
  }

  formatCommentDate(comment: MdB9f50faa): string {
    const parsedDate = new Date(`${comment.fdDate}T${comment.fdHour || '00:00:00'}`);
    if (Number.isNaN(parsedDate.valueOf())) {
      return [comment.fdDate, comment.fdHour].filter(Boolean).join(' ');
    }
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(parsedDate);
  }

  formatAverageRating(value: number): string {
    return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
  }

  ratingCount(rating: number): number {
    const property = `rating${rating}Count` as keyof Pick<DeviceRating, 'rating1Count' | 'rating2Count' | 'rating3Count' | 'rating4Count' | 'rating5Count'>;
    return this.deviceRating()[property];
  }

  ratingPercentage(rating: number): number {
    const total = this.deviceRating().opinionCount;
    return total > 0 ? (this.ratingCount(rating) / total) * 100 : 0;
  }

  productRating(productId: number): DeviceRating {
    return this.productRatings()[productId] ?? EMPTY_DEVICE_RATING;
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
      const products = this.toProducts(devices, typeProcessor, graphicCard, operatingSystem, brandProcessor);
      this.products.set(products);
      this.productRatings.set({});
      forkJoin(products.map((product) => this.commentService.getDeviceRating(product.id).pipe(catchError(() => of(EMPTY_DEVICE_RATING))))).subscribe((ratings) => {
        this.productRatings.set(Object.fromEntries(products.map((product, index) => [product.id, ratings[index]])));
      });
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
        discount: Math.min(100, Math.max(0, Number(device.fdDto) || 0)),
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
