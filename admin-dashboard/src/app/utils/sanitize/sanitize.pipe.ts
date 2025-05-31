import { Pipe, PipeTransform } from '@angular/core';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'sanitize',
  standalone: true, 
})
export class SanitizePipe implements PipeTransform {
  transform(value: string): string {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  }
}

