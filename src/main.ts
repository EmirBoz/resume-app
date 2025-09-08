import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

// Apollo Client error messages for debugging
if (!environment.production) {
  // Inline import to ensure it works
  const loadApolloDevMessages = async () => {
    try {
      const { loadErrorMessages, loadDevMessages } = await import('@apollo/client/dev');
      loadDevMessages();
      loadErrorMessages();
      console.log('Apollo Client dev error messages loaded successfully');
    } catch (error) {
      console.warn('Apollo Client dev error messages could not be loaded:', error);
    }
  };
  loadApolloDevMessages();
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
