
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [ provideAnimationsAsync()   // ✅ active les animations
  ]
});


platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
