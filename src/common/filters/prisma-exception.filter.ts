import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';
const FOREIGN_KEY_VIOLATION = 'P2003';
const RECORD_NOT_FOUND = 'P2025';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();
    const httpException = this.mapToHttpException(exception);

    this.logger.error(
      `Unhandled Prisma error ${exception.code}: ${exception.message}`,
    );

    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }

  private mapToHttpException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): HttpException {
    switch (exception.code) {
      case UNIQUE_CONSTRAINT_VIOLATION:
        return new ConflictException('A record with this value already exists');
      case FOREIGN_KEY_VIOLATION:
        return new NotFoundException('Related record not found');
      case RECORD_NOT_FOUND:
        return new NotFoundException('Record not found');
      default:
        return new InternalServerErrorException('Internal server error');
    }
  }
}
