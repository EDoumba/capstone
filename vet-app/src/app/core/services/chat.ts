import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: number;
  participant: {
    id: number;
    name: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket$!: WebSocketSubject<any>;
  private messagesSubject = new Subject<Message>();
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) { }

  connect(): void {
    const token = localStorage.getItem('token');
    this.socket$ = webSocket(`ws://localhost:3000/chat?token=${token}`);
    
    this.socket$.subscribe(
      (message: Message) => this.messagesSubject.next(message),
      (err) => console.error('WebSocket error:', err),
      () => console.log('WebSocket connection closed')
    );
  }

  sendMessage(receiverId: number, content: string): void {
    this.socket$.next({ receiverId, content });
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }

  getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>('/api/chat/chats');
  }

  getChatMessages(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`/api/chat/${chatId}/messages`);
  }

  markAsRead(chatId: number): Observable<any> {
    return this.http.post(`/api/chat/${chatId}/read`, {});
  }
}