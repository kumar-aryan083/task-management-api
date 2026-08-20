import { ArgumentsHost, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

function buildHost(): {
  host: ArgumentsHost;
  response: { status: jest.Mock; json: jest.Mock };
} {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

function buildPrismaError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Simulated Prisma error', {
    code,
    clientVersion: 'test',
  });
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps a unique constraint violation (P2002) to 409 without leaking the Prisma message', () => {
    const { host, response } = buildHost();

    filter.catch(buildPrismaError('P2002'), host);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'A record with this value already exists',
      }),
    );
  });

  it('maps a foreign key violation (P2003) to 404', () => {
    const { host, response } = buildHost();

    filter.catch(buildPrismaError('P2003'), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Related record not found' }),
    );
  });

  it('maps a record-not-found error (P2025) to 404', () => {
    const { host, response } = buildHost();

    filter.catch(buildPrismaError('P2025'), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Record not found' }),
    );
  });

  it('maps an unrecognized Prisma error code to a sanitized 500', () => {
    const { host, response } = buildHost();

    filter.catch(buildPrismaError('P9999'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );
    const [body] = response.json.mock.calls[0] as [{ message: string }];
    expect(body.message).not.toContain('Simulated Prisma error');
  });
});
