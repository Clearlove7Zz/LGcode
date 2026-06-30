@echo off
setlocal
for %%I in ("%~dp0..") do cd /d "%%~fI"
"%USERPROFILE%\.bun\bin\bun.exe" run --conditions=browser src\index.ts %*
