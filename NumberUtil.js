function NumberUtil() {

};
const capacity = 16;//Number最大存储位数，大于16会散失精度

function strToNumberArray(a, maxlen) {
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
        const maxlen = capacity / 2 - 1 > 1 ? Math.floor(capacity / 2 - 1): 1; //该值小于等于Number最大存储位数/2-1
        let aNumArray = strToNumberArray(a, maxlen);
        let bNumArray = strToNumberArray(b, maxlen);
        let lenA = aNumArray.length;
        let lenB = bNumArray.length;
        let result = "";
        let temp = 0;
        let numi = 0;
        let numj = 0;
        for (let i = 0; i < lenA; i++) {
            for (let j = 0; j < lenB; j++) {
                numi = aNumArray[i];
                numj = bNumArray[j];
                temp = numj * numi;
                let strLen = (i + j) * maxlen;
                if (result.length > strLen) {
                    let right = result.substr(0, result.length - strLen);
                    result = result.substr(result.length - strLen);
                    temp = this.getIntegerPlus(temp+"", right);
                } else {
                    let zeroLen = strLen - result.length;
                    for (let n = 0; n < zeroLen; n++) {
                        result = "0" + result;
                    }
                }
                if (temp != 0) {
                    result = temp + result;
                }
            }
        }
        return result;
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
        let numi = 0;
        let numj = 0;
        let overflow = 0;
        let array = [];
        let max = lenB;
        if (lenB < lenA) {
            max = lenA;
        }
        let i =0;
        for (i = 0; i < max; i++) {
            temp = Number(aNumArray[i]||0) + Number(bNumArray[i]||0) + Number(array[i] || 0);
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
        result = (array[i+1]||"") + result;
        return result;
    }
};