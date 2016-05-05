#!/bin/sh
uriPara="" # Getのパラメーター
getUri="" # GetのURI
status="" # Webサイトの表示可否の判定（◯か☓）。Getの引数じにはエンコード化
cityUri="" # CSVからパースした自治体サイトURI
encodedStGood="%E2%97%AF" # エンコード化された◯
encodedStBad="%E2%98%93" #エンコード化された☓
curlTimeout=30

function sendToSlack() { # $1: channel, $2: message

    local tmpJsonFile=$(mktemp)

    echo "payload={" > $tmpJsonFile
    echo "\"channel\": \"$1\"," >> $tmpJsonFile # チャンネルを$1から代入
    echo "\"username\": \"自治体サイトモニターbot\"," >> $tmpJsonFile
    echo "\"text\": \"$2\"," >> $tmpJsonFile # メッセージを$2から代入
    echo "\"icon_emoji\": \":warning:\"" >> $tmpJsonFile
    echo "}" >> $tmpJsonFile

    curl -m $curlTimeout -X POST $slackWebHook -d @"$tmpJsonFile"

    rm $tmpJsonFile
}

csvFile=$(mktemp)
curl -m $curlTimeout "${csvUri}" > $csvFile 2> /dev/null
echo "\n" >> $csvFile

if [ "$?" -ne 0 ]
then
    echo "Cannot download CSV File." >&2
    exit
fi

i=1 # CSVをパースする際のカウンター。シートに挿入する際の行

while read line
do
    echo "＊＊＊${i}を開始＊＊＊"
    if [ ${i} -eq 1 ] # 1行目は見出し行なのでスキップ
    then
        i=`expr $i + 1`
        continue
    fi

    if [ ${#line} -eq 0 ]; then # 空行はスキップ（本来は必要ない）
        continue
    fi

    cityName=`echo ${line} | cut -d ',' -f 2`
    cityUri=`echo ${line} | cut -d ',' -f 3`
    oldStatus=`echo ${line} | cut -d ',' -f 5`

    echo "cityName=${cityName}"

    case "${oldStatus}" in # $oldStatusをエンコード化したStatusに変換
        "◯" ) oldStatus=$encodedStGood ;;
        "☓" ) oldStatus=$encodedStBad ;;
    esac

    currentTime=`date +"%Y/%m/%d %H:%M:%S"`

    headerTemp=$(mktemp)
    curlTemp=$(mktemp)
    curl -m $curlTimeout -I -kL $cityUri -o $headerTemp -w "%{http_code}\n%{time_total}\n" 2> /dev/null 1> $curlTemp

    if [ "$?" -ne 0 ]
    then
        status=$encodedStBad
        responseTime=""
        lastModified=""
        continue
    fi

    responseCode=""
    responseTime=""

    j=0
    while read lineCurl
    do
        j=`expr $j + 1`
        case "${j}" in
            "1" ) responseCode=$lineCurl ;;
            "2" ) responseTime=$lineCurl ;;
        esac
    done < $curlTemp

    rm -f $curlTemp

    lastModified=`cat $headerTemp | grep '^Last-Modified:' | sed 's/Last-Modified: //'`
    if [ -n "${lastModified}" ]; then
        lastModified=`date "+%Y/%m/%d %H:%M:%S" -d "${lastModified}"`
        # echo "lastModifiedは空白じゃないよ"
    fi

    rm -f $headerTemp

    if [ ${responseCode} -ne 200 ]; then
        status=$encodedStBad
        responseTime=""
        lastModified=""
        continue
    fi
    
    status=$encodedStGood

    if [ "${status}" != "${oldStatus}" ]; then
        msg="${cityName} (${cityUri}) が${oldStatus}から${status}に変わりました。"
        echo $msg
        sendToSlack "#takoratta_test" "${msg}"
    fi

    uriPara="rowNum=${i}&date=${currentTime}&status=${status}&responseTime=${responseTime}&lastModified=${lastModified}"
    uriPara=`echo $uriPara | sed -e 's/ /%20/g'` #スペースをエンコード
    getUri="${uri}${uriPara}"
    curl -m $curlTimeout -X GET $getUri -o /dev/null 2> /dev/null
    echo "＊＊＊${i}が終了＊＊＊"
    i=`expr $i + 1`
done < $csvFile

rm -f $csvFile
