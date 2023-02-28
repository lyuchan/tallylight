
var xhr = new XMLHttpRequest();
var xhr2 = new XMLHttpRequest();
var xhr3 = new XMLHttpRequest();
var std_name = new Array();//name
var std_num = new Array();//name
var uuid = new Array();//name
std_num
//document.addEventListener("DOMContentLoaded", event => {
//function get() {
xhr3.open('get', 'uuid.json', true);
xhr3.send(null);
xhr3.onload = () => {
    uuid = JSON.parse(xhr3.responseText);
}
xhr2.open('get', 'std_num.json', true);
xhr2.send(null);
xhr2.onload = () => {
    std_num = JSON.parse(xhr2.responseText);
}
xhr.open('get', 'std_name.json', true);
xhr.send(null);
//}
xhr.onload = () => {
    std_name = JSON.parse(xhr.responseText);
    console.log(std_name.length)
    let text = "<span>";
    for (var i = 1; i < std_name.length; i++) {
        text += i;
        text += ".</span><span>"
        text += std_name[i]
        text += "</span><input value=\""
        text += std_num[i]
        text += "\"id=\"stdid"
        text += i
        text += " \"/><input value=\""
        text += uuid[i]
        text += "\" id=\"uuid"
        text += i
        text += "\"/><select><option>設計組</option><option>機械組</option><option>程式組</option><option>行政組</option></select><div><button class=\"success\">更新</button><button class=\"danger\"id=\"del\">刪除</button></div>"
    }

    text += "</tr></table>";
    let src2 = document.getElementById("bold");
    src2.innerHTML = text;
};//onload 資料有回傳時(readyStatus:4)就可執行function

function test() {
    let src2 = document.getElementById("uuid10");
    console.log(src2.value)
    src2.value = "helloworld"

}
