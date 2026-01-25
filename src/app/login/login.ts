import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Utils } from '../utils';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  protected form: FormGroup

  constructor(private formBuilder: FormBuilder, private router: Router, private utils: Utils) {
    this.form = this.formBuilder.group({
      email: ['user@example.com', [Validators.required, Validators.email]],
      password: ['user123', Validators.required]
    })
  }

  onSubmit() {
    if (!this.form.valid) {
      this.utils.showAlert('Invalid form data!')
      return
    }

    if (!UserService.login(this.form.value.email, this.form.value.password)) {
      this.utils.showAlert('Invalid credentials!')
      return
    }

    let to = '/'
    if (localStorage.getItem(UserService.TO_KEY)) {
      to = localStorage.getItem(UserService.TO_KEY)!
      localStorage.removeItem(UserService.TO_KEY)
    }

    this.router.navigateByUrl(to)
  }
}