# عزم — iOS

يبني GitHub Actions تطبيق الآيفون من نفس ملفات الموقع ويرفعه على TestFlight مع كل تحديث.

الأسرار المطلوبة في إعدادات المستودع (Settings → Secrets and variables → Actions):
- `ASC_KEY_ID`, `ASC_ISSUER_ID`: من App Store Connect → Users and Access → Integrations → App Store Connect API
- `ASC_KEY_P8`: محتوى ملف AuthKey_XXXX.p8 كامل
- `APPLE_TEAM_ID`: من developer.apple.com → Membership
