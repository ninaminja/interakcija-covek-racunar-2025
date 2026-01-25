import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Toy } from './toy/toy';
import { Profile } from './profile/profile';
import { Reservation } from './reservation/reservation';
import { SearchComponent } from './search/search';

export const routes: Routes = [
    { path: '', title: 'Home', component: Home },
    {path: 'about', title: 'About', component: About},
    {path: 'login', title : 'Login', component: Login},
    {path:'search', title: 'Search',  component: SearchComponent}, 
    {path: 'signup', title : 'Signup', component: Signup},
    {path: 'toy/:path/reservation', title : 'Toy reservation', component: Reservation},
    {path: 'toy/:path', title : 'Toy', component: Toy},
    {path: 'profile', title : 'User Profile', component: Profile},
    { path: '**', redirectTo: '' }

];
