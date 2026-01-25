import { Component, signal } from '@angular/core';
import { ToyService } from '../../services/toy.service';
import { ToyModel } from '../../models/toy.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected toys = signal<ToyModel[]>([])
  protected previousSearch = 'N/A'
  protected search = ''

  constructor (){
   this.loadToys()
  }

  protected loadToys(){
if(this.previousSearch == '' && this.search == '') 
      return 

    this.previousSearch = this.search
  ToyService.getToys(this.search)
  .then(rsp => this.toys.set(rsp.data))
  }

}
//if(this.previousSearch == '' && this.search == '') 
      //return 

    //this.previousSearch = this.search