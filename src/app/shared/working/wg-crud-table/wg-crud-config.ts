import { WgCrudField } from './wg-crud-table';

export interface WgCrudConfig {
  fields: WgCrudField[];
  showPasswordAction?: boolean;
  supportsAdditionalImages?: boolean;
  title: string;
}

export const graphicCardConfig: WgCrudConfig = {
  title: 'Tarjetas Gráficas',
  fields: [
    { key: 'fdName', label: 'Nombre', fullWidth: true },
    { key: 'fdImage', label: 'Imagen', type: 'image', fullWidth: true },
  ],
};

export const imageExtConfig: WgCrudConfig = {
  title: 'Extensiones de Imágenes',
  fields: [{ key: 'fdValue', label: 'Extensión' }],
};

export const userDataConfig: WgCrudConfig = {
  title: 'Usuarios',
  showPasswordAction: true,
  fields: [
    { key: 'fdEmail', label: 'Correo Electrónico', type: 'email' },
    { key: 'fdLogin', label: 'Usuario' },
    { key: 'fdPassd', label: 'Contraseña', type: 'password', createOnly: true },
    { key: 'fdName', label: 'Nombres' },
    { key: 'fdSrnm', label: 'Apellidos' },
    { key: 'roleDataId', label: 'Rol', relation: 'role-data' },
  ],
};

export const typeProcessorConfig: WgCrudConfig = {
  title: 'Tipos de Procesador',
  fields: [
    { key: 'fdName', label: 'Nombre' },
    { key: 'brandProcessorId', label: 'Marca', relation: 'brand-processor' },
  ],
};

export const brandDeviceConfig: WgCrudConfig = {
  title: 'Marcas de Dispositivos',
  fields: [
    { key: 'name', label: 'Nombre', fullWidth: true },
    { key: 'fdImage', label: 'Imagen', type: 'image', fullWidth: true },
  ],
};

export const deviceDataConfig: WgCrudConfig = {
  title: 'Dispositivos',
  supportsAdditionalImages: true,
  fields: [
    { key: 'fdCode', label: 'Código' },
    { key: 'fdName', label: 'Nombre' },
    { key: 'fdPrice', label: 'Precio', type: 'number', colMd: 4 },
    { key: 'fdStock', label: 'Stock', type: 'number', colMd: 4 },
    { key: 'fdDto', label: 'Descuento', type: 'number', min: 0, max: 100, step: 1, colMd: 4 },
    { key: 'fdRam', label: 'Memoria RAM', type: 'number', min: 0, step: 1 },
    { key: 'fdStorage', label: 'Almacenamiento' },
    { key: 'fdScreenSize', label: 'Tamaño de Pantalla', type: 'number', min: 0, step: 0.01 },
    { key: 'fdRelease', label: 'Fecha de Lanzamiento', type: 'date' },
    { key: 'brandDeviceId', label: 'Marca de Dispositivo', relation: 'brand-device' },
    { key: 'graphicCardId', label: 'Tarjeta Gráfica', relation: 'graphic-card' },
    { key: 'operatingSystemId', label: 'Sistema Operativo', relation: 'operating-system' },
    { key: 'typeProcessorId', label: 'Tipo de Procesador', relation: 'type-processor' },
    { key: 'fdDetail', label: 'Detalle', type: 'textarea', fullWidth: true, required: false, rows: 7, tableDisplay: 'detail' },
    { key: 'fdImage', label: 'Imagen', type: 'image', fullWidth: true },
  ],
};

export const commentConfig: WgCrudConfig = {
  title: 'Comentarios',
  fields: [
    { key: 'fdContent', label: 'Contenido', type: 'textarea' },
    { key: 'fdRating', label: 'Calificación', type: 'number' },
    { key: 'fdDate', label: 'Fecha', type: 'date' },
    { key: 'fdHour', label: 'Hora', type: 'time' },
    { key: 'deviceId', label: 'Dispositivo', relation: 'device-data' },
    { key: 'userId', label: 'Usuario', relation: 'user-data' },
  ],
};

export const roleDataConfig: WgCrudConfig = {
  title: 'Roles',
  fields: [{ key: 'fdName', label: 'Nombre' }],
};

export const brandProcessorConfig: WgCrudConfig = {
  title: 'Marcas de Procesadores',
  fields: [
    { key: 'fdName', label: 'Nombre', fullWidth: true },
    { key: 'fdImage', label: 'Imagen', type: 'image', fullWidth: true },
  ],
};

export const operatingSystemConfig: WgCrudConfig = {
  title: 'Sistemas Operativos',
  fields: [
    { key: 'fdName', label: 'Nombre', fullWidth: true },
    { key: 'fdImage', label: 'Imagen', type: 'image', fullWidth: true },
  ],
};

export const deviceImageConfig: WgCrudConfig = {
  title: 'Imágenes de Dispositivos',
  fields: [
    { key: 'deviceId', label: 'Dispositivo', relation: 'device-data' },
    { key: 'fdOrder', label: 'Orden', type: 'number' },
    { key: 'imageExtId', label: 'Extensión', relation: 'image-ext', readonly: true, hidden: true },
    { key: 'fdData', label: 'Imagen', type: 'image', fullWidth: true, imageExtensionKey: 'imageExtId' },
  ],
};
