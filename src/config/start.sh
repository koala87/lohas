#!/bin/sh 
#update project config
configFileName=$(pwd)/src/config/LHInfoServerConfig/WEB-INF/classes/conf.properties
logFileName=$(pwd)/src/config/LHInfoServerConfig/WEB-INF/classes/log4j.properties
echo $logFileName
path=` echo $2 | sed 's#\/#\\\/#g'`
sed -i 's/log4j.appender.DAILY_ROLLING_FILE.File=.*/log4j.appender.DAILY_ROLLING_FILE.File='$path'/' $logFileName
sed -i 's/HOSTNAME=.*/HOSTNAME='$1'/' $configFileName
sed -i 's/CONFIG_API_SERVER=.*/CONFIG_API_SERVER=http:\/\/'$1':4201/' $configFileName

#update tomcat
sed -i '/\<Context/d' $3/conf/Catalina/localhost/ROOT.xml
echo '<Context path="/" docBase="'$(pwd)'/src/config/LHInfoServerConfig/" privileged="true" reloadable="false"></Context>' >> $3/conf/Catalina/localhost/ROOT.xml
#start tomcar
$3/bin/startup.sh

