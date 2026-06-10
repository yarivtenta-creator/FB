@echo off
set DATETIME=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%
set DATETIME=%DATETIME: =0%
if not exist "backups" mkdir backups
copy "data\sdr.db" "backups\sdr_%DATETIME%.db"
echo Backup created: backups\sdr_%DATETIME%.db
pause
