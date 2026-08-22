import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, concatMap, from, toArray } from 'rxjs';
import Swal from 'sweetalert2';
import { SgA6ac2e09 } from '../../../services/backend/java/spring/sg-a6ac2e09/sg-a6ac2e09';
import { SgB22b6431 } from '../../../services/backend/java/spring/sg-b22b6431/sg-b22b6431';
import { SgB2412519 } from '../../../services/backend/java/spring/sg-b2412519/sg-b2412519';
import { SgB2c17bdf } from '../../../services/backend/java/spring/sg-b2c17bdf/sg-b2c17bdf';
import { SgB4c4c7b1 } from '../../../services/backend/java/spring/sg-b4c4c7b1/sg-b4c4c7b1';
import { SgB8043c54 } from '../../../services/backend/java/spring/sg-b8043c54/sg-b8043c54';
import { SgC0de7562 } from '../../../services/backend/java/spring/sg-c0de7562/sg-c0de7562';
import { SgC98391c6 } from '../../../services/backend/java/spring/sg-c98391c6/sg-c98391c6';
import { SgD0112a5a } from '../../../services/backend/java/spring/sg-d0112a5a/sg-d0112a5a';
import { SgD148f4b4 } from '../../../services/backend/java/spring/sg-d148f4b4/sg-d148f4b4';

export type WgRelation =
  | 'brand-device'
  | 'brand-processor'
  | 'device-data'
  | 'graphic-card'
  | 'image-ext'
  | 'operating-system'
  | 'role-data'
  | 'type-processor'
  | 'user-data';

export interface WgCrudField {
  createOnly?: boolean;
  fullWidth?: boolean;
  hidden?: boolean;
  imageExtensionKey?: string;
  label: string;
  key: string;
  relation?: WgRelation;
  readonly?: boolean;
  required?: boolean;
  rows?: number;
  tableDisplay?: 'detail';
  type?: 'date' | 'email' | 'image' | 'number' | 'password' | 'text' | 'textarea' | 'time';
}

interface WgCrudService {
  create(payload: unknown): Observable<unknown>;
  delete(idRegister: number): Observable<unknown>;
  getAll(): Observable<unknown[]>;
  update(idRegister: number, payload: unknown): Observable<unknown>;
  changePassword?: (payload: { fdPassd: string; idRegister: number }) => Observable<unknown>;
}

interface DataTableInstance {
  destroy: () => void;
  rows: () => {
    invalidate: (source?: 'auto' | 'data' | 'dom') => {
      draw: (resetPaging?: boolean) => void;
    };
  };
}

type WgRecord = Record<string, unknown> & { idRegister?: number };

interface RelationOption {
  id: number;
  label: string;
}

interface AdditionalDeviceImage {
  fdData: string;
  fdOrder: number;
  idRegister?: number;
  imageExtId: number;
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-wg-crud-table',
  styleUrl: './wg-crud-table.css',
  templateUrl: './wg-crud-table.html',
})
export class WgCrudTable implements AfterViewInit, OnDestroy {
  @Input({ required: true }) fields: WgCrudField[] = [];
  @Input({ required: true }) service!: unknown;
  @Input({ required: true }) title = '';
  @Input() supportsAdditionalImages = false;
  @Input() showPasswordAction = false;

  @ViewChild('dataTable') private readonly dataTableElement?: ElementRef<HTMLTableElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly deviceImageService = inject(SgD148f4b4);
  private readonly lookupServices: Record<WgRelation, { getAll: () => Observable<unknown[]> }> = {
    'brand-device': inject(SgB4c4c7b1),
    'brand-processor': inject(SgC98391c6),
    'device-data': inject(SgB8043c54),
    'graphic-card': inject(SgA6ac2e09),
    'image-ext': inject(SgB22b6431),
    'operating-system': inject(SgD0112a5a),
    'role-data': inject(SgC0de7562),
    'type-processor': inject(SgB2c17bdf),
    'user-data': inject(SgB2412519),
  };
  private dataTable?: DataTableInstance;
  private loadId = 0;
  private tableIsReady = false;
  private selectedId?: number;
  private additionalImagesLoadedFor?: number;

  readonly editing = signal(false);
  readonly allowedImageExtensions = signal<string[]>([]);
  readonly additionalDeviceImages = signal<AdditionalDeviceImage[]>([]);
  readonly additionalImagesLoading = signal(false);
  readonly additionalImagesSaving = signal(false);
  readonly form = this.formBuilder.group({});
  readonly imageNames = signal<Record<string, string>>({});
  readonly imagePreviews = signal<Record<string, string>>({});
  readonly passwordForm = this.formBuilder.nonNullable.group({
    confirmPassword: ['', Validators.required],
    password: ['', Validators.required],
  });
  readonly records = signal<WgRecord[]>([]);
  readonly activeRelationField = signal<string | null>(null);
  readonly relationOptions = signal<Partial<Record<WgRelation, RelationOption[]>>>({});
  readonly relationSearch = signal<Record<string, string>>({});
  readonly selectedRecord = signal<WgRecord | null>(null);
  readonly showFormModal = signal(false);
  readonly showDetailModal = signal(false);
  readonly showAdditionalImagesModal = signal(false);
  readonly showImageModal = signal(false);
  readonly showPasswordModal = signal(false);
  readonly detailContent = signal('');
  readonly detailTitle = signal('Detalle');
  readonly selectedImage = signal('');
  readonly tableVisible = signal(false);

  ngAfterViewInit(): void {
    this.tableIsReady = true;
    this.load();
  }

  ngOnDestroy(): void {
    this.destroyTable();
  }

  openCreate(): void {
    this.editing.set(false);
    this.selectedId = undefined;
    this.buildForm();
    this.loadImageExtensions();
    this.loadRelationOptions();
    this.showFormModal.set(true);
  }

  selectRecord(record: WgRecord): void {
    this.selectedRecord.update((selectedRecord) =>
      selectedRecord?.idRegister === record.idRegister ? null : record,
    );
  }

  openSelectedEdit(): void {
    const record = this.selectedRecord();
    if (record) {
      this.openEdit(record);
    }
  }

  removeSelected(): void {
    const record = this.selectedRecord();
    if (record) {
      void this.remove(record);
    }
  }

  openSelectedPasswordModal(): void {
    const record = this.selectedRecord();
    if (record) {
      this.openPasswordModal(record);
    }
  }

  openRelationSelector(field: WgCrudField): void {
    if (field.readonly) {
      return;
    }
    this.activeRelationField.set(field.key);
  }

  closeRelationSelector(field: WgCrudField): void {
    setTimeout(() => {
      if (this.activeRelationField() === field.key) {
        this.activeRelationField.set(null);
      }
    });
  }

  updateRelationSearch(field: WgCrudField, value: string): void {
    if (field.readonly) {
      return;
    }
    this.relationSearch.update((search) => ({ ...search, [field.key]: value }));
    this.form.get(field.key)?.setValue('');
    this.activeRelationField.set(field.key);
  }

  selectRelation(field: WgCrudField, option: RelationOption): void {
    if (field.readonly) {
      return;
    }
    this.form.get(field.key)?.setValue(option.id);
    this.relationSearch.update((search) => ({ ...search, [field.key]: option.label }));
    this.activeRelationField.set(null);
  }

  filteredRelationOptions(field: WgCrudField): RelationOption[] {
    if (!field.relation) {
      return [];
    }

    const search = (this.relationSearch()[field.key] ?? '').trim().toLowerCase();
    return (this.relationOptions()[field.relation] ?? []).filter((option) => option.label.toLowerCase().includes(search));
  }

  openEdit(record: WgRecord): void {
    if (typeof record.idRegister !== 'number') {
      return;
    }

    this.editing.set(true);
    this.selectedId = record.idRegister;
    this.buildForm(record);
    this.loadImageExtensions();
    this.loadRelationOptions();
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  openAdditionalImagesModal(): void {
    const deviceId = this.selectedRecord()?.idRegister;
    if (!this.supportsAdditionalImages || typeof deviceId !== 'number') {
      return;
    }

    this.showAdditionalImagesModal.set(true);
    this.loadImageExtensions();
    this.loadAdditionalDeviceImages(deviceId);
  }

  closeAdditionalImagesModal(): void {
    this.showAdditionalImagesModal.set(false);
  }

  onAdditionalImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length) {
      void this.addAdditionalImageFiles(files);
    }
    input.value = '';
  }

  onAdditionalImagesDrop(event: DragEvent): void {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) {
      void this.addAdditionalImageFiles(files);
    }
  }

  moveAdditionalImage(index: number, offset: -1 | 1): void {
    const targetIndex = index + offset;
    const images = [...this.additionalDeviceImages()];
    if (targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const first = images[index];
    const second = images[targetIndex];
    if (typeof first.idRegister !== 'number' || typeof second.idRegister !== 'number') {
      return;
    }

    [images[index], images[targetIndex]] = [images[targetIndex], images[index]];
    const reorderedImages = this.withConsecutiveImageOrder(images);
    const deviceId = this.additionalImagesLoadedFor;
    if (deviceId === undefined) {
      return;
    }

    this.additionalDeviceImages.set(reorderedImages);
    this.additionalImagesSaving.set(true);
    from([reorderedImages[index], reorderedImages[targetIndex]])
      .pipe(concatMap((image) => this.deviceImageService.update(image.idRegister!, this.additionalImagePayload(image, deviceId))), toArray())
      .subscribe({
        next: () => this.additionalImagesSaving.set(false),
        error: () => {
          this.additionalImagesSaving.set(false);
          this.showMessage('error', 'No fue posible actualizar el orden de las imágenes.');
          this.loadAdditionalDeviceImages(deviceId);
        },
      });
  }

  removeAdditionalImage(index: number): void {
    const image = this.additionalDeviceImages()[index];
    if (!image || typeof image.idRegister !== 'number') {
      return;
    }

    this.additionalImagesSaving.set(true);
    this.deviceImageService.delete(image.idRegister).subscribe({
      next: () => {
        this.additionalImagesSaving.set(false);
        this.additionalDeviceImages.update((images) =>
          this.withConsecutiveImageOrder(images.filter((_, currentIndex) => currentIndex !== index)),
        );
        this.persistCurrentAdditionalImageOrder();
      },
      error: () => {
        this.additionalImagesSaving.set(false);
        this.showMessage('error', 'No fue posible quitar la imagen.');
      },
    });
  }

  additionalImageExtension(image: AdditionalDeviceImage): string {
    return (this.relationOptions()['image-ext'] ?? []).find((option) => option.id === image.imageExtId)?.label ?? '—';
  }

  additionalImagePreview(image: AdditionalDeviceImage): string {
    const extension = this.additionalImageExtension(image).trim().replace(/^\./, '').toLowerCase();
    const mimeType = this.imageMimeType(extension);
    return `data:${mimeType};base64,${image.fdData}`;
  }

  openDetailModal(record: WgRecord, field: WgCrudField): void {
    this.detailTitle.set(field.label);
    this.detailContent.set(String(record[field.key] ?? 'Sin información disponible.'));
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
  }

  openImageModal(image: string): void {
    this.selectedImage.set(image);
    this.showImageModal.set(true);
  }

  closeImageModal(): void {
    this.showImageModal.set(false);
    this.selectedImage.set('');
  }

  openPasswordModal(record: WgRecord): void {
    if (typeof record.idRegister !== 'number') {
      return;
    }

    this.selectedId = record.idRegister;
    this.passwordForm.reset({ confirmPassword: '', password: '' });
    this.showPasswordModal.set(true);
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
  }

  load(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentLoadId = ++this.loadId;
    this.destroyTable();
    this.tableVisible.set(false);
    this.selectedRecord.set(null);
    this.showProcessing('Cargando información...');

    this.crudService.getAll().subscribe({
      next: (records) => {
        if (currentLoadId !== this.loadId) {
          return;
        }

        this.records.set(records as WgRecord[]);
        this.loadRelationOptions();
        this.tableVisible.set(true);
        this.closeAlert();
        void this.initializeDataTable(currentLoadId);
      },
      error: () => {
        if (currentLoadId !== this.loadId) {
          return;
        }

        this.records.set([]);
        this.tableVisible.set(true);
        this.closeAlert();
        this.showMessage('error', 'No fue posible cargar la información');
        void this.initializeDataTable(currentLoadId);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.getPayload();
    const request = this.editing() && this.selectedId !== undefined
      ? this.crudService.update(this.selectedId, payload)
      : this.crudService.create(payload);

    this.showProcessing();
    request.subscribe({
      next: () => {
        this.closeFormModal();
        this.closeAlert();
        this.showMessage('success', 'Registro guardado');
        this.load();
      },
      error: () => {
        this.closeAlert();
        this.showMessage('error', 'No fue posible guardar el registro');
      },
    });
  }

  async remove(record: WgRecord): Promise<void> {
    if (typeof record.idRegister !== 'number') {
      return;
    }

    if (!(await this.confirmRemoval())) {
      return;
    }

    this.showProcessing();
    this.crudService.delete(record.idRegister).subscribe({
      next: () => {
        this.closeAlert();
        this.showMessage('success', 'Registro eliminado');
        this.load();
      },
      error: () => {
        this.closeAlert();
        this.showMessage('error', 'No fue posible eliminar el registro');
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.selectedId === undefined) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.passwordForm.getRawValue();
    if (password !== confirmPassword) {
      this.showMessage('warning', 'Las contraseñas no coinciden');
      return;
    }

    const changePassword = this.crudService.changePassword;
    if (!changePassword) {
      return;
    }

    this.showProcessing();
    changePassword({ fdPassd: password, idRegister: this.selectedId }).subscribe({
      next: () => {
        this.closePasswordModal();
        this.closeAlert();
        this.showMessage('success', 'Contraseña actualizada');
      },
      error: () => {
        this.closeAlert();
        this.showMessage('error', 'No fue posible actualizar la contraseña');
      },
    });
  }

  value(record: WgRecord, field: WgCrudField): string {
    if (field.relation) {
      const relatedId = record[field.key];
      const relatedOption = (this.relationOptions()[field.relation] ?? []).find(
        (option) => option.id === Number(relatedId),
      );
      return relatedOption?.label ?? '—';
    }

    const value = record[field.key];
    return value === undefined || value === null || value === '' ? '—' : String(value);
  }

  isFieldVisible(field: WgCrudField): boolean {
    return !field.hidden && (!this.editing() || !field.createOnly);
  }

  hasMultipleVisibleFields(): boolean {
    return this.fields.filter((field) => this.isFieldVisible(field)).length > 1;
  }

  imageAccept(): string {
    return this.allowedImageExtensions().map((extension) => `.${extension}`).join(',');
  }

  allowedImageExtensionsLabel(): string {
    const extensions = this.allowedImageExtensions();
    return extensions.length ? extensions.join(' | ') : 'Sin extensiones registradas';
  }

  imagePreview(field: WgCrudField): string | undefined {
    return this.imagePreviews()[field.key];
  }

  imageFileName(field: WgCrudField): string | undefined {
    return this.imageNames()[field.key];
  }

  tableImagePreview(record: WgRecord, field: WgCrudField): string | undefined {
    const image = record[field.key];
    return typeof image === 'string' && image ? this.toImagePreview(image) : undefined;
  }

  onImageSelected(field: WgCrudField, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.loadImageFile(field, file);
    }
    input.value = '';
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onImageDrop(field: WgCrudField, event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.loadImageFile(field, file);
    }
  }

  private get crudService(): WgCrudService {
    return this.service as WgCrudService;
  }

  private buildForm(record: WgRecord = {}): void {
    const controls: Record<string, ReturnType<typeof this.formBuilder.control>> = {};

    for (const field of this.fields.filter((item) => !this.editing() || !item.createOnly)) {
      const value = record[field.key] ?? '';
      controls[field.key] = this.formBuilder.control(value, field.required === false ? [] : [Validators.required]);
    }

    this.form.reset();
    for (const key of Object.keys(this.form.controls)) {
      this.form.removeControl(key);
    }
    for (const [key, control] of Object.entries(controls)) {
      this.form.addControl(key, control);
    }

    this.relationSearch.set(
      Object.fromEntries(
        this.fields
          .filter((field) => field.relation && this.isFieldVisible(field))
          .map((field) => [field.key, String(record[field.key] ?? '')]),
      ),
    );

    const previews: Record<string, string> = {};
    const names: Record<string, string> = {};
    for (const field of this.fields.filter((item) => item.type === 'image' && this.isFieldVisible(item))) {
      const image = record[field.key];
      if (typeof image === 'string' && image) {
        previews[field.key] = this.toImagePreview(image);
        names[field.key] = 'Imagen actual';
      }
    }
    this.imagePreviews.set(previews);
    this.imageNames.set(names);
  }

  private getPayload(): Record<string, unknown> {
    const rawValue = this.form.getRawValue() as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    for (const field of this.fields.filter((item) => !this.editing() || !item.createOnly)) {
      const value = rawValue[field.key];
      payload[field.key] = field.type === 'number' && value !== '' ? Number(value) : value;
    }

    return payload;
  }

  private loadRelationOptions(): void {
    const relations = new Set(
      this.fields
        .filter((field) => field.relation)
        .map((field) => field.relation as WgRelation),
    );

    for (const relation of relations) {
      this.lookupServices[relation].getAll().subscribe({
        next: (items) => {
          this.relationOptions.update((options) => ({
            ...options,
            [relation]: this.toRelationOptions(relation, items),
          }));
          this.syncRelationLabels(relation);
          this.refreshDataTableSearchIndex();
        },
        error: () => {
          this.relationOptions.update((options) => ({ ...options, [relation]: [] }));
        },
      });
    }
  }

  private loadImageExtensions(): void {
    if (!this.fields.some((field) => field.type === 'image' && this.isFieldVisible(field))) {
      return;
    }

    this.lookupServices['image-ext'].getAll().subscribe({
      next: (items) => {
        const extensions = items
          .map((item) => String((item as WgRecord)['fdValue'] ?? '').trim().replace(/^\./, '').toLowerCase())
          .filter((extension) => extension.length > 0);
        this.allowedImageExtensions.set([...new Set(extensions)]);
        this.relationOptions.update((options) => ({
          ...options,
          'image-ext': this.toRelationOptions('image-ext', items),
        }));
        this.syncRelationLabels('image-ext');
      },
      error: () => this.allowedImageExtensions.set([]),
    });
  }

  private loadImageFile(field: WgCrudField, file: File): void {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const allowedExtensions = this.allowedImageExtensions();
    if (!file.type.startsWith('image/') || !allowedExtensions.includes(extension)) {
      this.showMessage('warning', `Seleccione una imagen permitida (${this.allowedImageExtensionsLabel()}).`);
      return;
    }

    if (!this.assignImageExtension(field, extension)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const base64 = dataUrl.split(',')[1] ?? '';
      if (!dataUrl || !base64) {
        return;
      }

      this.form.get(field.key)?.setValue(base64);
      this.form.get(field.key)?.markAsDirty();
      this.imagePreviews.update((previews) => ({ ...previews, [field.key]: dataUrl }));
      this.imageNames.update((names) => ({ ...names, [field.key]: file.name }));
    };
    reader.readAsDataURL(file);
  }

  private async addAdditionalImageFiles(files: File[]): Promise<void> {
    const allowedExtensions = this.allowedImageExtensions();
    const candidates = files.filter((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      return allowedExtensions.includes(extension);
    });

    if (!candidates.length) {
      this.showMessage('warning', `Seleccione imágenes permitidas (${this.allowedImageExtensionsLabel()}).`);
      return;
    }

    if (candidates.length !== files.length) {
      this.showMessage('warning', 'Se omitieron archivos con extensiones no permitidas.');
    }

    const options = this.relationOptions()['image-ext'] ?? [];
    const filesWithExtension = candidates
      .map((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
        const option = options.find((item) => item.label.trim().replace(/^\./, '').toLowerCase() === extension);
        return option ? { file, imageExtId: option.id } : null;
      })
      .filter((item): item is { file: File; imageExtId: number } => item !== null);

    if (!filesWithExtension.length) {
      this.showMessage('warning', 'No existe una extensión registrada para las imágenes seleccionadas.');
      return;
    }

    const data = await Promise.all(filesWithExtension.map(async ({ file, imageExtId }) => ({
      fdData: await this.readFileAsBase64(file),
      imageExtId,
    })));

    const deviceId = this.additionalImagesLoadedFor;
    if (deviceId === undefined) {
      this.showMessage('warning', 'Seleccione un dispositivo antes de cargar imágenes adicionales.');
      return;
    }

    const startingOrder = this.additionalDeviceImages().length;
    const imagePayloads = data.map((image, index) => ({
      ...image,
      deviceId,
      fdOrder: startingOrder + index + 1,
    }));

    this.additionalImagesSaving.set(true);
    from(imagePayloads)
      .pipe(concatMap((payload) => this.deviceImageService.create(payload)), toArray())
      .subscribe({
        next: (savedImages) => {
          this.additionalImagesSaving.set(false);
          this.additionalDeviceImages.update((images) => this.withConsecutiveImageOrder([
            ...images,
            ...savedImages.map((image) => ({
              fdData: image.fdData,
              fdOrder: image.fdOrder,
              idRegister: image.idRegister,
              imageExtId: image.imageExtId,
            })),
          ]));
        },
        error: () => {
          this.additionalImagesSaving.set(false);
          this.showMessage('error', 'No fue posible guardar las imágenes adicionales.');
          this.loadAdditionalDeviceImages(deviceId);
        },
      });
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        const base64 = dataUrl.split(',')[1] ?? '';
        base64 ? resolve(base64) : reject(new Error('No se pudo leer la imagen.'));
      };
      reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer la imagen.'));
      reader.readAsDataURL(file);
    });
  }

  private loadAdditionalDeviceImages(deviceId: number): void {
    this.additionalImagesLoading.set(true);
    this.deviceImageService.getAll().subscribe({
      next: (images) => {
        const relatedImages = images
          .filter((image) => image.deviceId === deviceId)
          .sort((first, second) => first.fdOrder - second.fdOrder)
          .map((image) => ({
            fdData: image.fdData,
            fdOrder: image.fdOrder,
            idRegister: image.idRegister,
            imageExtId: image.imageExtId,
          }));
        this.additionalDeviceImages.set(this.withConsecutiveImageOrder(relatedImages));
        this.additionalImagesLoadedFor = deviceId;
        this.additionalImagesLoading.set(false);
      },
      error: () => {
        this.additionalDeviceImages.set([]);
        this.additionalImagesLoadedFor = deviceId;
        this.additionalImagesLoading.set(false);
        this.showMessage('error', 'No fue posible cargar las imágenes adicionales.');
      },
    });
  }

  private persistCurrentAdditionalImageOrder(): void {
    const deviceId = this.additionalImagesLoadedFor;
    const images = this.additionalDeviceImages();
    if (deviceId === undefined || !images.length) {
      return;
    }

    this.additionalImagesSaving.set(true);
    from(images)
      .pipe(concatMap((image) => this.deviceImageService.update(image.idRegister!, this.additionalImagePayload(image, deviceId))), toArray())
      .subscribe({
        next: () => this.additionalImagesSaving.set(false),
        error: () => {
          this.additionalImagesSaving.set(false);
          this.showMessage('error', 'No fue posible actualizar el orden de las imágenes.');
          this.loadAdditionalDeviceImages(deviceId);
        },
      });
  }

  private additionalImagePayload(image: AdditionalDeviceImage, deviceId: number): {
    deviceId: number;
    fdData: string;
    fdOrder: number;
    imageExtId: number;
  } {
    return {
      deviceId,
      fdData: image.fdData,
      fdOrder: image.fdOrder,
      imageExtId: image.imageExtId,
    };
  }

  private withConsecutiveImageOrder(images: AdditionalDeviceImage[]): AdditionalDeviceImage[] {
    return images.map((image, index) => ({ ...image, fdOrder: index + 1 }));
  }

  private imageMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      avif: 'image/avif',
      gif: 'image/gif',
      ico: 'image/x-icon',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      svg: 'image/svg+xml',
      webp: 'image/webp',
    };
    return mimeTypes[extension] ?? 'image/png';
  }

  private toImagePreview(image: string): string {
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

  private assignImageExtension(field: WgCrudField, extension: string): boolean {
    if (!field.imageExtensionKey) {
      return true;
    }

    const option = (this.relationOptions()['image-ext'] ?? []).find(
      (item) => item.label.trim().replace(/^\./, '').toLowerCase() === extension,
    );
    if (!option) {
      this.showMessage('warning', 'No existe una extensión registrada para el archivo seleccionado.');
      return false;
    }

    this.form.get(field.imageExtensionKey)?.setValue(option.id);
    this.relationSearch.update((search) => ({ ...search, [field.imageExtensionKey!]: option.label }));
    return true;
  }

  private toRelationOptions(relation: WgRelation, items: unknown[]): RelationOption[] {
    return items
      .map((item) => {
        const record = item as WgRecord;
        const id = record.idRegister;
        if (typeof id !== 'number') {
          return null;
        }

        return { id, label: this.relationLabel(relation, record) };
      })
      .filter((option): option is RelationOption => option !== null);
  }

  private relationLabel(relation: WgRelation, record: WgRecord): string {
    if (relation === 'user-data') {
      return String(record['fdLogin'] ?? record['fdEmail'] ?? record.idRegister);
    }

    return String(record['name'] ?? record['fdName'] ?? record['fdValue'] ?? record['fdData'] ?? record.idRegister);
  }

  private syncRelationLabels(relation: WgRelation): void {
    const options = this.relationOptions()[relation] ?? [];
    this.relationSearch.update((search) => {
      const updatedSearch = { ...search };
      for (const field of this.fields.filter((item) => item.relation === relation && this.isFieldVisible(item))) {
        const selectedId = this.form.get(field.key)?.value;
        const option = options.find((item) => item.id === Number(selectedId));
        if (option) {
          updatedSearch[field.key] = option.label;
        }
      }
      return updatedSearch;
    });
  }

  private async initializeDataTable(loadId: number): Promise<void> {
    if (!this.tableIsReady || !this.canUseDataTable()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve));
    if (loadId !== this.loadId || !this.dataTableElement) {
      return;
    }

    const { default: DataTable } = await import('datatables.net-bs5');
    if (loadId !== this.loadId || !this.dataTableElement) {
      return;
    }

    this.dataTable = new DataTable(this.dataTableElement.nativeElement, {
      language: {
        emptyTable: 'No hay registros disponibles',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        infoEmpty: 'Mostrando 0 a 0 de 0 registros',
        lengthMenu: 'Mostrar _MENU_ registros',
        search: 'Buscar:',
        zeroRecords: 'No se encontraron coincidencias',
      },
      pageLength: 10,
      scrollCollapse: true,
      scrollX: true,
    });
  }

  private destroyTable(): void {
    this.dataTable?.destroy();
    this.dataTable = undefined;
  }

  /** Relee el texto renderizado por Angular (en particular los nombres de relaciones)
   * para que el buscador de DataTables no conserve los identificadores iniciales. */
  private refreshDataTableSearchIndex(): void {
    setTimeout(() => {
      this.dataTable?.rows().invalidate('dom').draw(false);
    });
  }

  private showProcessing(text?: string): void {
    if (!this.canDisplayAlerts()) {
      return;
    }

    void Swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      text,
      title: 'Procesando',
    });
  }

  private closeAlert(): void {
    if (this.canDisplayAlerts()) {
      Swal.close();
    }
  }

  private showMessage(icon: 'error' | 'success' | 'warning', title: string): void {
    if (this.canDisplayAlerts()) {
      void Swal.fire({
        allowEscapeKey: false,
        allowOutsideClick: false,
        confirmButtonText: 'Aceptar',
        icon,
        title,
      });
    }
  }

  private async confirmRemoval(): Promise<boolean> {
    if (!this.canDisplayAlerts()) {
      return false;
    }

    const result = await Swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Sí, quitar',
      icon: 'warning',
      showCancelButton: true,
      text: 'Esta acción no se puede deshacer.',
      title: '¿Desea eliminar el registro?',
    });
    return result.isConfirmed;
  }

  private canDisplayAlerts(): boolean {
    return isPlatformBrowser(this.platformId) && typeof window.matchMedia === 'function';
  }

  private canUseDataTable(): boolean {
    return isPlatformBrowser(this.platformId) && typeof window.matchMedia === 'function';
  }
}
