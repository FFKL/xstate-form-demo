import { fromEvent } from 'rxjs';

export class LoginErrorComponent {
  constructor(formMachine, root$) {
    this.formMachine = formMachine;
    this.root$ = root$;
    this.subscriptions = [];
    this.name = 'login-error';
  }

  init() {
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