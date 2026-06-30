//絵文字ボタンを作る
function createEmojiInput(){

    let html = "";

    html += `
        <div class="emoji-buttons">
            <p>今の気分を教えて！　何回でも押せるよ！</p>
    `;


    emojiList.forEach(function(emoji){

        html += `
            <button class="emoji-button"
            data-emoji="${emoji}">
                ${emoji}
            </button>
        `;

    });


    html += `
        </div>
    `;


    return html;

}

//カレンダーを表示させる
function createCalendar(year, month,emojiData = []){

    console.log("emojiData確認");
    console.table(emojiData);
    console.log(emojiData);

    const today = new Date();

    const firstDay =
        new Date(year, month, 1)
        .getDay();

    const lastDate =
        new Date(year, month + 1, 0)
        .getDate();

    let html = "";

    html += `
        <div class="calendar-header">

            <button id="prev-month">
                ← 前月
            </button>

            <h3>
                ${year}年${month + 1}月
            </h3>

            <button id="next-month">
                翌月 →
            </button>

        </div>
    `;


    html += `
    <table class="calendar">
    <tr>
    <th>日</th>
    <th>月</th>
    <th>火</th>
    <th>水</th>
    <th>木</th>
    <th>金</th>
    <th>土</th>
    </tr>
    `;


    let day = 1;


    for(let row = 0; row < 6; row++){

        html += "<tr>";


        for(let col = 0; col < 7; col++){


            if(row === 0 && col < firstDay){

                html += "<td></td>";

            }
            else if(day > lastDate){

                html += "<td></td>";

            }
            else {

                const dateString =
                    `${year}-${
                        String(month + 1).padStart(2, "0")
                        }-${
                        String(day).padStart(2, "0")
                    }`;

                const dayEmojis =
                    emojiData.filter(item =>
                        item.record_date === dateString
                        );

                console.log(dateString, dayEmojis);

                const remaining = dayEmojis.length - 3;

                const detailHtml =
                                    `
                                <div class="emoji-detail-list">
                                    ${
                                    dayEmojis
                                        .map(item => `
                                        <div>
                                            ${item.emoji}
                                            ${item.count}
                                        </div>
                                    `)
                                    .join("")
                                    }
                                </div>
                                `;

                let cellContent = day;

                if(dayEmojis.length > 0){

                    cellContent = `
                        <div class="date-number">
                            ${day}
                        </div>

                        <div class="emoji-summary">
                    `;

                    //トップ３件の絵文字のみ表示
                    const topEmojis = dayEmojis.slice(0, 3);
                    topEmojis.forEach(function(item){

                        cellContent += `
                            <span class="emoji-summary-item">
                            ${item.emoji}
                            ${item.count}
                            </span>
                        `;
                    
                    });

                    cellContent += `
                        </div>
                    `;

                    //残りの絵文字はその他のものとして表示する
                    if(remaining > 0){

                        cellContent += `
                            <details class="emoji-more">

                                <summary>
                                    全部見る
                                </summary>

                                ${detailHtml}

                            </details>
                        `;
                    }      
             
                }

               //日付が今日の時だけセルの色を変える
                let cellClass = "";

                if(

                    year === today.getFullYear()
                    &&
                    month === today.getMonth()
                    &&
                    day === today.getDate()

                ){
                    cellClass = "today-cell";
                }

                html += `
                <td class="${cellClass}">
                    ${cellContent}
                </td>
                `;

                day++;

            }

        }

        html += "</tr>";

    }


    html += "</table>";


    return html;

}

//「送ったよ」と通知する際の処理
function showEctNotice(message){

    const oldNotice =
        document.querySelector(
            ".ect-notice"
        );

    if(oldNotice){
        oldNotice.remove();
    }


    const notice =
        document.createElement("div");

    notice.textContent =
        message;

    notice.className =
        "ect-notice";


    document.body.appendChild(
        notice
    );


    setTimeout(function(){

        notice.remove();

    },2000);

}
