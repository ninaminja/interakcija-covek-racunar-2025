import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { Utils } from './utils';
import { MessageModel } from '../models/message.model';
import { RasaService } from '../services/rasa.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RasaModel } from '../models/rasa.model';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    protected year = new Date().getFullYear();
    protected waitingForResponse = false;
    protected botThinkingPlaceholder = 'Razmišljam...';
    protected isChatVisible = false;
    protected userMessage = '';
    protected messages: MessageModel[] = [];

    constructor(protected router: Router, private utils: Utils) {
        this.initializeWelcomeMessage();
        
        // Dodaj event listener direktno u constructor
        this.setupChatActions();
    }

    private setupChatActions() {
 
        window.addEventListener('chatAction', (event: any) => {
            this.handleChatAction(event.detail);
        });
    }

    private handleChatAction(action: any) {
        switch(action.type) {
            case 'details':
                this.userMessage = `details about ${decodeURIComponent(action.value)}`;
                this.sendUserMessage();
                break;
            case 'order':
                this.userMessage = `order ${decodeURIComponent(action.value)}`;
                this.sendUserMessage();
                break;
            case 'backToys':
                this.userMessage = 'show me toys';
                this.sendUserMessage();
                break;
        }
    }

    private initializeWelcomeMessage() {
        this.messages.push({
            type: 'bot',
            text: 'Zdravo! Ja sam vaš asistent za igračke. Kako mogu da vam pomognem? 🧸'
        });
    }

    toggleChat() {
        this.isChatVisible = !this.isChatVisible;
        if (this.isChatVisible) {
            setTimeout(() => this.scrollToBottom(), 100);
        }
    }

    async sendUserMessage() {
        if (this.waitingForResponse || !this.userMessage.trim()) return;

        const content = this.userMessage.trim();
        this.userMessage = '';
        this.waitingForResponse = true;

        this.messages.push({ type: 'user', text: content });
        this.messages.push({ type: 'bot', text: this.botThinkingPlaceholder });

        try {
            const response = await RasaService.sendMessage(content);
            this.removeBotPlaceholder();

            if (!Array.isArray(response.data) || response.data.length === 0) {
                this.messages.push({
                    type: 'bot',
                    text: "Izvinite, nisam razumeo pitanje. Pokušajte drugačije! 🤔"
                });
                return;
            }

            for (const msg of response.data as RasaModel[]) {
                if (msg.text) {
                    this.messages.push({
                        type: 'bot',
                        text: msg.text
                    });
                }

                if (msg.image) {
                    this.messages.push({
                        type: 'bot',
                        text: `<img src="${msg.image}" class="img-fluid rounded mt-2" style="max-width:200px;">`
                    });
                }

                if (msg.attachment) {
                    await this.handleAttachment(msg.attachment);
                }
            }

        } catch (err) {
            console.error('Rasa error:', err);
            this.removeBotPlaceholder();
            this.messages.push({
                type: 'error',
                text: 'Ne mogu da se povežem sa chatbot servisom.'
            });
        } finally {
            this.waitingForResponse = false;
            this.scrollToBottom();
        }
    }

    /* ================= ATTACHMENTS ================= */

    private async handleAttachment(attachment: RasaModel['attachment']) {
        if (!attachment) return;

        switch (attachment.type) {
            case 'toy_list':
                return this.handleToyList(attachment.data);
            case 'toy_details':
                return this.handleToyDetails(attachment.data);
            case 'type_list':
                return this.handleTypeList(attachment.data);
            case 'age_group_list':
                return this.handleAgeGroupList(attachment.data);
            case 'simple_list':
                return this.handleSimpleList(attachment.data);
            case 'create_order':
                return this.handleCreateOrder(attachment.data);
            default:
                this.messages.push({
                    type: 'bot',
                    text: JSON.stringify(attachment.data, null, 2)
                });
        }
    }

    /* ================= TOYS ================= */

    private async handleToyList(toys: any[]) {
        if (!Array.isArray(toys) || toys.length === 0) {
            this.messages.push({ 
                type: 'bot', 
                text: '<div class="alert alert-warning">Nema pronađenih igračaka.</div>' 
            });
            return;
        }

        let html = `<div class="toy-list p-3 border rounded shadow-sm">
            <h6 class="mb-3 text-dark">🎯 Pronađene igračke (${toys.length})</h6>
            <div class="row">`;

        for (const toy of toys) {
            const price = toy.price ? `Cena: <strong>${toy.price} RSD</strong>` : 'Cena: Na upit';
            const description = toy.description ? 
                `<p class="text-muted small mt-1">${this.truncateText(toy.description, 80)}</p>` : '';
            
            // Escape special characters za JavaScript string
            const safeName = this.escapeForJs(toy.name || '');
            const encodedName = encodeURIComponent(toy.name || '');
            
            html += `
            <div class="col-md-6 mb-3">
                <div class="card h-100 border-primary">
                    <div class="card-body">
                        <h6 class="card-title text-primary">${toy.name || 'Igračka'}</h6>
                        <div class="mb-2">
                            ${toy.type?.name ? `<span class="badge bg-info me-1">${toy.type.name}</span>` : ''}
                            ${toy.ageGroup?.name ? `<span class="badge bg-success">${toy.ageGroup.name}</span>` : ''}
                        </div>
                        <p class="card-text">
                            ${price}<br>
                            ${description}
                        </p>
                        <div class="mt-2">
                            ${toy.permalink ? `<a href="/toy/${toy.permalink}" target="_blank" class="btn btn-sm btn-info">info</a>` : ''}
                            ${toy.permalink ? `<a href="/toy/${toy.permalink}/reservation" target="_blank" class="btn btn-sm btn-info">kupi</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
        }

        html += '</div></div>';
        this.messages.push({ type: 'bot', text: html });
    }

    private async handleToyDetails(toy: any) {
        if (!toy) return;

        const typeInfo = toy.type?.name ? `Tip: <span class="badge bg-info">${toy.type.name}</span><br>` : '';
        const ageInfo = toy.ageGroup?.name ? `Starosna grupa: <span class="badge bg-success">${toy.ageGroup.name}</span><br>` : '';
        const priceInfo = toy.price ? `Cena: <strong class="text-success">${toy.price} RSD</strong><br>` : 'Cena: Na upit<br>';
        const desc = toy.description ? `<p class="mt-3">${toy.description}</p>` : '';
        
        const encodedName = encodeURIComponent(toy.name || '');

        let html = `<div class="p-4 border rounded shadow">
            <h5 class="text-dark mb-3">${toy.name || 'Igračka'}</h5>
            <div class="text-dark">
                ${typeInfo}
                ${ageInfo}
                ${priceInfo}
                ${desc}
            </div>
            <div class="mt-4">
                <button class="btn btn-success me-2" 
                        onclick="window.dispatchEvent(new CustomEvent('chatAction', {detail: {type: 'order', value: '${encodedName}'}}))">
                    🛒 Naruči ovu igračku
                </button>
                <button class="btn btn-outline-primary me-2" 
                        onclick="window.dispatchEvent(new CustomEvent('chatAction', {detail: {type: 'backToys'}}))">
                    ↩ Nazad na igračke
                </button>
                ${toy.permalink ? `<a href="https://toy.pequla.com/toy/${toy.permalink}" target="_blank" class="btn btn-info">🌐 Pogledaj na sajtu</a>` : ''}
            </div>
        </div>`;

        this.messages.push({ type: 'bot', text: html });
    }

    /* ================= TYPES ================= */

    private async handleTypeList(types: any[]) {
        if (!Array.isArray(types) || types.length === 0) {
            this.messages.push({ type: 'bot', text: 'Nema dostupnih tipova igračaka.' });
            return;
        }

        let html = `<div class="p-3 border rounded bg-light">
            <h6 class="mb-3 text-dark">📚 Tipovi igračaka (${types.length})</h6>
            <ul class="list-group">`;

        for (const t of types) {
            html += `<li class="list-group-item text-dark">${t.name}</li>`;
        }

        html += '</ul></div>';
        this.messages.push({ type: 'bot', text: html });
    }

    /* ================= AGE GROUPS ================= */

    private async handleAgeGroupList(ageGroups: any[]) {
        if (!Array.isArray(ageGroups) || ageGroups.length === 0) {
            this.messages.push({ type: 'bot', text: 'Nema dostupnih starosnih grupa.' });
            return;
        }

        let html = `<div class="p-3 border rounded bg-light">
            <h6 class="mb-3 text-dark">👶 Starosne grupe (${ageGroups.length})</h6>
            <ul class="list-group">`;

        for (const ag of ageGroups) {
            html += `<li class="list-group-item text-dark">${ag.name}</li>`;
        }

        html += '</ul></div>';
        this.messages.push({ type: 'bot', text: html });
    }

    /* ================= OTHER ================= */

    private async handleSimpleList(items: any[]) {
        if (!Array.isArray(items)) return;

        let html = '<ul class="list-group">';
        for (const i of items) {
            html += `<li class="list-group-item text-dark">${i}</li>`;
        }
        html += '</ul>';

        this.messages.push({ type: 'bot', text: html });
    }

    private async handleCreateOrder(order: any) {
        const orderHtml = `
        <div class="alert alert-success">
            <h5>✅ Porudžbina je uspešno kreirana!</h5>
            <hr>
            <strong>Detalji porudžbine:</strong><br>
            Igračka: ${order.igračka || order.toy || 'N/A'}<br>
            Cena: ${order.cena || 'Na upit'}<br>
            Broj narudžbine: ${order.broj_narudžbine || 'N/A'}<br>
            Vreme: ${order.vreme_narudžbine || 'N/A'}<br>
            <small class="text-muted">Hvala na kupovini!</small>
        </div>`;

        this.messages.push({ type: 'bot', text: orderHtml });
    }



    private escapeForJs(text: string): string {
        // Escape za JavaScript string u onclick atributu
        return text
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }

    private truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    private removeBotPlaceholder() {
        this.messages = this.messages.filter(
            m => m.text !== this.botThinkingPlaceholder
        );
    }

    private scrollToBottom() {
        setTimeout(() => {
            const el = document.querySelector('.chat-messages');
            if (el) el.scrollTop = el.scrollHeight;
        }, 100);
    }

    clearChat() {
        this.utils.showDialog(
            'Da li ste sigurni da želite da obrišete chat?',
            () => {
                this.messages = [];
                this.initializeWelcomeMessage();
            }
        );
    }


    getUserName() {
        const user = UserService.getActiveUser();
        return `${user.firstName} ${user.lastName}`;
    }

    hasAuth() {
        return UserService.hasAuth();
    }

    doLogout() {
        this.utils.showDialog(
            'Da li ste sigurni da želite da se odjavite?',
            () => {
                UserService.logout();
                this.router.navigateByUrl('/login');
            }
        );
    }
}