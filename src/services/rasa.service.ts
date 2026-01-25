import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { RasaModel } from "../models/rasa.model";

export class RasaService {
    static async sendMessage(content: string) {
        return await axios.request<RasaModel[]>({
            url: 'http://localhost:5005/webhooks/rest/webhook',
            method: 'POST',
            data: {
                "sender": this.obtainSenderId(),
                "message": content
            }
        })
    }

    private static obtainSenderId() {
        if (!localStorage.getItem('icr_sender_id')) {
            localStorage.setItem('icr_sender_id', uuidv4())
        }

        return localStorage.getItem('icr_sender_id')
    }
}