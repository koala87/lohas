#!/bin/sh
$1/bin/shutdown.sh
ps -ef | grep 'tomcat' | grep -v grep| awk '{print $2}' | xargs kill -9
