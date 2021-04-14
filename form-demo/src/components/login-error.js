import { from, fromEvent, merge } from 'rxjs';

import { renderView } from '../util';

export class LoginErrorComponent {
  constructor(formMachine, root$) {
    this.formMachine = formMachine;
    this.root$ = root$;
    this.subscriptions = [];
  }

  init() {
    renderView(this.root$, 'login-error');
    const tryAgainButton$ = this.root$.querySelector('#try-again');
    const subscription = fromEvent(tryAgainButton$, 'click').subscribe(() => {
      this.formMachine.send('TRY_AGAIN');
    })
    this.subscriptions.push(subscription);
  }

  destroy() {
    while(this.subscriptions.length > 0) {
      this.subscriptions.pop().unsubscribe();
    }
  }
}