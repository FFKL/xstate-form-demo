import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { formService } from 'xstate-form';

const form = formService({
  inputs: {
    email: {
      validators: {
        empty: (val) => val.length === 0,
        incorrectEmail: (val) => !val.includes('@'),
        unregistered: async (val) => Promise.resolve(true),
      },
    },
    password: {
      validators: {
        empty: (val) => val.length === 0,
        minLength: (val) => val.length < 4,
      },
    },
  },
});
const email$ = document.querySelector('#inputEmail');
const password$ = document.querySelector('#inputPassword');
const submitButton$ = document.querySelector('#submit');
const formState$ = document.querySelector('#formState');

function checkInput(input$, state) {
  if (typeof state === 'string' && state === 'valid') {
    input$.classList.add('is-valid');
    input$.classList.remove('is-invalid');
    input$.parentElement.querySelector('.invalid-feedback').textContent = '';
  }
  if (typeof state === 'object' && state.hasOwnProperty('invalid')) {
    input$.classList.add('is-invalid');
    input$.classList.remove('is-valid');
    input$.parentElement.querySelector('.invalid-feedback').textContent = state.invalid;
  }
}

function checkButton(button$, state) {
  const isEnabled = Object.values(state).every(s => s === 'valid');
  button$.disabled = !isEnabled;
}

form.onTransition(({ context, value }) => {
  if (typeof value === 'object' && value.hasOwnProperty('draft')) {
    const { draft, draft: { email, password } } = value;
    checkInput(email$, email);
    checkInput(password$, password);
    checkButton(submitButton$, draft);
  }
  formState$.textContent = JSON.stringify(value, undefined, 2);
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
})

form.start();
