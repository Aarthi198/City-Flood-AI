@echo off
setlocal

REM CityFlood AI - Train model and start Flask API
REM Usage:
REM   cd /d "C:\Users\Admin\Desktop\ML -FLOOD\ml-model"
REM   run_all.bat

cd /d "%~dp0"

echo Installing requirements (if needed)...
python -m pip install -r requirements.txt
if errorlevel 1 goto :fail

echo.
echo Training model...
python train.py
if errorlevel 1 goto :fail

echo.
echo Starting API at http://127.0.0.1:5000 ...
python app.py
goto :eof

:fail
echo.
echo ERROR: Step failed. Check the output above.
exit /b 1

