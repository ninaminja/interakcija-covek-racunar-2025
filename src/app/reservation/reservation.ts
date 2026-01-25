
import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import { ToyModel } from '../../models/toy.model';
import { ToyService } from '../../services/toy.service';
import { UserService } from '../../services/user.service';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Utils } from '../utils';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-reservation',
  imports: [ ReactiveFormsModule, RouterLink],
  templateUrl: './reservation.html',
  styleUrl: './reservation.css'
})
export class Reservation {

    protected toy = signal<ToyModel | null>(null)
    protected form: FormGroup

  constructor(private route : ActivatedRoute, 
    private router :Router,
    private builder: FormBuilder, 
    private utils: Utils
  ){
    this.route.params.subscribe(p=>{
      if(p['path']){
          const shortUrl=p['path']
        if (!UserService.hasAuth()) {
              localStorage.setItem(UserService.TO_KEY, `/toy/${shortUrl}/reservation`)
              this.router.navigateByUrl('/login')
              return
            }

        ToyService.getToyByPermaLink(shortUrl)
        .then(rsp => this.toy.set(rsp.data))
      }
    })
    
    // POPRAVI: Koristi broj umesto stringa za quantity
    this.form = this.builder.group({
      store: ['Novi Beograd', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]], 
      online : [false, Validators.required]
    })
  }
  
  protected onSubmit() {
    if (!this.form.valid) {
      this.utils.showAlert('Invalid form data!')
      return
    }

     if (!this.toy()) {
      this.utils.showAlert('Igracka se nije ucitala')
      return
    }

    // POPRAVI: Konvertuj vrednost u broj
    const quantity = Number(this.form.value.quantity);
    
    UserService.createReservation({
      toyId : this.toy()!.toyId,
      nameOfToy : this.toy()!.name,
      store : this.form.value.store,
      quantity : quantity, 
      price : this.toy()!.price,
      status : 'na',
      orderId : uuidv4(),
      online:this.form.value.online
    })
    this.router.navigateByUrl('/profile')
  }

}
