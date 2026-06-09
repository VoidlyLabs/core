import { ResponseWrapper } from './response.util';

describe('ResponseWrapper', () => {
  it('wraps successful response with default metadata', () => {
    expect(ResponseWrapper.from({ id: '1' })).toEqual({
      error: false,
      message: 'OK',
      body: { id: '1' },
    });
  });

  it('wraps error response with custom message', () => {
    expect(ResponseWrapper.from({}, true, 'Unauthorized')).toEqual({
      error: true,
      message: 'Unauthorized',
      body: {},
    });
  });
});
