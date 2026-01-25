import axios from "axios"
import { ToyModel } from "../models/toy.model"
import { TypeModel } from "../models/type.model"


const client = axios.create({
    baseURL: 'https://toy.pequla.com/api/',
    headers: {
        'Accept': 'application/json',
        'X-Name': 'ICR/2025'
    }
})



export class ToyService {
    static async getToys(search: string = '', type: number = 0) {
        return client.request<ToyModel[]>({
            url: '/toy',
            method: 'GET',
            params :{
                'search': search,
                'type':type
            }
        })
        
    }

    static async getToyByPermaLink(permalink: string) {
        return client.get<ToyModel>(`/toy/permalink/${permalink}`)
        
    }

    static async getTypes() {
        return client.get<TypeModel[]>(`/type`)
        
    }
}