/** "98765 43210", "+91 98765-43210", "09876543210" -> "9876543210". null if it is not an Indian mobile. */
export function normalizeIndianMobile(input: string): string | null {
  let d = input.replace(/[\s\-().]/g, '');
  if (d.startsWith('+91')) d = d.slice(3);
  else if (d.startsWith('91') && d.length === 12) d = d.slice(2);
  else if (d.startsWith('0') && d.length === 11) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

/** "+919876543210" -> "+91 98765 43210" (display only). Anything else comes back unchanged. */
export function formatPhone(e164: string | undefined): string {
  const m = /^\+91([6-9]\d{4})(\d{5})$/.exec(e164 ?? '');
  return m ? `+91 ${m[1]} ${m[2]}` : (e164 ?? '');
}
