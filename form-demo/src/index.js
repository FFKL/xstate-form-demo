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
form.onTransition(({ context, value }) => console.log(context, value));

const email$ = document.querySelector('#inputEmail');
const password$ = document.querySelector('#inputPassword');

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

form.start();
