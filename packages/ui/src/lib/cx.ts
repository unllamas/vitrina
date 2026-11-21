/** Junta clases. No resuelve conflictos de Tailwind: no pases dos utilidades del mismo grupo. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
