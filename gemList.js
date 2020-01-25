
//__initData는 서버사이드(php)에서 가져온 데이터입니다. // var __initData = <?=json_encode($arVal)?>
$(function(){

    var qVoiceGemList = new QVoiceGemList({ });
    var isFlag = true; //스크롤 제어 플래그

    /*인터페이스*/
    window.addEventListener('scroll',_.throttle(function () { //스크롤 맨 밑
        if((window.scrollY+window.innerHeight) >= (document.body.scrollHeight-50)){
            if(!!isFlag){
                isFlag = false;
                qVoiceGemList.scrollEnd();
                isFlag = true;
            }
        }
    },100));

    $(".selection_del").click(function(){qVoiceGemList.elDelete()}) //선택 삭제 눌렀을 때
    $("#choice").click(function (){qVoiceGemList.elSelect(this)}) //전체 선택
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
                            <span class=\"txtmsg\">보석내역이 없습니다.</span>
                      </p>`
     };

    if(!!customCfg && typeof customCfg === 'object') { Object.assign(gemListCfg, customCfg);}
    var fn = this;

    //삭제
    this.elDelete = function(){
        if(_.size( $('.chk_click:checked')) ){
            $.confirmEx('선택한 내역을 삭제 하시겠습니까?',{callback2:function(){

                fn.reqSlctDel(); //삭제요청
                gemListCfg["inputTarget"].html(gemListCfg["inputTarget"].children()[0]);

                var gemListData = fn.getListData(fn.jsonCall,{ //리스트 데이터 가져오기
                    actMode:"gemList",
                    useMethod:"getGemList",
                    slct:__initData.slct,
                    pageNo:1,
                    pagePerCnt:__initData.pagePerCnt
                });
                if(_.isEmpty(gemListData)) {$("body").append(gemListCfg["noGem"]); return}; //리스트 데이터 없으면 중지

                var template = fn.makeTemplate(gemListCfg["template"],gemListData) // 템플릿 만들기
                gemListCfg["inputTarget"].append(template); //넣기
                $.toast("성공적으로 삭제 되었습니다.");

            }})
        }  else{$.alertEx('삭제 하실 내역을 한개이상</br>선택해주세요')}
    },

    //스크롤 맨끝
    this.scrollEnd = function scrollEnd(){

        var gemListData = vm.getListData(vm.jsonCall,{ //리스트 데이터 가져오기
            actMode:"gemList",
            useMethod:"getGemList",
            slct:__initData.slct,
            pageNo:gemListCfg["pageNo"],
            pagePerCnt:__initData.pagePerCnt
        }).filter(function(current){  // 중복체크
            return gemListCfg["inputTarget"].find("#choice_"+current["auto_no"]).val() !== current["auto_no"];
        });

        if(!_.isEmpty(gemListData)) {$.toast("마지막 페이지 입니다"); return};

        var template = vm.makeTemplate(gemListCfg["template"],gemListData);

        gemListCfg["inputTarget"].append(template);
        gemListCfg["pageNo"]++;
    }
    
    //전체 선택
    this.elSelect = function elSelect(el){
        if(el.checked) {
            $('.chk_click').attr('checked','checked');
        } else {
            $('.chk_click').removeAttr('checked');
        }
    }
}

/**구현 메소드**/
QVoiceGemList.prototype.reqSlctDel = function(){ //삭제요청
    var $slctItem = $('.chk_click:checked');
    this.jsonCall({actMode:"gemList",useMethod:"slctDel",slct:__initData.slct,logNo: _.map($slctItem,'value').join(',')})
}

QVoiceGemList.prototype.getListData = function(ajax,param){ //리스트 가져오기
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
            async:false, //동기처리
            timeout: 10000
        }) .fail(function(){
            $.alertEx('서버 내부 오류가 발생되었습니다.');
        });
};

QVoiceGemList.prototype.makeTemplate = function(template,data){
    var setTemplate = document.createElement('template');

    for (var i = 0; i < data.length; i++){
        setTemplate.insertAdjacentHTML('beforeend',template(data[i]));
    };
    return setTemplate.children
}





