@echo off
echo.
echo ============================================
echo  PUSH KE GITHUB - website-rt04rw02
echo  https://github.com/deday-arch/website-rt04rw02
echo ============================================
echo.
cd /d "c:\web 004\rt-website"
echo Commit terbaru yang akan di-push:
git log --oneline -3
echo.
echo Memulai push...
git push origin main
echo.
if %ERRORLEVEL% == 0 (
  echo ============================================
  echo  SUKSES! File berhasil di-push ke GitHub
  echo  Website: https://deday-arch.github.io/website-rt04rw02/
  echo ============================================
) else (
  echo ============================================
  echo  Butuh autentikasi. Jalankan perintah ini:
  echo  git push origin main
  echo  Lalu login di browser yang muncul.
  echo ============================================
)
pause
