import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class Utils {

  public boostrapClasses = {
  popup: 'card',
  cancelButton : 'btn btn-danger',
  denyButton: 'btn btn-secondary',
  confirmButton: 'btn btn-primary'
}

  public showDialog(text: string, callback: Function, confirm: string ='Yes', cancel : string = 'No'){

     Swal.fire({
      title: text,
      showCancelButton: true,
      confirmButtonText: confirm,
      cancelButtonText: cancel,
      customClass: this.boostrapClasses
    
    }).then((result) => {
      if (result.isConfirmed) {
        callback()
    
      } 
    });

  } 
  public showAlert (text: string) {
    Swal.fire({
      icon: 'info',
      title: text,
      customClass: this.boostrapClasses
    })
  }
}
