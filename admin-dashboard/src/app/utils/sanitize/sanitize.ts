import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],  // Pas de balises HTML autorisées
    ALLOWED_ATTR: [],  // Pas d'attributs autorisés
  });
}

export function sanitizeFormValue(value: any): any {
    if (typeof value === 'string') {
      const sanitized = sanitizeInput(value).trim();
      return sanitized === '' ? undefined : sanitized;
    } else if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeFormValue(value[key]);
      }
      return sanitized;
    }
    return value;
  }
  
