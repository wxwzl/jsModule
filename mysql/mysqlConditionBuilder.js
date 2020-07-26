'use strict';
let Condition= require("./Condition").Condition;

const OrderMap = require("./Condition").OrderMap;





/**
 *
 *查询条件构造器。
 * @class ConditionBuilder
 */
class ConditionBuilder {

    constructor(){
        this.operatorMap = {
            gt: ">",
            equal: "=",
            lt: "<",
            gtOe: ">=",
            ltOe: "<=",
            like: "like",
            regexp:"REGEXP"

        }
    }

    /**
     *
     *mysql 操作符映射表
     * @static
     * @memberof ConditionBuilder
     */
    // static operatorMap = {
    //     gt: ">",
    //     equal: "=",
    //     lt: "<",
    //     gtOe: ">=",
    //     ltOe: "<=",
    //     like: "like",
    // }

    /**
     *
     *创建一个查询条件
     * @param {*} key
     * @param {*} value
     * @param {*} opetion
     * @returns Condition
     * @memberof ConditionBuilder
     */
    createCondition(key, value, operator,notEscape) {
        return new Condition(key, value, operator,notEscape);
    }

    /**
     *
     *
     * @param {*} conditions
     * @memberof ConditionBuilder
     * @returns Condition
     */

    join(conditions,seperator){
        if(seperator===undefined){
            seperator=" ";
        }
        let len = conditions.length;
        if (len <= 0) {
            return this.createCondition("", "", "");
        }
        let condition, value = "";
        for (let i = 0; i < len ; i++) {
            condition = conditions[i];
            if(this.isEmpty(condition.toString())!=true){
                value +=  condition.toString()+seperator;
            }
        }
        let reg = "("+seperator+"\\s*)$";
        value = value.replace(new RegExp(reg),"");
        return this.createCondition("", value, "",true);
    }
    or(conditions) {
        let len = conditions.length;
        if (len <= 0) {
            return this.createCondition("", "", "");
        }
        let condition, value = "";
        for (let i = 0; i < len; i++) {
            condition = conditions[i];
            if(this.isEmpty(condition.toString())!=true){
                value += " (" + condition.toString() + ") or";
            } 
        }
        value = value.replace(/(or\s*)$/,"");
        return this.createCondition("", value, "",true);
    }

    /**
     *
     *and操作符，负责将conditions以or条件连接构造成一个新的Condition;
     * @param {*} conditions
     * @returns Condition
     * @memberof ConditionBuilder
     */
    and(conditions) {
        let len = conditions.length;
        if (len <= 0) {
            return this.createCondition("", "", "");
        }
        let condition, value = "";
        for (let i = 0; i < len; i++) {
            condition = conditions[i];
            if(this.isEmpty(condition.toString())!=true){
                value += " (" + condition.toString() + ") and ";
            }
        }
        value = value.replace(/(and\s*)$/,"");
        return this.createCondition("", value, "",true);
    }
    /**
     *
     *遍历某个对象的所有自身的属性
     * @param {*} queryobj
     * @param {*} hanlder
     * @param {*} context
     * @memberof ConditionBuilder
     */
    walkQueryObj(queryobj, hanlder, context) {
        if(!queryobj){
            return ;
        }
        let keys = Object.keys(queryobj);
        let len = keys.length;
        let key, value;
        for (let i = 0; i < len; i++) {
            key = keys[i];
            value = queryobj[key];
            hanlder && hanlder.call(context, value, key, queryobj);
        }
    }


    /**
     *
     * 排序
     * @param {*} orderObj 
     * @returns
     * @memberof ConditionBuilder
     */
    orderBy(orderObj){
        let conditions =[];
        let condition;
        if(orderObj instanceof Array){
            let len = orderObj.length;
            let order=null,key,value;
            for(let i =0;i<len;i++){
                order = orderObj[i];
                key = order.key;
                value=order.value;
                if(this.isEmpty(key)!=true){
                    if(value === OrderMap.desc){
                        condition =  this.createCondition(key,""," ${key} desc");
                        if(condition.sqlAttackCheck()===true){
                            conditions.push(condition);
                        }
                        
                    }else if(value ===  OrderMap.asc){
                        condition = this.createCondition(key,""," ${key} asc");
                        if(condition.sqlAttackCheck()===true){
                            conditions.push(condition);
                        }
                    }
                
                }
            }
        }
        
        if(conditions.length>0){
           return this.createCondition("",""," ORDER BY ").join(this.join(conditions,",")); 
        }else{
            return this.createCondition("","",""); 
        }
    }


    /**
     *
     * 分组
     * @param {*} groupObj
     * @returns
     * @memberof ConditionBuilder
     */
    groupBy(groupObj){
        let condition = this.createCondition("","","");
        let property ;
        let checkedArray =[];
        if(groupObj instanceof Array){
            let len = groupObj.length;
            for(let i=0;i<len;i++){
                property =  groupObj[i];
                if(this.isEmpty(property)!=true&&condition.sqlCheck(property)){
                    checkedArray.push(property);
                }
            }
        }
        if(checkedArray.length>0){
            condition.operator = "Group By";
            condition.value = checkedArray.join(",");
        }

        return condition;
    }

    isEmpty(str){
        if(str===""||str===undefined ||str ==null){
            return true;
        }
        return false;
    }
}

let builder = new ConditionBuilder();
module.exports = builder;