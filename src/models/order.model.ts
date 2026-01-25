export interface OrderModel{
    orderId: string
    toyId: number
    nameOfToy : string
    store: string
    quantity:number
    price:number
    status: 'na'  | 'paid' | 'canceled' |  'liked' |'disliked'
    online: boolean
    
}