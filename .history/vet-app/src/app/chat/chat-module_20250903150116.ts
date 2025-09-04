import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing-module';
import { Chat } from './chat';
import { ChatWindow } from './chat-window/chat-window';
import { MessageInput } from './message-input/message-input';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { Card}




@NgModule({
  declarations: [
    Chat,
    ChatWindow,
    MessageInput
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    MatIcon,
    MatFormField,
    ReactiveFormsModule,
    RouterModule

  ],
  exports: [
    Chat,
    ChatWindow,
    MessageInput
  ]
  
})
export class ChatModule { }


