//カレンダーをアプデする
function updateCalendar(){

    const year = currentYear;
    const month = currentMonth;

    fetch(
        ect_ajax.url,
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/x-www-form-urlencoded"
            },

            body:
                "action=ect_get_month_emojis"
                + "&month="
                + encodeURIComponent(
                `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
)
        }
    )

    .then(response => response.text())

    .then(data => {

        const result =
            JSON.parse(data);

        const calendar =
            document.getElementById("emoji-calendar");
        
        if(!calendar){
            return;
        }

        console.log(result.data);

        calendar.innerHTML =
            createCalendar(
                year,
                month,
                result.data
            );
        updateSummary();

    });

}

//月間サマリーのアプデ
function updateSummary(){

    fetch(
        ect_ajax.url,
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/x-www-form-urlencoded"
            },

            body:
                "action=ect_get_month_summary"
                + "&month="
                + encodeURIComponent(
                    `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}`
                )

        }
    )

    .then(response => response.text())

    .then(data => {

        const result =
            JSON.parse(data);

        const summary =
            document.getElementById(
                "emoji-summary"
            );

        console.log(
            result.data
        );

    let html = `
        <details class="month-summary">

            <summary>
                今月のサマリー
            </summary>

            <div class="summary-content">
        `;

    //月間サマリー上位３つを表示
    const topItems =
        result.data.slice(0, 3);

        topItems.forEach(function(item){

        html += `
            <div class="summary-item">
                ${item.emoji}
                ${item.count}回
            </div>
        `;

        });

        const remaining =
            result.data.length - 3;
        
        if(remaining > 0){
            html += `

            <details class="summary-more">

                <summary>
                    全部見る
                </summary>

            `;

            result.data.forEach(function(item){
                html += `
                    <div class="summary-item">
                        ${item.emoji}
                        ${item.count}回
                    </div>
                `;
            });

        html += `
            </details>
        `;

        }

        html += `
        </div>
    </details>
`;

        summary.innerHTML = html;        

    });

}

//絵文字をサーバーに送信する
function saveEmoji(emoji){

    fetch(
        ect_ajax.url,
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/x-www-form-urlencoded"
            },

            body:
                "action=ect_save_emoji&emoji="
                + encodeURIComponent(emoji)
        }
    )

    .then(response => response.text())
    .then(data => {
        console.log("PHP応答:", data);

        showEctNotice(
            emoji + "を送ったよ！"
        );

        updateCalendar();
    })

    .catch(error => {
        console.error("通信エラー:", error);
    });

}
