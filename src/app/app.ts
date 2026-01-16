import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { Utils } from './utils';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected year = new Date().getFullYear()

  constructor(protected router: Router, private utils: Utils){}

  getUserName(){
    const user= UserService.getActiveUser()
    return `${user.firstName} ${user.lastName}`
  }

  hasAuth(){
    return UserService.hasAuth()
  }

  doLogout(){
    this.utils.showDialog("Are you sure you want to logout?", ()=> {
      UserService.logout()
    this.router.navigateByUrl('/login')
    }, "Logout now", "Don't logout"
  )
  }
}
 