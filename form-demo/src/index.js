import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { formService, Validator } from 'xstate-form';

import api from './fake-api';

import { AppRoot } from './app-root';

const form = formService({
  controls: {
    email: {
      value: '',
      validators: {
        sync: [
          { name: 'empty', message: 'Email is required', validate: Validator.required() },
          { name: 'incorrectEmail', message: 'Email must be a valid email address', validate: Validator.email() },
        ],
        async: [
          { name: 'used', validate: (val) => api.checkEmailUsage(val) },
          { name: 'bannedDomain', validate: (val) => api.checkDomainBanStatus(val) },
        ],
      },
    },
    password: {
      value: '',
      validators: {
        sync: [
          { name: 'empty', message: 'Password is required', validate: Validator.required() },
          { name: 'minLength', message: 'Password must be at least 4 characters long', validate: Validator.min(4) },
        ],
      },
    },
  },
});

new AppRoot(document.querySelector('#root'), form).run();
