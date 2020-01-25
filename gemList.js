
//__initData�� �������̵�(php)���� ������ �������Դϴ�. // var __initData = <?=json_encode($arVal)?>
$(function(){

    var qVoiceGemList = new QVoiceGemList({ });
    var isFlag = true; //��ũ�� ���� �÷���

    /*�������̽�*/
    window.addEventListener('scroll',_.throttle(function () { //��ũ�� �� ��
        if((window.scrollY+window.innerHeight) >= (document.body.scrollHeight-50)){
            if(!!isFlag){
                isFlag = false;
                qVoiceGemList.scrollEnd();
                isFlag = true;
            }
        }
    },100));

    $(".selection_del").click(function(){qVoiceGemList.elDelete()}) //���� ���� ������ ��
    $("#choice").click(function (){qVoiceGemList.elSelect(this)}) //��ü ����
})

function QVoiceGemList(customCfg){
    var gemListCfg = {
        inputTarget : $(".tbl_type2 tbody"),
        pageNo      : __initData.pageNo,
        virtualEl   : document.createElement('template'),
        template    : function(data){
           return ` <tr>
                   <td><div style="margin:0 0 0 5px"><input type="checkbox" name="chk[]" id="choice_${data.auto_no}" value="${data.auto_no}" class="chk_click"><label for="choice_${data.auto_no}"></label></div></td> 
                   <td>
                       <p style="margin:0 5px 0 0">
                           <span>${data.ins_date ? (function(ins_date){
                                       var t = new Date(ins_date.replace(/-/g, '/'));
                                       var month = ("0" + (t.getMonth()+1)).slice(-2);
                                       var day = ("0" + t.getDate()).slice(-2);
                                       var hour = ("0" + t.getHours()).slice(-2);
                                       var minute = ("0" + t.getMinutes()).slice(-2);
                                       return month + "-" + day + " " + hour + ":" + minute;
                                    })(data.ins_date) : ""}
                           </span>
                       </p>
                   </td>
                   <td class="bold">${data.chng_title}</td>
                   <td class="bold number ${data.mem_chng_slct === '+' ? 'plus' : 'minus'}">${data.mem_chng_slct}${data.mem_jewel}</td>
                   </tr>`
                   },
        noGem :     `<p class="sign_empty">
                            <img src=\"http://image\">
                            <span class=\"txtmsg\">���������� �����ϴ�.</span>
                      </p>`
     };

    if(!!customCfg && typeof customCfg === 'object') { Object.assign(gemListCfg, customCfg);}
    var fn = this;

    //����
    this.elDelete = function(){
        if(_.size( $('.chk_click:checked')) ){
            $.confirmEx('������ ������ ���� �Ͻðڽ��ϱ�?',{callback2:function(){

                fn.reqSlctDel(); //������û
                gemListCfg["inputTarget"].html(gemListCfg["inputTarget"].children()[0]);

                var gemListData = fn.getListData(fn.jsonCall,{ //����Ʈ ������ ��������
                    actMode:"gemList",
                    useMethod:"getGemList",
                    slct:__initData.slct,
                    pageNo:1,
                    pagePerCnt:__initData.pagePerCnt
                });
                if(_.isEmpty(gemListData)) {$("body").append(gemListCfg["noGem"]); return}; //����Ʈ ������ ������ ����

                var template = fn.makeTemplate(gemListCfg["template"],gemListData) // ���ø� �����
                gemListCfg["inputTarget"].append(template); //�ֱ�
                $.toast("���������� ���� �Ǿ����ϴ�.");

            }})
        }  else{$.alertEx('���� �Ͻ� ������ �Ѱ��̻�</br>�������ּ���')}
    },

    //��ũ�� �ǳ�
    this.scrollEnd = function scrollEnd(){

        var gemListData = vm.getListData(vm.jsonCall,{ //����Ʈ ������ ��������
            actMode:"gemList",
            useMethod:"getGemList",
            slct:__initData.slct,
            pageNo:gemListCfg["pageNo"],
            pagePerCnt:__initData.pagePerCnt
        }).filter(function(current){  // �ߺ�üũ
            return gemListCfg["inputTarget"].find("#choice_"+current["auto_no"]).val() !== current["auto_no"];
        });

        if(!_.isEmpty(gemListData)) {$.toast("������ ������ �Դϴ�"); return};

        var template = vm.makeTemplate(gemListCfg["template"],gemListData);

        gemListCfg["inputTarget"].append(template);
        gemListCfg["pageNo"]++;
    }
    
    //��ü ����
    this.elSelect = function elSelect(el){
        if(el.checked) {
            $('.chk_click').attr('checked','checked');
        } else {
            $('.chk_click').removeAttr('checked');
        }
    }
}

/**���� �޼ҵ�**/
QVoiceGemList.prototype.reqSlctDel = function(){ //������û
    var $slctItem = $('.chk_click:checked');
    this.jsonCall({actMode:"gemList",useMethod:"slctDel",slct:__initData.slct,logNo: _.map($slctItem,'value').join(',')})
}

QVoiceGemList.prototype.getListData = function(ajax,param){ //����Ʈ ��������
    var rtnAjaxData = this.jsonCall(param).responseText;
    return JSON.parse(rtnAjaxData)[1];

}
    // json call ui
QVoiceGemList.prototype.jsonCall = function(param) {
        return $.ajax({
            type: 'post',
            dataType: 'json',
            url: '/',
            data: param,
            async:false, //����ó��
            timeout: 10000
        }) .fail(function(){
            $.alertEx('���� ���� ������ �߻��Ǿ����ϴ�.');
        });
};

QVoiceGemList.prototype.makeTemplate = function(template,data){
    var setTemplate = document.createElement('template');

    for (var i = 0; i < data.length; i++){
        setTemplate.insertAdjacentHTML('beforeend',template(data[i]));
    };
    return setTemplate.children
}





