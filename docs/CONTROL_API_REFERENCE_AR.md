# 📡 مرجع Control API

خدمة HTTP تعمل على سيرفر المرايا (المنفذ 8787 افتراضياً).
كل الطلبات (ما عدا `/health`) تتطلّب رأس:

```
Authorization: Bearer <CONTROL_API_TOKEN>
```

## Endpoints

### `GET /health`
فحص حياة الخدمة. **لا يحتاج توكن**.
```json
{ "ok": true, "time": "2026-..." }
```

### `GET /projects`
قائمة كل المشاريع المُمَرآة.
```json
{ "projects": [{ "name": "...", "commit": "...", "branch": "main" }] }
```

### `POST /sync`
مزامنة (clone أو pull) لمشروع.
```json
// body
{ "name": "carwashpro", "repo": "https://github.com/u/r", "branch": "main" }

// response
{ "ok": true, "duration_ms": 1234, "commit": "abc...", "output": "..." }
```

### `GET /status/:name`
حالة مشروع وآخر 5 commits.

## أمثلة

```bash
TOKEN="..."
curl -H "Authorization: Bearer $TOKEN" http://213.156.133.94:8787/projects

curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-app","repo":"https://github.com/u/my-app","branch":"main"}' \
  http://213.156.133.94:8787/sync
```