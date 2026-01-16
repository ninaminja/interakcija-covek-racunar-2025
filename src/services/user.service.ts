import { UserModel } from "../models/user.model";




export class UserService {
    public static USERS_KEY = 'icr_users'
    public static ACTIVE_KEY = 'icr_active'
    static getUsers(): UserModel[] {

     if (!localStorage.getItem('this.USERS_KEY')) {
        localStorage.setItem('this.USERS_KEY', JSON.stringify([
            {
                firstName: "Example",
                lastName: "User",
                email: "user@example.com",
                phone: "+38165321321",
                password: "user123",
                data: []
            }
        ]))
     }

     return JSON.parse(localStorage.getItem('this.USERS_KEY')!)
    }

    static findUserByEmail(email: string) {
        const users = this.getUsers()
        const selectedUser = users.find(u => u.email === email)
    
        if (!selectedUser)
            throw new Error('USER_NOT_FOUND')
    
        return selectedUser
     }  
     
     static login(email: string, password: string) {
        try {
            const user = this.findUserByEmail(email)
           if (user.password === password) {
                localStorage.setItem('this.ACTIVE_KEY', user.email)
                return true
            }
            return false
        } catch {
            return false
        }
     }

     static hasAuth() {
        return localStorage.getItem('this.ACTIVE_KEY') !== null
     }

     static getActiveUser (){
        if(!this.hasAuth())
           throw new Error()

        return this.findUserByEmail(localStorage.getItem('this.ACTIVE_KEY')!)
     }

     static logout(){
        localStorage.removeItem('this.ACTIVE_KEY')
     }
    
    }