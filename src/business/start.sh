#!/bin/sh 
#update project config
configFileName=$(pwd)/src/business/conf.properties
logFileName=$(pwd)/src/business/log4j.properties
path=` echo $2 | sed 's#\/#\\\/#g'`
sed -i 's/log4j.appender.DAILY_ROLLING_FILE.File=.*/log4j.appender.DAILY_ROLLING_FILE.File='$path'/' $logFileName
sed -i 's/HOSTNAME=.*/HOSTNAME='$1'/' $configFileName
sed -i 's/DATA_SERVER_URL=.*/DATA_SERVER_URL=http:\/\/'$1':4201/' $configFileName
java -jar $(pwd)/src/business/business.jar $configFileName & 
