import { WgCrudField } from './wg-crud-table';

export interface WgCrudConfig {
  fields: WgCrudField[];
  showPasswordAction?: boolean;
  title: string;
}

export const graphicCardConfig: WgCrudConfig = {
  title: 'Tarjetas gráficas',
  fields: [{ key: 'fdName', label: 'Nombre' }],
};

export const imageExtConfig: WgCrudConfig = {
  title: 'Extensiones de imagen',
  fields: [{ key: 'fdValue', label: 'Extensión' }],
};

export const userDataConfig: WgCrudConfig = {
  title: 'Usuarios',
  showPasswordAction: true,
  fields: [
    { key: 'fdEmail', label: 'Correo electrónico', type: 'email' },
    { key: 'fdLogin', label: 'Usuario' },
    { key: 'fdPassd', label: 'Contraseña', type: 'password', createOnly: true },
    { key: 'fdName', label: 'Nombres' },
    { key: 'fdSrnm', label: 'Apellidos' },
    { key: 'roleDataId', label: 'Id. rol', type: 'number' },
  ],
};

export const typeProcessorConfig: WgCrudConfig = {
  title: 'Tipos de procesador',
  fields: [
    { key: 'fdName', label: 'Nombre' },
    { key: 'brandProcessorId', label: 'Id. marca de procesador', type: 'number' },
  ],
};

export const brandDeviceConfig: WgCrudConfig = {
  title: 'Marcas de dispositivos',
  fields: [{ key: 'name', label: 'Nombre' }],
};

export const deviceDataConfig: WgCrudConfig = {
  title: 'Dispositivos',
  fields: [
    { key: 'fdName', label: 'Nombre' },
    { key: 'fdDetail', label: 'Detalle', type: 'textarea' },
    { key: 'fdPrice', label: 'Precio', type: 'number' },
    { key: 'fdStock', label: 'Stock', type: 'number' },
    { key: 'fdRam', label: 'Memoria RAM' },
    { key: 'fdStorage', label: 'Almacenamiento' },
    { key: 'fdScreenSize', label: 'Tamaño de pantalla' },
    { key: 'fdRelease', label: 'Fecha de lanzamiento', type: 'date' },
    { key: 'fdImage', label: 'Imagen' },
    { key: 'brandDeviceId', label: 'Id. marca de dispositivo', type: 'number' },
    { key: 'graphicCardId', label: 'Id. tarjeta gráfica', type: 'number' },
    { key: 'operatingSystemId', label: 'Id. sistema operativo', type: 'number' },
    { key: 'typeProcessorId', label: 'Id. tipo de procesador', type: 'number' },
  ],
};

export const commentConfig: WgCrudConfig = {
  title: 'Comentarios',
  fields: [
    { key: 'fdContent', label: 'Contenido', type: 'textarea' },
    { key: 'fdRating', label: 'Calificación', type: 'number' },
    { key: 'fdDate', label: 'Fecha', type: 'date' },
    { key: 'fdHour', label: 'Hora', type: 'time' },
    { key: 'deviceId', label: 'Id. dispositivo', type: 'number' },
    { key: 'userId', label: 'Id. usuario', type: 'number' },
  ],
};

export const roleDataConfig: WgCrudConfig = {
  title: 'Roles',
  fields: [{ key: 'fdName', label: 'Nombre' }],
};

export const brandProcessorConfig: WgCrudConfig = {
  title: 'Marcas de procesadores',
  fields: [{ key: 'fdName', label: 'Nombre' }],
};

export const operatingSystemConfig: WgCrudConfig = {
  title: 'Sistemas operativos',
  fields: [{ key: 'fdName', label: 'Nombre' }],
};

export const deviceImageConfig: WgCrudConfig = {
  title: 'Imágenes de dispositivos',
  fields: [
    { key: 'fdData', label: 'Datos de imagen', type: 'textarea' },
    { key: 'deviceId', label: 'Id. dispositivo', type: 'number' },
    { key: 'imageExtId', label: 'Id. extensión', type: 'number' },
  ],
};
