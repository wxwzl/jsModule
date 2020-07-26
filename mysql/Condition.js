'use strict';
let mysql = require("mysql");

const OrderMap = {
    desc:-1,
    asc:1,
    none:0,
}

/**
 *
 *单个查询条件类
 * @class Condition
 */
class Condition {

    /**
     *Creates an instance of Condition.
     * 当notEscape为true时一定要进行防sql注入检查 调用sqlAttackCheck方法
     * @param {*} key
     * @param {*} value
     * @param {*} operator
     * @param {*} notEscape
     * @memberof Condition
     */
    constructor(key,value,operator,notEscape){
        if(/^[0-9]/.test(key)){
            this.key = `'${key}'`;
        }else{
            this.key = key;
        }
        
        if(!notEscape){
            if(this.isEmpty(value)){
                this.value = "";
            }else{
                this.value = mysql.escape(value);
            }
           
        }else{
            this.value = value;
        }
        this.operator = operator;
        this.sql = null;
    }

    /**
     *
     *对key 和value的值做是否含有=检查。
     * @returns
     * @memberof Condition
     */
    sqlAttackCheck(){
        
        if(this.sqlCheck(this.value)!=true){
            this.value="";
            return false;
        }
        if(this.sqlCheck(this.key)!=true){
            this.key="";
            return false;
        }
        return true;
    }

    sqlCheck(str){
        let regex = /[=]/g;
       //只能为数字，字母和下划线检查。
        // let regex = /[^\d\w_]/g;
        if(!this.isEmpty(str)&&regex.test(str)){
            return false;
        }
        return true;
    }
    /**
     *
     * 生成类似 key = vlue；key>value这种形式。
     * @returns
     * @memberof Condition
     */
    toString(){
        if(this.sql){
            return this.sql;
        }
        if(this.operator.indexOf("${key}")>=0&&this.operator.indexOf("${value}")>=0){
            this.sql = this.operator.replace(/\$\{key\}/g,this.key).replace(/\$\{value\}/g,this.value);
        }else if(this.operator.indexOf("${key}")>=0){
            this.sql = this.operator.replace(/\$\{key\}/g,this.key)+" "+this.value;
        }else if(this.operator.indexOf("${value}")>=0){
            this.sql = this.key+" "+this.operator.replace(/\$\{value\}/g,this.value);
        }else{
            this.sql = this.key+" "+this.operator+" "+this.value;
        }
        this.sql =this.trim(this.sql);
        return this.sql;
    }

    /**
     *
     *截取前后字符串
     * @param {*} str
     * @returns
     * @memberof BaseController
     */
    trim(str){
        return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '');
    }

    isEmpty(str){
        if(str===""||str===undefined ||str ==null){
            return true;
        }
        return false;
    }

    /**
     *
     *
     * @param {*} conditions
     * @returns Condition
     */

    join(conditions,seperator){
        if(!(conditions  instanceof Array)){
            conditions = [conditions];
        }
        let len = conditions.length;
        if (len <= 0 ) {
            return this;
        }
        if(seperator===undefined){
            seperator=" ";
        }
        conditions.unshift(this);
        len = conditions.length;
        let condition, value = "";
        for (let i = 0; i < len; i++) {
            condition = conditions[i];
            value += seperator + condition.toString();
        }
        return new Condition("", value, "",true);
    }

    /**
     *
     * 按property进行order排序
     * @param {*} property 
     * @param {*} order
     * @returns
     * @memberof ConditionBuilder
     */
    orderBy(property,order){
        let condition ;
        if(order === OrderMap.desc){
            condition =  new Condition(property,"","ORDER BY ${key} desc");
        }else if(order ===  OrderMap.asc){
            condition = new Condition(property,"","ORDER BY ${key} asc");
        }
        if(condition){
            if(condition.sqlAttackCheck()===true){
                this.join(condition);
            }
        }
        return this;
    }


    /**
     *
     * 按property进行分组
     * @param {*} conditions
     * @param {*} property
     * @returns
     * @memberof ConditionBuilder
     */
    groupBy(property){
        let condition = new Condition(property,"","GROUP BY ${key} ");
        if(condition.sqlAttackCheck()===true){
            this.join(condition);
        }
        return  this;
    }
   
}
module.exports = {Condition,OrderMap};

