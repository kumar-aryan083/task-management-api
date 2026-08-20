import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

function buildContext(
  method: string,
  originalUrl: string,
  statusCode: number,
): {
  context: ExecutionContext;
  response: EventEmitter & { statusCode: number };
} {
  const response = Object.assign(new EventEmitter(), { statusCode });
  const request = { method, originalUrl };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;

  return { context, response };
}

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs method, url, and status once the response actually finishes', () => {
    const { context, response } = buildContext('GET', '/tasks', 200);
    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe();
    response.emit('finish');

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /tasks 200'),
    );
  });

  it('passes handler errors through untouched, and still logs whatever status the response finished with', () => {
    const { context, response } = buildContext('DELETE', '/users/me', 404);
    const next: CallHandler = {
      handle: () => throwError(() => new Error('not found')),
    };
    const onError = jest.fn();

    interceptor.intercept(context, next).subscribe({ error: onError });
    response.emit('finish');

    expect(onError).toHaveBeenCalledWith(new Error('not found'));
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('DELETE /users/me 404'),
    );
  });

  it('does not log before the response has actually finished', () => {
    const { context, response } = buildContext('GET', '/tasks', 200);
    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe();

    expect(logSpy).not.toHaveBeenCalled();
    response.emit('finish');
    expect(logSpy).toHaveBeenCalled();
  });
});
