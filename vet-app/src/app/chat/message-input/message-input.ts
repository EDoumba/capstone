import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone : false,
  templateUrl: './message-input.html',
  styleUrls: ['./message-input.scss'],
})
export class MessageInput implements OnInit {
  messageForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.messageForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.messageForm.valid) {
      const message = this.messageForm.value.content;
      console.log('Message submitted:', message);
      this.messageForm.reset();
    }
  }
}
