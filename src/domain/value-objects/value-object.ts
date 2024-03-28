import { ObjectUtil } from '@domain/utils/object.util';
import { IsOptional } from 'class-validator';

export abstract class ValueObject<T extends Record<any, any>> {
  @IsOptional()
  private readonly properties: T;
  protected constructor(properties: T) {
    this.properties = Object.freeze(properties);
  }

  equals(valueObject?: ValueObject<T>): boolean {
    if (this.isInvalidValueObject(valueObject)) return false;
    return ObjectUtil.ShallowCompare(this.properties, valueObject);
  }

  private isInvalidValueObject(valueObject: ValueObject<T>): boolean {
    return (
      ObjectUtil.IsNullOrEmptyOrUndefined(valueObject) ||
      ObjectUtil.IsNullOrEmptyOrUndefined(this.properties)
    );
  }
}
