import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
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
  label: string;
  key: string;
  relation?: WgRelation;
  required?: boolean;
  type?: 'date' | 'email' | 'number' | 'password' | 'text' | 'textarea' | 'time';
}

interface WgCrudService {
  create(payload: unknown): Observable<unknown>;
  delete(idRegister: number): Observable<unknown>;
  getAll(): Observable<unknown[]>;
  update(idRegister: number, payload: unknown): Observable<unknown>;
  changePassword?: (payload: { fdPassd: string; idRegister: number }) => Observable<unknown>;
}

type WgRecord = Record<string, unknown> & { idRegister?: number };

interface RelationOption {
  id: number;
  label: string;
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
  @Input() showPasswordAction = false;

  @ViewChild('dataTable') private readonly dataTableElement?: ElementRef<HTMLTableElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
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
  private dataTable?: { destroy: () => void };
  private loadId = 0;
  private tableIsReady = false;
  private selectedId?: number;

  readonly editing = signal(false);
  readonly form = this.formBuilder.group({});
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
  readonly showPasswordModal = signal(false);
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
    this.relationSearch.update((search) => ({ ...search, [field.key]: value }));
    this.form.get(field.key)?.setValue('');
    this.activeRelationField.set(field.key);
  }

  selectRelation(field: WgCrudField, option: RelationOption): void {
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
    this.loadRelationOptions();
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
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
    return !this.editing() || !field.createOnly;
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
        .filter((field) => field.relation && this.isFieldVisible(field))
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
        },
        error: () => {
          this.relationOptions.update((options) => ({ ...options, [relation]: [] }));
        },
      });
    }
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
    });
  }

  private destroyTable(): void {
    this.dataTable?.destroy();
    this.dataTable = undefined;
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
      void Swal.fire({ icon, title });
    }
  }

  private async confirmRemoval(): Promise<boolean> {
    if (!this.canDisplayAlerts()) {
      return false;
    }

    const result = await Swal.fire({
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
