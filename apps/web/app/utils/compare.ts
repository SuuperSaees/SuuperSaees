export function deepEqual<T>(obj1: T, obj2: T): boolean {
    if (obj1 === obj2) return true;
  
    if (
      obj1 === null ||
      obj2 === null ||
      typeof obj1 !== 'object' ||
      typeof obj2 !== 'object'
    ) {
      return false;
    }
  
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) return false;
  
    for (const key of keys1) {
      if (
        !keys2.includes(key) ||
        !deepEqual(obj1[key as keyof T], obj2[key as keyof T])
      ) {
        return false;
      }
    }
  
    return true;
  }