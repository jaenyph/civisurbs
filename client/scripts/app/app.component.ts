import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `<h1>AppComponent : {{status}}</h1><cu-map></cu-map>`
})
export class AppComponent { status = 'loaded'; }
