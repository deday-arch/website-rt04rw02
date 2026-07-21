@echo off
echo ================================================
echo  Upload ke GitHub - RT 04 RW 02 Jombang Ciputat
echo ================================================
echo.
echo Menghubungkan ke: https://github.com/deday-arch/rt04rw02-jombang
echo.
git push -u origin main
echo.
if %ERRORLEVEL% == 0 (
  echo ================================================
  echo  SUKSES! File berhasil diupload ke GitHub
  echo  URL: https://github.com/deday-arch/rt04rw02-jombang
  echo ================================================
) else (
  echo ================================================
  echo  GAGAL! Silakan login GitHub di browser lalu
  echo  jalankan: git push -u origin main
  echo ================================================
)
pause
