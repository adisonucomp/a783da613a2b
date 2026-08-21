import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

export interface WgCrudField {
  createOnly?: boolean;
  label: string;
  key: string;
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

  openEdit(record: WgRecord): void {
    if (typeof record.idRegister !== 'number') {
      return;
    }

    this.editing.set(true);
    this.selectedId = record.idRegister;
    this.buildForm(record);
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
