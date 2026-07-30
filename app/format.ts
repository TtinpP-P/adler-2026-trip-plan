export const formatRub = (value: number) =>
  `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
