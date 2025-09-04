import { Component } from '@angular/core';

interface Participant {
  id: string;
  name: string;
  role: string;
}

interface Message {
  senderId: string;
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-window',
  standalone: false,
  templateUrl: './chat.html',
  styleUrls: ['./chat-window.scss']
})
export class ChatWindow {
  currentUserId: string = '123'; // Example current user id (replace with real auth user id)

  currentChat: { participant: Participant } | null = {
    participant: {
      id: '456',
      name: 'John Doe',
      role: 'user'
    }
  };

  messages: Message[] = [
    {
      senderId: '456',
      content: 'Hey there!',
      timestamp: new Date()
    },
    {
      senderId: '123',
      content: 'Hello! How are you?',
      timestamp: new Date()
    }
  ];


  onMessageSent(event: Event) {
  const input = event.target as HTMLInputElement;
  const content = input.value;

  if (!content.trim()) return;

  const newMessage: Message = {
    senderId: this.currentUserId,
    content,
    timestamp: new Date()
  };
  this.messages.push(newMessage);

  input.value = ''; // clear after sending
}

}
