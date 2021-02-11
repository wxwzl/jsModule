function NumberUtil() {}
const capacity = 16; //Number最大存储位数，大于16会散失精度,存储位数不能小于3,否则会散失精度

function strToNumberArray(a, maxlen) {
  a = a + "";
  let aArray = [];
  while (a.length >= maxlen) {
    aArray.push(Number(a.substr(a.length - maxlen)));
    a = a.substr(0, a.length - maxlen);
  }
  if (a != "") {
    aArray.push(Number(a));
  }
  return aArray;
}
NumberUtil.prototype = {
  // 给定两个字符串，返回它们的乘法结果。例如getMulti('2', '3')，函数的输出为'6'。
  getMulti: function (a, b) {
    let astr = a + "";
    let bstr = b + "";
  },
  /**
   * 整数乘法运算
   * 给定两个字符串，返回它们的乘法结果。例如getMulti('2', '3')，函数的输出为'6'。
   */
  getIntegerMulti: function (a, b) {
    a = a.replace(/^0+/, "");
    b = b.replace(/^0+/, "");
    if (a == "" || b == "") {
      return "0";
    }
    const maxlen = capacity / 2 - 1 > 1 ? Math.floor(capacity / 2 - 1) : 1; //该值小于等于Number最大存储位数/2-1
    if (a.length < maxlen && b.length < maxlen) {
      return Number(a) * Number(b) + "";
    }
    let aNumArray = strToNumberArray(a, maxlen);
    let bNumArray = strToNumberArray(b, maxlen);
    let maxNumber = Math.pow(10, maxlen);
    let lenA = aNumArray.length;
    let lenB = bNumArray.length;
    let result = "";
    let temp = 0;
    let numi = 0;
    let numj = 0;
    let array = [];
    let overflow = 0;
    for (let i = 0; i < lenA; i++) {
      for (let j = 0; j < lenB; j++) {
        let index = i + j;
        let index1 = index + 1;
        numi = aNumArray[i];
        numj = bNumArray[j];
        temp = numj * numi;
        // if(array[index]){
        //     array[index] = this.getIntegerPlus(temp,array[index]);
        // }else{
        //     array[index] =temp;
        // }
        /**
         * 这里的加法不会超出精度，因为最多只进行3次加法运算，便要进行取模,进位，位数顶多增大一位;
         */
        let mul = temp + Number(array[index] || 0);
        overflow = Math.floor(mul / maxNumber);
        array[index] = mul % maxNumber;
        if (overflow != 0) {
          array[index1] = overflow + Number(array[index1] || 0);
        }
      }
    }
    let arraylen = array.length;
    for (let i = 0; i < arraylen; i++) {
      if (result.length < i * maxlen) {
        let diff = i * maxlen - result.length;
        for (let j = 0; j < diff; j++) {
          result = "0" + result;
        }
      }
      result = array[i] + result;
    }
    return result.replace(/^0+/, "");
  },
  /**
   * 整数加法运算
   * 给定两个字符串，返回它们的加法结果。例如getIntegerPlus('2', '3')，函数的输出为'5'。
   */
  getIntegerPlus: function (a, b) {
    let maxlen = capacity - 1 > 1 ? capacity - 1 : 1;
    let aNumArray = strToNumberArray(a, maxlen);
    let bNumArray = strToNumberArray(b, maxlen);
    let lenA = aNumArray.length;
    let lenB = bNumArray.length;
    let result = "";
    let temp = 0;
    let overflow = 0;
    let array = [];
    let max = lenB;
    if (lenB < lenA) {
      max = lenA;
    }
    let i = 0;
    for (i = 0; i < max; i++) {
      temp = Number(aNumArray[i] || 0) + Number(bNumArray[i] || 0) + Number(array[i] || 0);
      overflow = Math.floor(temp / Math.pow(10, maxlen));
      array[i] = temp % Math.pow(10, maxlen);
      array[i + 1] = Number(array[i + 1] || 0) + overflow;
      if (result.length < i * maxlen) {
        let diff = i * maxlen - result.length;
        for (let j = 0; j < diff; j++) {
          result = "0" + result;
        }
      }
      result = array[i] + result;
    }
    result = (array[i + 1] || "") + result;
    return result;
  },
};
