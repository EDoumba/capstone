import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../core/services/auth';
import { ChatService, Chat, Message } from '../../core/services/chat';

import 

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.html',
  styleUrls: ['./chat-window.scss']
})
export class ChatWindow implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  chats: Chat[] = [];
  messages: Message[] = [];
  currentChat: Chat | null = null;
  currentChatId: number | null = null;
  currentUser: User | null = null;
  loading = false;
  isMobile = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    
    this.subscriptions.push(
      this.authService.currentUser.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadChats();
          this.chatService.connect();
        } else {
          this.chatService.disconnect();
        }
      })
    );

    this.subscriptions.push(
      this.chatService.messages$.subscribe(message => {
        if (this.currentChatId && message.senderId !== this.currentUser?.id) {
          this.messages.push(message);
          this.scrollToBottom();
        }
      })
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkScreenSize());
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  loadChats(): void {
    this.loading = true;
    this.chatService.getChats().subscribe({
      next: (chats) => {
        this.chats = chats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load chats:', error);
        this.loading = false;
      }
    });
  }

  selectChat(chatId: number): void {
    this.currentChatId = chatId;
    this.currentChat = this.chats.find(chat => chat.id === chatId) || null;
    
    if (this.currentChat) {
      this.loadMessages(chatId);
      this.markAsRead(chatId);
    }
  }

  loadMessages(chatId: number): void {
    this.loading = true;
    this.chatService.getChatMessages(chatId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Failed to load messages:', error);
        this.loading = false;
      }
    });
  }

  markAsRead(chatId: number): void {
    this.chatService.markAsRead(chatId).subscribe();
  }

  onSendMessage(content: string): void {
    if (this.currentChat && content.trim()) {
      this.chatService.sendMessage(this.currentChat.participant.id, content);
      
      // Add message optimistically
      const newMessage: Message = {
        id: Date.now(), // Temporary ID
        senderId: this.currentUser?.id || 0,
        receiverId: this.currentChat.participant.id,
        content,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      this.messages.push(newMessage);
      this.scrollToBottom();
    }
  }

  goBack(): void {
    this.currentChat = null;
    this.currentChatId = null;
    this.messages = [];
  }

  clearChat(): void {
    // Implementation for clearing chat
    console.log('Clear chat functionality');
  }

  muteChat(): void {
    // Implementation for muting chat
    console.log('Mute chat functionality');
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.messagesContainer) {
          this.messagesContainer.nativeElement.scrollTop = 
            this.messagesContainer.nativeElement.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}