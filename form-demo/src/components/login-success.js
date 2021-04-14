import { from, fromEvent, merge } from 'rxjs';

import { renderView } from '../util';
import api from '../fake-api';

export class LoginSuccessComponent {
  constructor(root$) {
    this.root$ = root$;
  }

  init() {
    renderView(this.root$, 'login-success');
  }

  destroy() {

  }
}