import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { formService, Validator } from 'xstate-form';

import api from './fake-api';

const form = formService({
  controls: {
    email: {
      value: '',
      validators: {
        sync: [
          { name: 'empty', message: 'Empty value', validate: Validator.required() },
          { name: 'incorrectEmail', message: 'Is not an email', validate: Validator.email() }
        ],
        async: [
          { name: 'used', validate: val => api.checkEmailUsage(val) },
          { name: 'bannedDomain', validate: val => api.checkDomainBanStatus(val) }
        ]
      },
    },
    password: {
      value: '',
      validators: {
        sync: [
          { name: 'empty', message: 'Empty value', validate: Validator.required() },
          { name: 'minLength', message: 'Length < 4', validate: Validator.min(4) }
        ]
      },
    },
  },
});
const email$ = document.querySelector('#inputEmail');
const password$ = document.querySelector('#inputPassword');
const submitButton$ = document.querySelector('#submit');
const formState$ = document.querySelector('#formState');

function checkInput(input$, state, message) {
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

function checkButton(button$, state) {
  const isEnabled = Object.values(state).every(s => s === 'valid');
  button$.disabled = !isEnabled;
}

form.onTransition(({ context, value }) => {
  if (typeof value === 'object' && value.hasOwnProperty('draft')) {
    const { draft, draft: { email, password } } = value;
    checkInput(email$, email, context.__errorMessages.email);
    checkInput(password$, password, context.__errorMessages.password);
    checkButton(submitButton$, draft);
  }
  formState$.textContent = JSON.stringify(value, undefined, 2) + JSON.stringify(context, undefined, 2);
});


email$.addEventListener('input', ({ target }) => {
  form.send('SET_EMAIL', { email: target.value });
});
email$.addEventListener('blur', ({ target }) => {
  form.send('LEAVE_EMAIL');
});

password$.addEventListener('input', ({ target }) => {
  form.send('SET_PASSWORD', { password: target.value });
});
password$.addEventListener('blur', ({ target }) => {
  form.send('LEAVE_PASSWORD');
});

submitButton$.addEventListener('click', ({ target }) => {
  form.send('SUBMIT');
  api.register(form.machine.context).then(() => form.send('LOAD_SUCCESS'))
})

form.start();
