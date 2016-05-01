#!/bin/sh
filename="klgmonitor"
uri="https://script.google.com/macros/s/xxxxxx/exec?" #xxxxxxはシートのID
getUri=""
i=2
cat klgmonitor | while read line
do
  echo $i
  echo $line
  responseCode=`curl -m 30 -kL $line -o /dev/null -w "%{http_code}" 2> /dev/null`
  if [ "$responseCode" != "200" ]
  then
    responseTime="N/A"
  else
    responseTime=`curl -m 30 -kL $line -o /dev/null -w "%{time_total}" 2> /dev/null`
  fi
  getUri="${uri}rowNum=${i}&data=${responseTime}"
  curl -m 30 -X GET $getUri -o /dev/null 2> /dev/null
  i=$(($i+1))
done