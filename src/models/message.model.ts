export interface MessageModel {
    type: 'user' | 'bot' | 'error'
    text: string
}