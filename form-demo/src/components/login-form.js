import { fromEvent, merge } from 'rxjs';

import api from '../fake-api';

export class LoginFormComponent {
  constructor(formMachine, root$) {
    this.formMachine = formMachine;
    this.root$ = root$;
    this.subscriptions = [];
    this.name = 'login-form';
  }

  init() {
    const email$ = this.root$.querySelector('#email');
    const password$ = this.root$.querySelector('#password');
    const submitButton$ = this.root$.querySelector('#submit');
    const formState$ = document.querySelector('#formState');

    const formSubscription = this.formMachine.subscribe(({ context, value }) => {
      if (typeof value === 'object' && value.hasOwnProperty('draft')) {
        const {
          draft,
          draft: { email, password },
        } = value;
        this.checkInput(email$, email, context.__errorMessages.email);
        this.checkInput(password$, password, context.__errorMessages.password);
        this.checkButton(submitButton$, draft);
      }
      formState$.textContent =
        JSON.stringify(value, undefined, 2) + JSON.stringify(context, undefined, 2);
    });

    const inputsSubscription = merge(
      fromEvent(email$, 'input'),
      fromEvent(email$, 'blur'),
      fromEvent(password$, 'input'),
      fromEvent(password$, 'blur')
    ).subscribe(({ type, target }) => {
      switch(type) {
        case 'blur':
          this.formMachine.send(`LEAVE_${target.id.toUpperCase()}`);
          break;
        case 'input':
          this.formMachine.send(`SET_${target.id.toUpperCase()}`, { [target.id]: target.value });
          break;
      }
    })

    const submitSubscription = fromEvent(submitButton$, 'click').subscribe(() => {
      const { email, password } = this.formMachine._state.context;
      this.formMachine.send('SUBMIT');
      api
        .register({ email, password })
        .then(({ success }) => this.formMachine.send(success ? 'LOAD_SUCCESS' : 'LOAD_ERROR'));
    })

    this.subscriptions.push(formSubscription, inputsSubscription, submitSubscription);
  }

  destroy() {
    while(this.subscriptions.length > 0) {
      this.subscriptions.pop().unsubscribe();
    }
  }

  checkInput(input$, state, message) {
    if (typeof state === 'string' && state === 'valid') {
      input$.classList.add('is-valid');
      input$.classList.remove('is-invalid');
      input$.parentElement.querySelector('.invalid-feedback').textContent = '';
    }
    if (typeof state === 'object' && state.hasOwnProperty('invalid')) {
      input$.classList.add('is-invalid');
      input$.classList.remove('is-valid');
      input$.parentElement.querySelector('.invalid-feedback').textContent = message;
    }
  }

  checkButton(button$, state) {
    const isEnabled = Object.values(state).every((s) => s === 'valid');
    button$.disabled = !isEnabled;
  }
}
