//===========================================
// グローバル状態変数
//===========================================
let currentYear;
let currentMonth;

//===========================================
// 初期化処理
//===========================================
document.addEventListener(
    "DOMContentLoaded",
    function(){

        const calendar =
            document.getElementById("emoji-calendar");

        const emojiInput =
            document.getElementById("emoji-input");

        //フローティングパレット
        const floatingPalette =
            document.getElementById(
            "floating-emoji-palette"
            );
        
        if(floatingPalette){

            floatingPalette.innerHTML =
                createEmojiInput();

        }

        if(!calendar){
            return;
        }

        const today = new Date();

        const year = today.getFullYear();
        const month = today.getMonth();

        currentYear = year;
        currentMonth = month;

        if(emojiInput){

            const isTodayMonth =
                year === today.getFullYear()
                &&
                month === today.getMonth();

        if(isTodayMonth){

            emojiInput.innerHTML =
                createEmojiInput();
            }
        }

        //集計取得
        updateCalendar();

    }
);


//===========================================
// イベントリスナー
//===========================================

//クリックイベント（月移動・絵文字送信）
document.addEventListener(

    "click",
    function(e){

//前月をクリックしたとき
    if(e.target.id === "prev-month"){

        currentMonth--;

        if(currentMonth < 0){

            currentMonth = 11;
            currentYear--;

        }  

        updateCalendar();
        return;

    }

//翌月をクリックしたとき
    if(e.target.id === "next-month"){

        currentMonth++;

            if(currentMonth > 11){

                currentMonth = 0;
                currentYear++;

            }

        updateCalendar();
        return;

    }

        //絵文字ボタンをクリックしたとき
        const button = e.target.closest(".emoji-button");

        if(button){

            const emoji =
                button.dataset.emoji;

            console.log(
                "クリック検知",
                emoji
            );

            saveEmoji(emoji);
            
        }

    }
);

//フローティングパレットのクリック処理
document.addEventListener(
    "click",
    function(e){

        if(
            e.target.closest(
                "#floating-emoji-button"
            )
        ){

            const palette =
                document.getElementById(
                    "floating-emoji-palette"
                );

            if(
                palette.style.display
                ===
                "block"
            ){

                palette.style.display =
                    "none";

            }else{

                palette.style.display =
                    "block";

            }

        }

    }
);