import { getRootStateName, renderView } from './util';
import { LoginFormComponent } from './components/login-form';
import { LoginSuccessComponent } from './components/login-success';
import { LoginErrorComponent } from './components/login-error';

export class AppRoot {
  constructor(rootElement, formService) {
    this.rootElement = rootElement;
    this.formService = formService;
    this.state = {
      machineRootState: undefined,
      view: undefined
    }
  }

  run() {
    this.formService.onTransition(state => {
      const rootStateName = getRootStateName(state.value);
      if(this.state.machineRootState !== rootStateName) {
        this.state.machineRootState = rootStateName;
        switch (rootStateName) {
          case 'draft':
            return this.attachView(new LoginFormComponent(this.formService, this.rootElement));
          case 'success':
            return this.attachView(new LoginSuccessComponent(this.rootElement));
          case 'error':
            return this.attachView(new LoginErrorComponent(this.formService, this.rootElement));
        }
      }
    })
    
    this.formService.start();
  }

  attachView(component) {
    this.state.view?.destroy();
    this.state.view = component;
    renderView(this.rootElement, component.name);
    component.init();
  }
}