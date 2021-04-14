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
          { name: 'empty', message: 'Empty value', validate: Validator.required() },
          { name: 'incorrectEmail', message: 'Is not an email', validate: Validator.email() },
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
          { name: 'empty', message: 'Empty value', validate: Validator.required() },
          { name: 'minLength', message: 'Length < 4', validate: Validator.min(4) },
        ],
      },
    },
  },
});

new AppRoot(document.querySelector('#root'), form).run();
