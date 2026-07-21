@echo off
color 0A
echo.
echo =====================================================
echo   PUSH KE GITHUB - RT 04 RW 02 JOMBANG CIPUTAT
echo =====================================================
echo.
echo Ada 4 commit yang BELUM ter-push ke GitHub:
echo  - Fix CSS dari nol (tampilan)
echo  - Perbaikan responsive + tab
echo  - Update canonical URL + 404
echo  - Add .nojekyll (fix asset loading)
echo.
echo CARA 1: Langsung push (jika sudah pernah login):
echo -----------------------------------------------
cd /d "c:\web 004\rt-website"
git push origin main
echo.
if %ERRORLEVEL% == 0 (
  color 0A
  echo =====================================================
  echo  SUKSES! Semua file berhasil di-push ke GitHub!
  echo  Tunggu 1-2 menit lalu buka:
  echo  https://deday-arch.github.io/rt04rw02-jombang/
  echo =====================================================
) else (
  color 0C
  echo.
  echo  GAGAL! Butuh login GitHub.
  echo.
  echo CARA 2: Gunakan Personal Access Token
  echo ----------------------------------------
  echo 1. Buka: https://github.com/settings/tokens/new
  echo 2. Centang 'repo' - klik Generate token
  echo 3. Copy token, lalu jalankan perintah ini:
  echo.
  echo    git push https://deday-arch:TOKEN@github.com/deday-arch/rt04rw02-jombang.git main
  echo.
  echo    (ganti TOKEN dengan token yang dicopy)
  echo.
  echo CARA 3: GitHub CLI
  echo ----------------------------------------
  echo 1. Install: winget install GitHub.cli
  echo 2. Login:   gh auth login
  echo 3. Push:    git push origin main
)
echo.
pause
