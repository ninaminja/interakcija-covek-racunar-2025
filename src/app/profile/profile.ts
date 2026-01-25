import { Component, signal, computed } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { UserModel } from '../../models/user.model';
import { OrderModel } from '../../models/order.model';
import { NgClass } from '@angular/common';
 

@Component({
  selector: 'app-profile',
  imports: [NgClass],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  protected activeUser = signal<UserModel | null>(null)
  protected statusMap = {
    'na': 'Waiting',
    'paid': 'Paid',
    'canceled': 'Canceled',
    'liked': 'Positive Rating',
    'disliked': 'Negative Raiting'
  }

 

  constructor(private router: Router) {
    if (!UserService.hasAuth()) {
      localStorage.setItem(UserService.TO_KEY, '/profile')
      this.router.navigateByUrl('/login')
      return
    }

    this.activeUser.set(UserService.getActiveUser())
  }
  
   protected pay(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'paid')
    this.activeUser.set(UserService.getActiveUser())
  }

  protected cancel(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'canceled')
    this.activeUser.set(UserService.getActiveUser())
  }


  protected like(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'liked')
    this.activeUser.set(UserService.getActiveUser())
  }

  protected dislike(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'disliked')
    this.activeUser.set(UserService.getActiveUser())
  }


  protected totalSpent = computed(() => {
    const user = this.activeUser();
    if (!user?.data) return 0;
    
    return user.data.reduce((sum, order) => {
      // Ako order ima price polje
      if (order.price !== undefined) {
        return sum + (order.price * (order.quantity || 1));
      }
      return sum;
    }, 0);
  });
}
