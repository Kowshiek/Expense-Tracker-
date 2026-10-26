Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " SpendWise - Sync Codebase to GitHub" -ForegroundColor Green
Write-Host " Repository: https://github.com/Kowshiek/Expense-Tracker-" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Cyan

git add .
git commit -m "Update Expense Tracker: 12:01 AM daily cycle, UPI auto-detection, Chrome PWA install, and GitHub cloud sync"
git branch -M main
git push -u origin main

Write-Host "Sync process complete!" -ForegroundColor Green
