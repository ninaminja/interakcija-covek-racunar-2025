import { OrderModel } from "./order.model";

export interface UserModel {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    data: OrderModel[];
}