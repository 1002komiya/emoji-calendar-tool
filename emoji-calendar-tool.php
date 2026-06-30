<?php
/*
Plugin Name: Emoji Calendar Tool
Description: 絵文字を記録できるカレンダーツール
Version: 1.7.0
Author: Yamauchi Riri
*/

if (!defined('ABSPATH')) {
    exit;
}


// CSS・JS読み込み
function ect_enqueue_scripts(){

    wp_enqueue_style(
        'ect-style',
        plugin_dir_url(__FILE__) . 'assets/css/style.css'
    );

    // 定数ファイル（最初に読み込む）
    wp_enqueue_script(
        'ect-config',
        plugin_dir_url(__FILE__) . 'assets/js/config.js',
        array(),
        '1.0.0',
        true
    );

    // UI描画関数（config に依存）
    wp_enqueue_script(
        'ect-renderer',
        plugin_dir_url(__FILE__) . 'assets/js/renderer.js',
        array('ect-config'),
        '1.0.0',
        true
    );

    // API通信関数（renderer に依存）
    wp_enqueue_script(
        'ect-api',
        plugin_dir_url(__FILE__) . 'assets/js/api.js',
        array('ect-renderer'),
        '1.0.0',
        true
    );

    // メインスクリプト（すべてに依存）
    wp_enqueue_script(
        'ect-script',
        plugin_dir_url(__FILE__) . 'assets/js/script.js',
        array('ect-api'),
        '1.0.0',
        true
    );

    wp_localize_script(
        'ect-script',
        'ect_ajax',
        array(
            'url' => admin_url('admin-ajax.php')
        )
    );

}

//JSからWPでの絵文字を受け取る
add_action(
    'wp_ajax_nopriv_ect_save_emoji',
    'ect_save_emoji'
);

add_action(
    'wp_ajax_ect_save_emoji',
    'ect_save_emoji'
);


function ect_save_emoji(){

    $emoji = $_POST['emoji'];

    error_log(
        "受信した絵文字: " . $emoji
    );

    global $wpdb;

    $table_name =
        $wpdb->prefix . 'emoji_logs';

    $wpdb->insert(

        $table_name,

        array(

            'record_date' =>
                current_time('Y-m-d'),

            'emoji' =>
                $emoji,

            'is_admin' =>
                current_user_can('manage_options')
                ? 1
                : 0,

            'created_at' =>
                current_time('mysql')

        )

);

wp_send_json_success();

}

add_action(
    'wp_enqueue_scripts',
    'ect_enqueue_scripts'
);


// ショートコード
function ect_display_calendar() {

    return '
    <div id="emoji-calendar">
        <p>絵文字カレンダー読み込み中...</p>
    </div>

    <div id="emoji-input">
    </div>
    
    <div id="emoji-summary"></div>

    <div id="floating-emoji-button">
    😊
    </div>

    <div id="floating-emoji-palette">
    </div>

    ';
}

add_shortcode(
    'emoji_calendar',
    'ect_display_calendar'
);

//データベース関連
register_activation_hook(
    __FILE__,
    'ect_create_table'
);

function ect_create_table(){
    
    global $wpdb;

    $table_name =
        $wpdb->prefix . 'emoji_logs';

    $charset_collate =
        $wpdb->get_charset_collate();

    $sql = "
    CREATE TABLE $table_name (

        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        record_date DATE NOT NULL,

        emoji VARCHAR(20) NOT NULL,

        is_admin TINYINT(1) NOT NULL DEFAULT 0,

        created_at DATETIME NOT NULL,

        PRIMARY KEY (id)

    ) $charset_collate;
    ";

    require_once(
        ABSPATH .
        'wp-admin/includes/upgrade.php'
    );

    dbDelta($sql);

}

//今日の絵文字集計を返す関数
function ect_get_today_emojis(){

    global $wpdb;

    $table_name =
        $wpdb->prefix . 'emoji_logs';

    $today =
        current_time('Y-m-d');

    $results =
        $wpdb->get_results(

            $wpdb->prepare(

                "
                SELECT
                    emoji,
                    COUNT(*) as count,
                    MAX(is_admin) as admin_flag
                FROM $table_name
                WHERE record_date = %s
                GROUP BY emoji
                ORDER BY count DESC
                ",

                $today

            )

        );

    wp_send_json_success(
        $results
    );

}

add_action(
    'wp_ajax_ect_get_today_emojis',
    'ect_get_today_emojis'
);

add_action(
    'wp_ajax_nopriv_ect_get_today_emojis',
    'ect_get_today_emojis'
);

//月の絵文字集計を返す関数
function ect_get_month_emojis(){

    global $wpdb;

    $table_name =
        $wpdb->prefix . 'emoji_logs';

        $month =
            isset($_POST['month'])
            ? $_POST['month']
            : current_time('Y-m');

    $results =
        $wpdb->get_results(

            $wpdb->prepare(

                "
                SELECT
                    record_date,
                    emoji,
                    COUNT(*) as count
                FROM $table_name
                WHERE DATE_FORMAT(record_date,'%%Y-%%m') = %s
                GROUP BY record_date, emoji
                ORDER BY record_date ASC, count DESC
                ",

                $month

            )

        );

    wp_send_json_success(
        $results
    );

}

add_action(
    'wp_ajax_ect_get_month_emojis',
    'ect_get_month_emojis'
);

add_action(
    'wp_ajax_nopriv_ect_get_month_emojis',
    'ect_get_month_emojis'
);

//月間サマリーを返す関数
function ect_get_month_summary(){

    global $wpdb;

    $table_name =
        $wpdb->prefix . 'emoji_logs';

    $month =
        isset($_POST['month'])
        ? $_POST['month']
        : current_time('Y-m');

    $results =
        $wpdb->get_results(

            $wpdb->prepare(

                "
                SELECT
                    emoji,
                    COUNT(*) as count
                FROM $table_name
                WHERE DATE_FORMAT(
                    record_date,
                    '%%Y-%%m'
                ) = %s
                GROUP BY emoji
                ORDER BY count DESC
                ",

                $month

            )

        );

    wp_send_json_success(
        $results
    );

}

add_action(
    'wp_ajax_ect_get_month_summary',
    'ect_get_month_summary'
);

add_action(
    'wp_ajax_nopriv_ect_get_month_summary',
    'ect_get_month_summary'
);

//フローティングパレットを全ページに表示
function ect_render_floating_palette(){

    if(
        is_admin()
        ||
        is_404()
    ){
        return;
    }

    ?>

    <div id="floating-emoji-button">
        😊
    </div>

    <div id="floating-emoji-palette">
    </div>

    <?php

}

add_action(
    'wp_footer',
    'ect_render_floating_palette'
);