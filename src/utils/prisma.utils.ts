import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUtils {
  exclude<T, Key extends keyof T>(entity: T, ...keys: Key[]) {
    const filteredEntries = Object.entries(entity).filter(
      ([key]) => !keys.includes(key as Key),
    );
    return Object.fromEntries(filteredEntries) as Omit<T, Key>;
  }
}
