import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { MdB8043c54 } from '../../../interfaces/working/md-b8043c54';
import { MdB9f50faa } from '../../../interfaces/working/md-b9f50faa';
import { SgA6ac2e09 } from '../../../services/backend/java/spring/sg-a6ac2e09/sg-a6ac2e09';
import { SgB2c17bdf } from '../../../services/backend/java/spring/sg-b2c17bdf/sg-b2c17bdf';
import { SgB4c4c7b1 } from '../../../services/backend/java/spring/sg-b4c4c7b1/sg-b4c4c7b1';
import { SgB8043c54 } from '../../../services/backend/java/spring/sg-b8043c54/sg-b8043c54';
import { DeviceRating, SgB9f50faa } from '../../../services/backend/java/spring/sg-b9f50faa/sg-b9f50faa';
import { SgB2412519 } from '../../../services/backend/java/spring/sg-b2412519/sg-b2412519';
import { SgC98391c6 } from '../../../services/backend/java/spring/sg-c98391c6/sg-c98391c6';
import { SgD0112a5a } from '../../../services/backend/java/spring/sg-d0112a5a/sg-d0112a5a';
import { SgD148f4b4 } from '../../../services/backend/java/spring/sg-d148f4b4/sg-d148f4b4';
import { AuthSession } from '../../../services/core/auth-session/auth-session';

interface ProductImage {
  id: number;
  source: string;
}

interface ProductRecommendation {
  id: number;
  image: string;
  name: string;
  price: number;
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

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-pt-product',
  styleUrl: './pt-product.css',
  templateUrl: './pt-product.html',
})
export class PtProduct implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly deviceService = inject(SgB8043c54);
  private readonly deviceImageService = inject(SgD148f4b4);
  private readonly brandDeviceService = inject(SgB4c4c7b1);
  private readonly brandProcessorService = inject(SgC98391c6);
  private readonly graphicCardService = inject(SgA6ac2e09);
  private readonly operatingSystemService = inject(SgD0112a5a);
  private readonly typeProcessorService = inject(SgB2c17bdf);
  private readonly commentService = inject(SgB9f50faa);
  private readonly userService = inject(SgB2412519);
  readonly authSession = inject(AuthSession);

  readonly activeImage = signal('');
  readonly commentAuthorId = signal<number | null>(null);
  readonly commentAuthorLoading = signal(false);
  readonly commentFormOpen = signal(false);
  readonly commentSubmitting = signal(false);
  readonly commentsLoading = signal(false);
  readonly commentsModalOpen = signal(false);
  readonly deviceRating = signal<DeviceRating>(EMPTY_DEVICE_RATING);
  readonly device = signal<ProductDetail | null>(null);
  readonly images = signal<ProductImage[]>([]);
  readonly loading = signal(true);
  readonly quantity = signal(1);
  readonly relatedProducts = signal<ProductRecommendation[]>([]);
  readonly showImageModal = signal(false);
  readonly productComments = signal<ProductComment[]>([]);
  readonly ratingLevels = [5, 4, 3, 2, 1];
  readonly ratingStars = [1, 2, 3, 4, 5];
  readonly commentForm = this.formBuilder.nonNullable.group({
    fdContent: ['', [Validators.required, Validators.maxLength(2_000)]],
    fdRating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
  });
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
    this.document.body.classList.remove('comments-modal-open');
  }

  openComments(): void {
    const product = this.device();
    if (!product?.idRegister) {
      return;
    }
    this.commentFormOpen.set(false);
    this.commentsModalOpen.set(true);
    this.document.body.classList.add('comments-modal-open');
    this.loadComments(product.idRegister);
  }

  closeComments(): void {
    this.commentsModalOpen.set(false);
    this.commentFormOpen.set(false);
    this.document.body.classList.remove('comments-modal-open');
  }

  openCommentForm(): void {
    if (!this.authSession.isAuthenticated() || this.commentAuthorLoading()) {
      return;
    }

    const userName = this.authSession.getUserName()?.trim().toLocaleLowerCase();
    if (!userName) {
      return;
    }

    this.commentAuthorLoading.set(true);
    this.userService.getAll().pipe(
      catchError(() => of([])),
      finalize(() => this.commentAuthorLoading.set(false)),
    ).subscribe((users) => {
      const user = users.find((entry) => entry.fdLogin?.trim().toLocaleLowerCase() === userName);
      if (!user?.idRegister) {
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
    const deviceId = this.device()?.idRegister;
    const userId = this.commentAuthorId();
    if (!deviceId || !userId || this.commentSubmitting() || this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const now = new Date();
    this.commentSubmitting.set(true);
    this.commentService.create({
      ...this.commentForm.getRawValue(),
      deviceId,
      fdDate: now.toISOString().slice(0, 10),
      fdHour: now.toTimeString().slice(0, 8),
      userId,
    }).pipe(finalize(() => this.commentSubmitting.set(false))).subscribe({
      next: () => {
        this.cancelCommentForm();
        this.loadComments(deviceId);
      },
    });
  }

  setQuantity(value: string, stock: number): void {
    const parsedValue = Number(value);
    const maximum = Math.max(1, stock);
    this.quantity.set(Number.isFinite(parsedValue) ? Math.min(maximum, Math.max(1, Math.trunc(parsedValue))) : 1);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  }

  formatCommentDate(comment: MdB9f50faa): string {
    const parsedDate = new Date(`${comment.fdDate}T${comment.fdHour || '00:00:00'}`);
    return Number.isNaN(parsedDate.valueOf())
      ? [comment.fdDate, comment.fdHour].filter(Boolean).join(' ')
      : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(parsedDate);
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
          .map((comment) => ({ ...comment, userName: usersById.get(comment.userId) ?? `Usuario #${comment.userId}` })),
      );
      this.deviceRating.set(rating);
      this.commentsLoading.set(false);
    });
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    forkJoin({
      device: this.deviceService.getById(id).pipe(catchError(() => of(null))),
      devices: this.deviceService.getAll().pipe(catchError(() => of([]))),
      deviceImages: this.deviceImageService.getAll().pipe(catchError(() => of([]))),
      brands: this.brandDeviceService.getAll().pipe(catchError(() => of([]))),
      brandProcessors: this.brandProcessorService.getAll().pipe(catchError(() => of([]))),
      graphics: this.graphicCardService.getAll().pipe(catchError(() => of([]))),
      systems: this.operatingSystemService.getAll().pipe(catchError(() => of([]))),
      processors: this.typeProcessorService.getAll().pipe(catchError(() => of([]))),
    }).subscribe(({ device, devices, deviceImages, brands, brandProcessors, graphics, systems, processors }) => {
      if (!device) {
        this.device.set(null);
        this.images.set([]);
        this.relatedProducts.set([]);
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
      this.relatedProducts.set(
        devices
          .filter((entry) => entry.idRegister !== id && typeof entry.idRegister === 'number')
          .slice(0, 20)
          .map((entry) => ({
            id: entry.idRegister!,
            image: this.toImageSource(entry.fdImage),
            name: entry.fdName,
            price: Number(entry.fdPrice) || 0,
          })),
      );
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
