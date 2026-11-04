export function formatarDataEncontro(valor) {
  const data = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor || ''));
  if (!data) return '';

  return `${data[3]}/${data[2]}/${data[1]}`;
}
