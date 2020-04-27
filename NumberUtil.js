function NumberUtil() {

};
NumberUtil.prototype = {
    // 给定两个字符串，返回它们的乘法结果。例如getMulti('2', '3')，函数的输出为'6'。
    getMulti: function (a, b) {
        const maxlen = 5;

        function strToNumberArray(a) {
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
        let aNumArray = strToNumberArray(a);
        let bNumArray = strToNumberArray(b);
        let lenA = aNumArray.length;
        let lenB = bNumArray.length;
        let result = "";
        let temp = 0;
        let left = 0;
        let numi = 0;
        let numj = 0;
        for (let i = 0; i < lenA; i++) {
            for (let j = 0; j < lenB; j++) {
                numi = aNumArray[i];
                numj = bNumArray[j];
                // console.log(numi, numj);
                temp = numj * numi;
                // console.log(numj, "*", numi, "=", temp);
                temp += left;
                let strLen = (i + j) * maxlen;
                // console.log("位数：", strLen);
                if (result.length > strLen) {
                    let right = result.substr(0, result.length - strLen);
                    result = result.substr(result.length - strLen);
                    right = Number(right);
                    temp += right;
                } else {
                    let zeroLen = strLen - result.length;
                    for (let n = 0; n < zeroLen; n++) {
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