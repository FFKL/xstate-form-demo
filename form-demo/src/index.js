import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { formService, Validator } from 'xstate-form';

import api from './fake-api';
import { LoginFormComponent } from './components/login-form';
import { LoginSuccessComponent } from './components/login-success';
import { LoginErrorComponent } from './components/login-error';

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

const root$ = document.querySelector('#root');
let currentView = new LoginFormComponent(form, root$);
currentView.init();
let currentRootState = 'draft';

form.onTransition(state => {
  if(currentRootState !== getRootState(state.value)) {
    currentRootState = getRootState(state.value);
    console.log(currentRootState);
    switch (getRootState(state.value)) {
      case 'draft': {
        currentView.destroy();
        currentView = new LoginFormComponent(form, root$);
        currentView.init();
        break;
      }
      case 'success': {
        currentView.destroy();
        currentView = new LoginSuccessComponent(root$);
        currentView.init();
        break;
      }
      case 'error': {
        currentView.destroy();
        currentView = new LoginErrorComponent(form, root$);
        currentView.init();
        break;
      }
    }
  }
})

function getRootState(stateValue) {
  if (typeof stateValue === 'string') {
    return stateValue;
  }

  return Object.keys(stateValue).pop();
}

form.start();
