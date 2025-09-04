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
import { MatCardModule } from '@angular/material/card';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input'; // needed if your app-message-input uses matInput
import { MatFormFieldModule } from '@angular/material/form-field'; // also for input fields




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
    RouterModule,
    MatCardModule

  ],
  exports: [
    Chat,
    ChatWindow,
    MessageInput
  ]
  
})
export class ChatModule { }


