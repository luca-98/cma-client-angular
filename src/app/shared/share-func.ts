export function removeSignAndLowerCase(str: string): string {
  str = str.trim();
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'a');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'e');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'i');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'o');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'u');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'y');
  str = str.replace(/Đ/g, 'd');
  str = str.toLowerCase();
  return str;
}

export function propValToString(obj: any): any {
  for (const property in obj) {
    if (typeof obj[property] === 'object' && obj[property] !== null) {
      obj[property] = propValToString(obj[property]);
      break;
    }
    if (!(typeof obj[property] === 'string' || obj[property] instanceof String)) {
      obj[property] = obj[property].toString();
    }
  }
  return obj;
}

export function clearNullOfObject(obj: any): any {
  for (const property in obj) {
    if (typeof obj[property] === 'object' && obj[property] !== null) {
      obj[property] = clearNullOfObject(obj[property]);
      break;
    }
    if (obj[property] === null || obj[property] === undefined) {
      obj[property] = '';
    }
  }
  return obj;
}



// convert dateTime object to dd/MM/yyyy
export function convertDateToNormal(d: any): string {
  if (!d) {
    return d;
  }
  const date = d._d.getDate();
  const month = d._d.getMonth() + 1;
  const year = d._d.getFullYear();
  return date + '/' + month + '/' + year;
}


// highlight text matching in autocomplate
// rawString: string send to server to search
// resultString: string result server sent to client
export function buildHighlightString(rawString: string, resultString: string) {
  const rawParse = removeSignAndLowerCase(rawString);
  const resultParse = removeSignAndLowerCase(resultString);
  const indexStart = resultParse.indexOf(rawParse);
  const indexEnd = indexStart + rawParse.length;
  return '<p>' + resultString.substring(0, indexStart) + '<strong>'
    + resultString.substring(indexStart, indexEnd) + '</strong>'
    + resultString.substring(indexEnd) + '</p>';
}
