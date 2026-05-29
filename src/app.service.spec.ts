import { AppService } from './app.service';

describe('AppService', () => {
  it('should return the default greeting', () => {
    const appService = new AppService();

    expect(appService.getHello()).toBe('Hello World!');
  });
});
