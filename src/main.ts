import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
//@ts-ignore
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle'
//@ts-ignore
import '@fortawesome/fontawesome-free/css/all.css'




bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
