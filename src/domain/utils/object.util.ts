export abstract class ObjectUtil {
  static RemoveUndefinedProperties<TData = any>(data: TData): Partial<TData> {
    const newData = JSON.parse(JSON.stringify(data));
    const keysOfDataSent = Object.keys(newData);
    keysOfDataSent.forEach((key) => {
      if (this.IsNullOrEmptyOrUndefined(newData[key])) delete newData[key];
      else if (this.IsSimpleChainedObject(newData, key)) {
        const newObj = ObjectUtil.RemoveUndefinedProperties(newData[key]);
        this.IsEmptyObject(newObj)
          ? delete newData[key]
          : (newData[key] = newObj);
      }
    });
    return newData;
  }

  static IsEmptyObject(obj: any): boolean {
    if (!obj) return true;
    return Object.keys(obj).length < 0;
  }

  static IsSimpleChainedObject(obj: any, key: string): boolean {
    if (!obj || !key) return false;
    return typeof obj[key] === 'object' && !Array.isArray(obj[key]);
  }

  static IsNullOrEmptyOrUndefined(value: any): boolean {
    return value === null || value === '' || value === undefined;
  }

  static ShallowCompare(obj1, obj2): boolean {
    return (
      Object.keys(obj1).length === Object.keys(obj2).length &&
      Object.keys(obj1).every((key) => obj1[key] === obj2[key])
    );
  }

  static ConvertJsonToBuffer(data: any) {
    return Buffer.from(JSON.stringify(data));
  }
}
