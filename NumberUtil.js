function NumberUtil() {

};
NumberUtil.prototype = {
    // 给定两个字符串，返回它们的乘法结果。例如getMulti('2', '3')，函数的输出为'6'。
    getMutil: function (a, b) {
        const maxlen = 1;
        function strToNumberArray(a) {
            let aArray = [];
            while (a.length >= maxlen) {
                aArray.push(Number(a.substr(0, maxlen)));
                a = a.substr(maxlen);
            }
            if (a != "") {
                aArray.push(Number(a));
            }
            return aArray;
        }
        let aNumArray = strToNumberArray(a);
        let bNumArray = strToNumberArray(b);
        let lenA = aNumArray.length;
        let lenB = bNumArray.length;
        let result = "";
        let temp = 0;
        let left = 0;
        let numi = 0;
        let numj = 0;
        for (let i = lenA - 1; i >= 0; i--) {
            for (let j = lenB - 1; j >= 0; j--) {
                numi = aNumArray[i];
                numj = bNumArray[j];
                // console.log(numi, numj);
                temp = numj * numi;
                // console.log(numj, "*", numi, "=", temp);
                temp += left;
                let strLen = (lenA - i - 1 + lenB - j - 1) * maxlen;
                // console.log("位数：", strLen);
                if (result.length > strLen) {
                    let right = result.substr(0, result.length - strLen);
                    result = result.substr(result.length - strLen);
                    right = Number(right);
                    temp += right;
                } else {
                    for (let n = 0; n < strLen - result.length; n++) {
                        result = "0" + result;
                    }
                }
                if (temp != 0) {
                    result = temp + result;
                }
                // console.log("result:", result);

            }

        }
        return result;
    }
};