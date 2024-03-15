export function removeObj(obj: any): any {
    if (obj !== null && typeof obj === 'object') {
      //const newObj: any = Array.isArray(obj) ? [] : {};
      const newObj: any =  {};
      Object.keys(obj).forEach(key => {
        const newKey = key.replace(/_obj$/, "");
        newObj[newKey] = removeObj(obj[key]);
      });
      return newObj;
    } else {
      return obj;
    }
  }