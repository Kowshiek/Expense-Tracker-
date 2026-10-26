@echo off
echo ==============================================
echo  SpendWise - Sync Codebase to GitHub
echo  Repository: https://github.com/Kowshiek/Expense-Tracker-
echo ==============================================

git add .
git commit -m "Update Expense Tracker: 12:01 AM daily cycle, UPI auto-detection, Chrome PWA install, and GitHub cloud sync"
git branch -M main
git push -u origin main

echo.
echo ==============================================
echo  Sync completed!
echo ==============================================
pause
