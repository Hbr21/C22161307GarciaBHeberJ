import { createResourceApi } from '@/api/client'

const rolesApi = createResourceApi('roles')
const usersApi = createResourceApi('usuarios')
const employeesApi = createResourceApi('employees')

const statusColumn = {
  key: 'is_active',
  label: 'Estado',
  value: (row) => (row.is_active ? 'Activo' : 'Inactivo'),
  isStatus: true,
}

const statusField = {
  key: 'is_active',
  label: 'Estado activo',
  type: 'checkbox',
  editOnly: true,
  description: 'Determina si el registro se encuentra habilitado en la plataforma.',
}

export const RESOURCES = {
  roles: {
    label: 'Roles',
    singular: 'rol',
    plural: 'roles',
    icon: 'shield',
    subtitle: 'Gestión y control de niveles de autorización del sistema',
    api: rolesApi,
    lookups: {},
    displayName: (row) => row.name,
    columns: [
      { key: 'id', label: 'ID', width: '80px' },
      { key: 'name', label: 'Nombre del Rol', strong: true },
      { key: 'description', label: 'Descripción', wrap: true, empty: 'Sin descripción registrada' },
    ],
    fields: [
      {
        key: 'name',
        label: 'Nombre del Rol',
        placeholder: 'Ej. admin, editor, auditor...',
        required: true,
      },
      {
        key: 'description',
        label: 'Descripción del Rol',
        type: 'textarea',
        placeholder: 'Detalla las responsabilidades o permisos que otorga este rol...',
      },
    ],
  },

  usuarios: {
    label: 'Usuarios',
    singular: 'usuario',
    plural: 'usuarios',
    icon: 'users',
    subtitle: 'Administración de cuentas, credenciales y asignación de roles',
    api: usersApi,
    lookups: { roles: rolesApi.list },
    displayName: (row) => row.username,
    columns: [
      { key: 'id', label: 'ID', width: '80px' },
      { key: 'username', label: 'Usuario', strong: true, isUser: true },
      { key: 'email', label: 'Correo Electrónico', wrap: true },
      {
        key: 'role_id',
        label: 'Rol Asignado',
        isRole: true,
        value: (row, { roles }) => roles.find((role) => role.id === row.role_id)?.name || 'Sin Rol',
      },
      statusColumn,
    ],
    fields: [
      {
        key: 'username',
        label: 'Nombre de usuario',
        placeholder: 'Ej. heber_garcia',
        required: true,
      },
      {
        key: 'email',
        label: 'Correo electrónico',
        type: 'email',
        placeholder: 'correo@ejemplo.com',
        required: true,
      },
      {
        key: 'password',
        label: 'Contraseña de acceso',
        type: 'password',
        placeholder: '••••••••',
        required: 'create',
        whenEmpty: 'omit',
        editHint: 'Deja este campo vacío si deseas conservar la contraseña actual.',
      },
      {
        key: 'role_id',
        label: 'Rol asignado',
        type: 'select',
        required: true,
        options: ({ roles }) =>
          roles.map((role) => ({
            value: role.id,
            label: `${role.name}${role.description ? ` - ${role.description}` : ''}`,
          })),
        emptyHint: 'No hay roles disponibles. Crea un rol primero en la sección Roles.',
      },
      statusField,
    ],
  },

  empleados: {
    label: 'Empleados',
    singular: 'empleado',
    plural: 'empleados',
    icon: 'briefcase',
    subtitle: 'Directorio de colaboradores, puestos de trabajo y datos de contacto',
    api: employeesApi,
    lookups: { users: usersApi.list },
    displayName: (row) => `${row.first_name} ${row.last_name}`,
    columns: [
      { key: 'id', label: 'ID', width: '80px' },
      {
        key: 'name',
        label: 'Nombre Completo',
        strong: true,
        isEmployee: true,
        value: (row) => `${row.first_name} ${row.last_name}`,
      },
      {
        key: 'user_id',
        label: 'Cuenta de Usuario',
        isUserBadge: true,
        value: (row, { users }) => users.find((user) => user.id === row.user_id)?.username || `ID ${row.user_id}`,
      },
      { key: 'job_title', label: 'Puesto / Cargo', wrap: true, empty: 'Sin cargo asignado' },
      { key: 'phone', label: 'Teléfono', nowrap: true, empty: 'Sin teléfono' },
      { key: 'address', label: 'Dirección', wrap: true, empty: 'Sin dirección' },
      { key: 'hired_at', label: 'Fecha de Ingreso', nowrap: true, isDate: true },
      statusColumn,
    ],
    fields: [
      {
        key: 'user_id',
        label: 'Cuenta de Usuario Vinculada',
        type: 'select',
        required: true,
        options: ({ users }) =>
          users.map((user) => ({
            value: user.id,
            label: `${user.username} (${user.email})`,
          })),
        emptyHint: 'Primero debes crear un usuario en la sección de Usuarios.',
      },
      {
        key: 'first_name',
        label: 'Nombre(s)',
        placeholder: 'Ej. Heber',
        required: true,
      },
      {
        key: 'last_name',
        label: 'Apellido(s)',
        placeholder: 'Ej. García Benítez',
        required: true,
      },
      {
        key: 'job_title',
        label: 'Puesto o Cargo',
        placeholder: 'Ej. Desarrollador Full-Stack, Analista de Datos...',
      },
      {
        key: 'phone',
        label: 'Número de Teléfono',
        type: 'tel',
        placeholder: '+52 961 123 4567',
      },
      {
        key: 'address',
        label: 'Dirección de Domicilio',
        type: 'textarea',
        placeholder: 'Calle, número, colonia, código postal...',
      },
      {
        key: 'hired_at',
        label: 'Fecha de Contratación',
        type: 'date',
        whenEmpty: 'omit',
      },
      statusField,
    ],
  },
}
