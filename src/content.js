// Textos y especificaciones de TEMPO ORIGEN. Fuente única: HTML, SEO y datos estructurados leen de aquí.
// Marca, producto, especificaciones y precio son ficticios y pertenecen a este concepto.

export const BRAND = {
  name: 'TEMPO',
  product: 'Origen',
  claim: ['El tiempo no se mide.', 'Se construye.'],
  description:
    'TEMPO Origen: reloj mecánico automático de 39 mm en titanio grado 5, calibre T-01 con micro-rotor, 72 horas de reserva de marcha y fondo de zafiro. Edición limitada a 250 unidades numeradas.',
  price: 8900,
  priceLabel: '8.900 €',
  currency: 'EUR',
  units: 250,
  year: 2026,
};

export const NAV = [
  { id: 'origen', label: 'Origen' },
  { id: 'movimiento', label: 'El movimiento' },
  { id: 'artesania', label: 'Artesanía' },
  { id: 'especificaciones', label: 'Especificaciones' },
  { id: 'reservar', label: 'Reservar' },
];

export const HERO = {
  ctaPrimary: { label: 'Descubrir Origen', href: '#materiales' },
  ctaSecondary: { label: 'Ver el movimiento', href: '#movimiento' },
  views: [
    { n: '01', title: 'Caja', text: '39 mm de titanio grado 5, microgranallado y pulido a mano.' },
    { n: '02', title: 'Perfil', text: 'Corona estriada. Cristal de zafiro con tratamiento antirreflejos.' },
    { n: '03', title: 'Fondo', text: 'Zafiro transparente. Nada que ocultar.' },
    { n: '04', title: 'Calibre T-01', text: 'Automático, con micro-rotor y 72 horas de reserva.' },
  ],
};

export const MATERIALS = {
  title: 'Materiales que no piden atención.',
  subtitle: 'Se ganan la atención con el tiempo.',
  items: [
    { key: 'leather', title: 'Cuero artesanal', text: 'Negro por fuera. Color coñac por dentro.' },
    { key: 'titanium', title: 'Titanio grado 5', text: 'Microgranallado: una superficie mate que absorbe la luz en lugar de devolverla.' },
    { key: 'polish', title: 'Cepillado y pulido', text: 'Dos acabados en la misma pieza. La luz decide cuál ves.' },
    { key: 'sapphire', title: 'Zafiro antirreflejos', text: 'El cristal desaparece. La esfera queda.' },
    { key: 'dial', title: 'Esfera', text: 'Negro profundo, ligeramente texturizado. Índices aplicados y pulidos.' },
  ],
};

export const MACRO = {
  eyebrow: 'Detalle',
  title: 'A esta distancia, nada se esconde.',
  plates: [
    {
      key: 'hands',
      title: 'Aguja e índice',
      text: 'Metal cepillado con aristas pulidas sobre negro texturizado.',
      alt: 'Macro de la aguja de minutos del Tempo Origen cruzando un índice aplicado y pulido sobre la esfera negra texturizada.',
    },
    {
      key: 'crown',
      title: 'Corona',
      text: 'Estriada para el tacto. Pulida para la luz.',
      alt: 'Macro de la corona estriada de titanio y el tubo pulido junto al flanco microgranallado de la caja.',
    },
    {
      key: 'surface',
      title: 'Superficie',
      text: 'Donde termina el pulido empieza el microgranallado.',
      alt: 'Macro de la frontera entre el bisel pulido a mano y el flanco microgranallado de la caja de titanio.',
    },
  ],
};

export const DISASSEMBLY = {
  eyebrow: 'El movimiento',
  title: 'Cada segundo empieza aquí.',
  steps: [
    { key: 'dial', title: 'Esfera', text: 'Negro profundo. Sostiene los índices aplicados.' },
    { key: 'hands', title: 'Agujas', text: 'Horas, minutos y segundos sobre un mismo eje.' },
    { key: 'plate', title: 'Platina', text: 'La base sobre la que se construye todo.' },
    { key: 'train', title: 'Engranajes', text: 'Transmiten la energía, diente a diente.' },
    { key: 'rotor', title: 'Micro-rotor', text: 'Convierte el gesto de la muñeca en energía.' },
    { key: 'balance', title: 'Volante', text: 'Oscila seis veces por segundo.' },
    { key: 'escape', title: 'Escape', text: 'Libera la energía en impulsos exactos.' },
  ],
  outro: 'Calibre T-01 · desmontado',
};

export const CALIBRE = {
  eyebrow: 'Calibre T-01',
  title: 'Una máquina que no descansa.',
  intro: 'Automático, con micro-rotor. Visible a través del fondo de zafiro.',
  chapters: [
    {
      n: '01',
      key: 'energy',
      title: 'Energía',
      text: 'El micro-rotor gira con cada movimiento de la muñeca y tensa el muelle real. Hasta 72 horas de energía almacenada.',
      alt: 'Micro-rotor dorado del calibre T-01 con sus tornillos azulados.',
    },
    {
      n: '02',
      key: 'transmission',
      title: 'Transmisión',
      text: 'El tren de engranajes reparte esa energía, rueda a rueda, desde el barrilete hasta el escape.',
      alt: 'Tren de engranajes dorados del calibre T-01 bajo los puentes con Côtes de Genève.',
    },
    {
      n: '03',
      key: 'regulation',
      title: 'Regulación',
      text: 'El volante oscila a 21.600 alternancias por hora. Seis latidos por segundo, siempre iguales.',
      alt: 'Volante del calibre T-01 con su espiral azulada.',
    },
    {
      n: '04',
      key: 'precision',
      title: 'Precisión',
      text: 'El escape libera la energía en impulsos exactos. Así se construye cada segundo.',
      alt: 'Rueda de escape y áncora con paletas de rubí del calibre T-01.',
    },
  ],
};

export const FIGURES = {
  eyebrow: 'Precisión',
  title: 'Cuatro cifras de un instrumento.',
  items: [
    { key: 'reserve', value: '72', unit: 'H', label: 'de reserva de marcha' },
    { key: 'beat', value: '21.600', unit: '', label: 'alternancias por hora' },
    { key: 'units', value: '250', unit: '', label: 'unidades numeradas' },
    { key: 'diameter', value: '39', unit: 'MM', label: 'de diámetro' },
  ],
};

export const CRAFT = {
  eyebrow: 'Artesanía',
  lines: ['Hay cosas que una máquina puede repetir.', 'Y cosas que solo una mano puede perfeccionar.'],
  plates: [
    {
      key: 'anglage',
      title: 'Anglage manual',
      text: 'Cada arista de cada puente, biselada y pulida a mano hasta que devuelve una línea de luz.',
      alt: 'Chaflán pulido a mano en el canto de un puente del calibre T-01.',
    },
    {
      key: 'cotes',
      title: 'Côtes de Genève',
      text: 'Franjas paralelas que atrapan la luz a través del fondo de zafiro.',
      alt: 'Puentes del calibre T-01 decorados con Côtes de Genève y rubíes engastados en chatones dorados.',
    },
    {
      key: 'screws',
      title: 'Tornillos azulados',
      text: 'Acero calentado hasta que cambia de color. Ni un grado más.',
      alt: 'Tornillos de acero azulado sobre un puente del calibre T-01.',
    },
    {
      key: 'finish',
      title: 'Cepillado y pulido',
      text: 'Dos superficies y una frontera trazada a mano.',
      alt: 'Asa de la caja de titanio con flanco microgranallado y chaflán pulido.',
    },
    {
      key: 'assembly',
      title: 'Montaje',
      text: 'Cada calibre se monta, se regula y se comprueba a mano.',
      alt: 'Calibre T-01 completo visto desde el lado de los puentes.',
    },
    {
      key: 'strap',
      title: 'Correa artesanal',
      text: 'Cuero negro, interior color coñac, pespunte tono sobre tono.',
      alt: 'Correa de cuero negro con pespunte y forro interior color coñac.',
    },
  ],
};

export const FINISHED = {
  title: 'Ahora, míralo otra vez.',
  text: 'Exterior, materiales, mecanismo, precisión, mano. Todo está aquí.',
};

export const EDITION = {
  eyebrow: 'Edición limitada',
  title: '250 piezas.',
  text: 'Una de ellas puede medir tu tiempo.',
  note: 'Cada pieza lleva su número grabado en el fondo de la caja.',
  numbers: ['001', '042', '127', '250'],
};

export const SPECS = {
  eyebrow: 'Especificaciones',
  title: 'Ficha técnica',
  groups: [
    {
      title: 'Caja',
      rows: [
        ['Diámetro', '39 mm'],
        ['Material', 'Titanio grado 5 microgranallado, superficies pulidas a mano'],
        ['Cristal', 'Zafiro con tratamiento antirreflejos'],
        ['Fondo', 'Zafiro transparente'],
      ],
    },
    {
      title: 'Esfera',
      rows: [
        ['Esfera', 'Negro profundo, acabado ligeramente texturizado'],
        ['Índices', 'Aplicados y pulidos'],
        ['Agujas', 'Metal cepillado con detalles pulidos'],
      ],
    },
    {
      title: 'Movimiento',
      rows: [
        ['Calibre', 'TEMPO T-01, mecánico automático'],
        ['Arquitectura', 'Micro-rotor, visible parcialmente desde el fondo'],
        ['Frecuencia', '21.600 alternancias por hora (3 Hz)'],
        ['Reserva de marcha', '72 horas'],
        ['Acabados', 'Anglage manual, Côtes de Genève, tornillos azulados, superficies cepilladas y pulidas'],
      ],
    },
    {
      title: 'Correa y serie',
      rows: [
        ['Correa', 'Cuero negro artesanal con interior color coñac'],
        ['Producción', 'Limitada a 250 unidades numeradas'],
        ['Precio', '8.900 €'],
      ],
    },
  ],
};

export const RESERVE = {
  eyebrow: 'TEMPO',
  title: 'Origen',
  units: '250 unidades numeradas.',
  ctaPrimary: 'Reservar Origen',
  ctaSecondary: 'Solicitar información',
  note: 'Te escribiremos para asignarte un número de la serie y acordar la entrega.',
  form: {
    reserve: { title: 'Reserva de Origen', submit: 'Enviar reserva' },
    info: { title: 'Solicitud de información', submit: 'Enviar solicitud' },
    name: 'Nombre',
    email: 'Correo electrónico',
    message: 'Mensaje (opcional)',
    consent: 'Acepto que TEMPO use estos datos solo para responder a esta solicitud.',
    done: 'Gracias. Hemos recibido tu solicitud.',
    doneNote: 'Esto es un concepto: ningún dato sale de tu navegador.',
    close: 'Cerrar',
  },
};

export const FINALE = {
  data: ['39 MM', '72 H', '21.600 A/H', '250 UNIDADES'],
  secondary: ['Calibre mecánico automático T-01', 'Titanio grado 5 · Zafiro · Cuero artesanal'],
  cta: 'Reservar Origen',
};

export const FOOTER = {
  note: 'TEMPO es una marca ficticia creada para este concepto. Producto, especificaciones y precio son ilustrativos.',
};
