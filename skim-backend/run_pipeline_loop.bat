@echo off
cd /d "C:\Users\phani\Documents\skim.yt\skim-backend"
echo ======================================= >> pipeline_worker.log
echo Worker Started: %date% %time% >> pipeline_worker.log
echo ======================================= >> pipeline_worker.log

:loop
echo [%date% %time%] Running Skim.yt real-time worker... >> pipeline_worker.log
:: Run the python pipeline infinitely. 
:: If it crashes, the script continues and loops to restart it.
call "venv\Scripts\python.exe" "pipeline.py" >> pipeline_worker.log 2>&1

echo [%date% %time%] Pipeline crashed. Restarting in 30 seconds... >> pipeline_worker.log
:: Wait 30 seconds before auto-restarting
timeout /t 30 /nobreak >nul
goto loop
