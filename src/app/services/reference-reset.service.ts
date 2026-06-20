import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReferenceResetService {
  readonly reset$ = new Subject<void>();
}
