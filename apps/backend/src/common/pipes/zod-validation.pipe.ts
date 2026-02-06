import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.') || 'value';
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(err.message);
        });

        throw new BadRequestException({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details,
          },
        });
      }
      throw error;
    }
  }
}

export function ZodValidate(schema: ZodSchema) {
  return new ZodValidationPipe(schema);
}
